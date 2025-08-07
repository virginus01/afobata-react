import { api_response } from '@/app/helpers/api_response';
import { getSiteKeys } from '@/app/helpers/getSiteKeys';
import { invalid_response } from '@/app/helpers/invalid_response';

import { findMissingFields } from '@/helpers/findMissingFields';

export async function queryPaystack(ref: string) {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret;
    const url = `https://api.paystack.co/transaction/verify/${ref}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
      },
    });

    if (!response.ok) {
      return {
        status: false,
        msg: response.statusText,
        data: {},
      };
    }

    const res = await response.json();

    if (res.status === false) {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    } else {
      return {
        status: true,
        msg: 'fetched',
        data: res.data,
      };
    }
  } catch (error: any) {
    console.error('Error querying Paystack:', error.message);
    return { status: false };
  }
}

export async function fetchBanks(country?: string) {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystack;
    const url = `https://api.paystack.co/bank`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
      },
    });

    const res = await response.json();

    if (res.status) {
      return api_response({ data: res.data, success: true, status: true });
    } else {
      return invalid_response(res.message);
    }
  } catch (error) {
    console.error('Error fetching banks from Paystack:', error);
    return invalid_response('Error fetching banks from Paystack');
  }
}

export async function validateAccountNumber(accountNumber: string, bankCode: string) {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret;
    const url = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
      },
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'Account validated successfully',
        data: res.data,
      };
    } else {
      console.error(res.message);
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    }
  } catch (error) {
    console.error('Error validating account number with Paystack:', error);
    return { status: false };
  }
}

// Assign Dedicated Virtual Account (DVA)
export async function assignDedicatedAccount(dvaDetails: {
  customer_code?: string;
  preferred_bank?: string; // Optional: preferred bank name
  country: string; // Country code (e.g., 'NG' for Nigeria)
  first_name: string;
  last_name: string;
  phone?: string; // Optional phone number
  email: string;
  bvn?: string;
  account_number?: string;
  bank_code?: string;
}) {
  try {
    const customerCreation = await createPaystackCustomer(dvaDetails);

    if (!customerCreation.status) {
      return {
        status: false,
        msg: customerCreation.msg,
        data: {},
      };
    }
    const customerId = customerCreation.data.customer_code;
    dvaDetails.customer_code = customerId;

    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret;
    const url = `https://api.paystack.co/dedicated_account/assign`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dvaDetails),
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'Dedicated account assigned successfully',
        data: { ...res.data, customerId },
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    }
  } catch (error) {
    console.error('Error assigning dedicated account with Paystack:', error);
    return { status: false, msg: 'Error assigning dedicated account' };
  }
}

export async function initiatePaystckTransfer({
  recipientCode,
  amount,
}: {
  recipientCode: string;
  amount: number;
}) {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = process.env.PAYSTACK_LIVE_KEY || paystackKey.paystackSecret;

    if (!pKey || !pKey.startsWith('sk_')) {
      throw new Error('Invalid Paystack secret key');
    }

    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amount * 100,
        recipient: recipientCode,
        reason: 'Payment for services',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to initiate transfer:', data.message);
      return {
        status: false,
        msg: 'Error initiating transfer',
        error: data.message || 'Unknown error',
      };
    }

    return data;
  } catch (error: any) {
    console.error('Error initiating Paystack transfer:', error);
    return {
      status: false,
      msg: 'Error initiating transfer',
      error: error.message || 'Unknown error',
    };
  }
}

export async function createTransferRecipient({
  name,
  accountNumber,
  bankCode,
}: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<any> {
  const missing = findMissingFields({
    name,
    accountNumber,
    bankCode,
  });
  if (missing) {
    console.error(missing, 'missing');
    return null;
  }

  try {
    const paystackKey = await getSiteKeys();
    const pKey = process.env.PAYSTACK_LIVE_KEY || paystackKey.paystackSecret;

    if (!pKey || !pKey.startsWith('sk_')) {
      throw new Error('Invalid Paystack secret key');
    }

    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Failed to create transfer recipient:', data.message);
      console.error('Response status:', response.status);
      console.error('Full response:', data);
      throw new Error(data.message || 'Failed to create transfer recipient');
    }

    return data.data.recipient_code || null;
  } catch (error) {
    console.error('Error creating transfer recipient:', error);
    return null;
  }
}
export async function verifyPaystackTransfer(transferCode: string) {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret;
    const url = `https://api.paystack.co/transfer/verify/${transferCode}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();

    if (res.status === false) {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    } else {
      return {
        status: true,
        msg: 'Transfer verification successful',
        data: res.data,
      };
    }
  } catch (error) {
    console.error('Error verifying Paystack transfer:', error);
    return { status: false, msg: 'Error verifying transfer' };
  }
}

export async function validateNIN(nin: string) {
  // Validate the input NIN
  if (!nin || typeof nin !== 'string' || !/^\d{11}$/.test(nin)) {
    console.error('Invalid NIN: Must be an 11-digit string');
    return { status: false, msg: 'NIN Validation Failed', data: {} };
  }

  try {
    const apiKey = await getSiteKeys();
    const pKey = apiKey.paystackSecret; // Replace with your API's key if not Paystack
    const url = `https://api.paystack.co/nin/validate/${nin}`; // Replace with the correct NIN validation endpoint

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
      },
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'NIN validation successful',
        data: res.data,
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    }
  } catch (error) {
    console.error('Error validating NIN:', error);
    return { status: false, msg: 'Error validating NIN', data: {} };
  }
}

export async function validateBVN(bvn: string) {
  // Validate the input BVN
  if (!bvn || typeof bvn !== 'string' || !/^\d{11}$/.test(bvn)) {
    console.error('Invalid BVN: Must be an 11-digit string');
    return { status: false, msg: 'Invalid BVN format', data: {} };
  }

  try {
    const apiKey = await getSiteKeys();
    const pKey = apiKey.paystackSecret; // Replace with your API's key if not Paystack
    const url = `https://api.paystack.co/bvn/resolve/${bvn}`; // Replace with the correct BVN validation endpoint

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
      },
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'BVN validation successful',
        data: res.data,
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    }
  } catch (error) {
    console.error('Error validating BVN:', error);
    return { status: false, msg: 'Error validating BVN', data: {} };
  }
}

export async function validateCustomerBVN({
  customerCode,
  country,
  type,
  accountNumber,
  bvn,
  bankCode,
  firstName,
  lastName,
}: {
  customerCode?: string;
  country: string;
  type: string;
  accountNumber: string;
  bvn: string;
  bankCode: string;
  firstName: string;
  lastName: string;
}) {
  const missing = findMissingFields({
    country,
    type,
    accountNumber,
    bvn,
    bankCode,
    firstName,
    lastName,
    customerCode,
  });

  if (missing) {
    console.error(missing, 'Missing required fields for bvn');
    return { status: false, msg: 'Missing required fields', data: {} };
  }

  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret; // Replace with your actual secret key
    const url = `https://api.paystack.co/bvn/match`;

    const body = {
      country,
      type,
      account_number: accountNumber,
      bvn,
      bank_code: bankCode,
      first_name: firstName,
      last_name: lastName,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'Customer identity validation successful',
        data: res.data,
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    }
  } catch (error) {
    console.error('Error validating customer identity:', error);
    return {
      status: false,
      msg: 'Error validating customer identity',
      data: {},
    };
  }
}

export async function validateCustomerNIN({
  customerCode,
  country,
  type,
  accountNumber,
  nin,
  bankCode,
  firstName,
  lastName,
}: {
  customerCode?: string;
  country: string;
  type: string;
  accountNumber: string;
  nin: string;
  bankCode: string;
  firstName: string;
  lastName: string;
}) {
  // Validate required fields
  if (!customerCode || typeof customerCode !== 'string') {
    console.error('Invalid customer code');
    return { status: false, msg: 'Invalid customer code', data: {} };
  }

  if (!country || !type || !accountNumber || !nin || !bankCode || !firstName || !lastName) {
    console.error('Missing required fields for customer identity validation');
    return { status: false, msg: 'Missing required fields', data: {} };
  }

  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret; // Replace with your actual secret key
    const url = `https://api.paystack.co/nin/match`;

    const body = {
      country,
      type,
      account_number: accountNumber,
      nin,
      bank_code: bankCode,
      first_name: firstName,
      last_name: lastName,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'Customer NIN validation successful',
        data: res.data,
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    }
  } catch (error) {
    console.error('Error validating customer NIN:', error);
    return {
      status: false,
      msg: 'Error validating customer NIN',
      data: {},
    };
  }
}

export async function getAllVirtualAccounts() {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret;
    const url = `https://api.paystack.co/dedicated_account`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'Virtual accounts retrieved successfully',
        data: res.data,
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: [],
      };
    }
  } catch (error) {
    console.error('Error retrieving virtual accounts:', error);
    return {
      status: false,
      msg: 'Error retrieving virtual accounts',
      data: [],
    };
  }
}

export async function checkDedicatedAccountStatus(customer_code: string) {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret;
    const url = `https://api.paystack.co/dedicated_account`;

    const response = await fetch(`${url}?customer=${customer_code}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'Dedicated account status retrieved',
        data: res.data,
        isAssigned: res.data.length > 0,
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: null,
        isAssigned: false,
      };
    }
  } catch (error) {
    console.error('Error checking dedicated account status:', error);
    return {
      status: false,
      msg: 'Error checking dedicated account status',
      data: null,
      isAssigned: false,
    };
  }
}

export async function createPaystackCustomer(customerDetails: {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}) {
  try {
    const paystackKey = await getSiteKeys();
    const pKey = paystackKey.paystackSecret;
    const url = `https://api.paystack.co/customer`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerDetails),
    });

    const res = await response.json();

    if (res.status) {
      return {
        status: true,
        msg: 'Customer created successfully',
        data: res.data,
      };
    } else {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    }
  } catch (error) {
    console.error('Error creating Paystack customer:', error);
    return { status: false, msg: 'Error creating customer' };
  }
}
