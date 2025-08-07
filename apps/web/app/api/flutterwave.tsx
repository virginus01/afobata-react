import { api_response } from '@/app/helpers/api_response';
import { getSiteKeys } from '@/app/helpers/getSiteKeys';
import { invalid_response } from '@/app/helpers/invalid_response';

export async function queryFlutterwave(ref: string) {
  try {
    const flutterwaveKey = await getSiteKeys();
    const pKey = flutterwaveKey.flutterwaveSecret;
    const url = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${ref}`;

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

    if (!res.status) {
      return {
        status: false,
        msg: res.message,
        data: {},
      };
    } else {
      return {
        status: true,
        msg: 'Fetched',
        data: res.data,
      };
    }
  } catch (error: any) {
    console.error('Error querying Flutterwave:', error.message);
    return { status: false };
  }
}

export async function fetchBanks(country?: string) {
  try {
    const flutterwaveKey = await getSiteKeys();
    const pKey = flutterwaveKey.flutterwaveSecret;
    const url = `https://api.flutterwave.com/v3/banks/${country || 'NG'}`;

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
    console.error('Error fetching banks from Flutterwave:', error);
    return invalid_response('Error fetching banks from Flutterwave');
  }
}

export async function validateAccountNumber(accountNumber: string, bankCode: string) {
  try {
    const flutterwaveKey = await getSiteKeys();
    const pKey = flutterwaveKey.flutterwaveSecret;
    const url = `https://api.flutterwave.com/v3/charges/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;

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
    console.error('Error validating account number with Flutterwave:', error);
    return { status: false };
  }
}

// Assign Dedicated Virtual Account (DVA)
export async function assignDedicatedAccount(dvaDetails: any) {
  try {
    const flutterwaveKey = await getSiteKeys();
    const pKey = flutterwaveKey.flutterwaveSecret;
    const url = `https://api.flutterwave.com/v3/dedicated_account/assign`;

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
    console.error('Error assigning dedicated account with Flutterwave:', error);
    return { status: false, msg: 'Error assigning dedicated account' };
  }
}

export async function initiateTransfer({
  recipientCode,
  amount,
}: {
  recipientCode: string;
  amount: number;
}) {
  try {
    const flutterwaveKey = await getSiteKeys();
    const pKey = flutterwaveKey.flutterwaveSecret;

    const response = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: recipientCode,
        amount: amount,
        currency: 'NGN',
        tx_ref: `transfer-${Date.now()}`,
        reason: 'Payment for services',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initiate transfer');
    }

    return data;
  } catch (error) {
    console.error('Error initiating transfer:', error);
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
  // Input validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    console.error('Invalid name: Name must be a non-empty string');
    return null;
  }
  if (!accountNumber || typeof accountNumber !== 'string' || !/^\d{10}$/.test(accountNumber)) {
    console.error('Invalid account number: Must be a 10-digit string');
    return null;
  }
  if (!bankCode || typeof bankCode !== 'string' || !/^\d{3}$/.test(bankCode)) {
    console.error('Invalid bank code: Must be a 3-digit string');
    return null;
  }

  try {
    const flutterwaveKey = await getSiteKeys();
    const pKey = flutterwaveKey.flutterwaveSecret;

    const response = await fetch('https://api.flutterwave.com/v3/transferrecipient', {
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
      throw new Error(data.message || 'Failed to create transfer recipient');
    }

    return data.data.recipient_code || null;
  } catch (error) {
    console.error('Error creating transfer recipient:', error);
    return null;
  }
}

export async function verifyFlutterwaveTransfer(transferCode: string) {
  try {
    const flutterwaveKey = await getSiteKeys();
    const pKey = flutterwaveKey.flutterwaveSecret;
    const url = `https://api.flutterwave.com/v3/transfers/verify/${transferCode}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pKey}`,
      },
    });

    const res = await response.json();

    if (!res.status) {
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
    console.error('Error verifying Flutterwave transfer:', error);
    return { status: false, msg: 'Error verifying transfer' };
  }
}
