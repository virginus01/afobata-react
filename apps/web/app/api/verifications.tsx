import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import {
  assignDedicatedAccount,
  checkDedicatedAccountStatus,
  validateAccountNumber,
  validateCustomerBVN,
  validateNIN,
} from '@/api/paystack';
import { initializeCBK } from '@/api/thirdparty/clubkonnect/clubkonnet';
import { upsert } from '@/api/database/mongodb';

export async function verifications(id: string, spId: string, type: string) {
  switch (type) {
    case 'electric':
      return verify_disco(id, spId);

    case 'tv':
      return verify_tv(id, spId);

    case 'acc_num':
      return validate_acc_num(id, spId);
  }
}

export async function validate_acc_num(id: string, spId: string) {
  try {
    const val = await validateAccountNumber(id, spId);

    if (val.status) {
      return api_response({
        data: val.data.account_name,
        status: true,
        success: true,
      });
    } else {
      return invalid_response("account can't be validated", 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error validating account');
  }
}

export async function verify_tv(id: string, spId: string) {
  try {
    const url = `${await initializeCBK({
      route: 'APIVerifyCableTVV1.0.asp',
    })}&CableTV=${spId}&SmartCardNo=${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();

    if (res && res.customer_name && res.status === '00') {
      return api_response({
        status: true,
        success: true,
        data: res.customer_name,
        msg: `${res.customer_name} Successfully Validated`,
      });
    } else {
      console.error(res.status);
      return invalid_response('customer not found', 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error validating iuc number');
  }
}

export async function verify_disco(id: string, spId: string) {
  try {
    const url = `${await initializeCBK({
      route: 'APIVerifyElectricityV1.asp',
    })}&ElectricCompany=${spId}&meterno=${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();

    if (res && res.customer_name && res.status === '00') {
      return api_response({
        status: true,
        success: true,
        data: res.customer_name,
        msg: `${res.customer_name} Successfully Validated`,
      });
    } else {
      console.error(res);
      return invalid_response('customer not found', 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error validating customer id');
  }
}

export async function bvnVerification({
  data,
  user,
  auth,
  tierData,
  firstName,
  lastName,
  siteInfo,
  generateVa = true,
  vaSp,
  wallet,
}: {
  data: any;
  user: UserTypes;
  auth: AuthModel;
  tierData: _Level;
  firstName: string;
  lastName: string;
  siteInfo: BrandType;
  generateVa: boolean;
  vaSp: 'paystack' | 'safeHeaven_d' | 'safeHeaven_v';
  wallet: string;
}) {
  let response: any = {};
  let verify: any = { status: false, msg: 'verification not successful', data: {} };

  if (process.env.NODE_ENV === 'development') {
    verify = { status: true, msg: 'verification successful', data: {} };
  } else {
    verify = await validateCustomerBVN({
      customerCode: data.accountNumber,
      country: user.country ?? '',
      type: 'bank_account',
      accountNumber: data.accountNumber,
      bvn: data.bvn,
      bankCode: data.bankCode,
      firstName,
      lastName,
    });
  }

  if (verify?.data?.is_blacklisted) {
    verify = { status: true, msg: 'BVN not okay please contact your bank', data: verify.data };
  } else if (verify.status && !verify?.data?.is_blacklisted) {
    verify.data = {
      bvn: {
        status: verify.status,
        verifiedAt: Date.now(),
        ...verify.data,
        ...data,
      },
    };
  }

  response = verify;

  return response;
}

export const validateCustomerPhone = async ({
  country,
  phone,
}: {
  country: string;
  phone: string;
}) => {
  try {
    let verify = { status: true, msg: 'verification successful', data: {} };

    if (verify.status) {
      verify.data = {
        phone: {
          status: verify.status,
          verifiedAt: Date.now(),
          ...verify.data,
          phone: phone,
        },
      };
    }
    return verify;
  } catch (error) {
    console.error(error);
    return invalid_response('error validating phone number');
  }
};

export async function ninVerification({
  formData,
  firstName,
  lastName,
  siteInfo,
  generateVa = false,
}: {
  formData: any;
  firstName: string;
  lastName: string;
  siteInfo: BrandType;
  generateVa: boolean;
}) {
  let response = {};
  // const verify = await validateCustomerNIN({
  //   customerCode: formData.accountNumber,
  //   country: formData.country,
  //   type: "bank_account",
  //   accountNumber: formData.accountNumber,
  //   nin: formData.nin,
  //   bankCode: formData.bank,
  //   firstName,
  //   lastName,
  // });

  const verify = await validateNIN(formData.nin);
  response = verify;

  if (verify.status && generateVa) {
    const result = await assignDedicatedAccount({
      email: formData.email,
      country: formData.country,
      first_name: firstName,
      last_name: lastName,
      account_number: formData.accountNumber,
      bvn: formData.bvn,
      bank_code: formData.bank,
    });

    if (result.status) {
      const checkva = await checkDedicatedAccountStatus(result.data.customerId);

      if (checkva.status) {
        for (let v of checkva.data) {
          const createVA = await upsert({ userId: formData.userId, ...v }, 'va', true, siteInfo!);
        }
      } else {
        console.error(checkva.msg);
      }
    } else {
      console.error(result.msg);
    }
  }

  if (verify.status) {
    const userUpdate = await upsert(
      { id: formData.userId, level: formData.level },
      'users',
      true,
      siteInfo!,
    );
  }

  return response;
}
