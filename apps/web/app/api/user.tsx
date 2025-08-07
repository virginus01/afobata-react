'use server';
import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import {
  fetchData,
  fetchDataWithConditions,
  updateDataWithConditions,
  upsert,
} from '@/app/api/database/mongodb';
import { bvnVerification, ninVerification, validateCustomerPhone } from '@/api/verifications';
import { getBrandInfo } from '@/api/brand/brand';
import { clearCache } from '@/app/actions';
import { NextRequest } from 'next/server';
import { getAuthSessionData, getSeverSessionData } from '@/app/controller/auth_controller';
import { cache } from 'react';
import { httpStatusCodes } from '@/helpers/status_codes';
import { isNull } from '@/helpers/isNull';
import { random_code } from '@/helpers/random_code';
import { api_response } from '@/helpers/api_response';
import { invalid_response } from '@/helpers/invalid_response';
import { randomNumber } from '@/helpers/randomNumber';
import { convertDateTime } from '@/helpers/convertDateTime';
import { addToCurrentDate } from '@/helpers/addToCurrentDate';
import { response } from '@/helpers/response';
import { findMissingFields } from '@/helpers/findMissingFields';
import { compareNames } from '@/helpers/compareNames';
import { deepMergeAll } from '@/helpers/deepMergeAll';
import { show_error } from '@/helpers/show_error';
import { boolean } from 'yup';
import { Brand } from '@/app/models/Brand';
import { getSubscription } from '@/api/packages_and_addons/subscriptions';

export async function server_create_user({
  formData,
  siteInfo,
}: {
  formData: any;
  siteInfo: BrandType;
}) {
  try {
    let finalData = beforeUpdate(formData);
    let response: any = {};
    const [existingUser] = await fetchDataWithConditions('users', {
      $or: [{ uid: formData.uid, brandId: formData.brandId }, { id: formData.id }],
    });

    if (!isNull(existingUser)) {
      finalData = existingUser;
    } else {
      const api_key = random_code(10);
      const api_secret = random_code(26);
      finalData.api_key = api_key;
      finalData.api_secret = api_secret;
      response = await upsert({ ...finalData, api_key, api_secret }, 'users', true, siteInfo!);
    }

    if (response.status) {
      clearCache('user');
      return api_response({
        data: { ...finalData, id: response.id },
        status: true,
        success: true,
        msg: finalData.id ? 'user data updated' : 'user created',
      });
    } else {
      return invalid_response('Error occurred, try again', 200);
    }
  } catch (error) {
    return invalid_response('Error creating or updating user');
  }
}

export const getCurrentUser = cache(
  async (): Promise<{
    user?: UserTypes;
    msg?: string;
    status: boolean;
    brand?: BrandType;
  }> => {
    try {
      const session: AuthModel | null = await getAuthSessionData();

      if (isNull(session)) {
        return { status: false, msg: 'session data null' };
      }

      const { data, status, msg } = await get_user({ id: session.userId ?? '' });

      return {
        user: data ?? undefined,
        brand: data?.brand ?? undefined,
        status,
        msg,
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return { status: false, msg: 'error getting current user' };
    }
  },
);

export async function server_update_user({ formData }: { formData: UserTypes }) {
  const siteInfo = await getBrandInfo();

  if (isNull(formData.id)) {
    return invalid_response('missing Id', 200);
  }

  try {
    const finalData = beforeUpdate(formData);

    const response = await upsert({ ...finalData }, 'users', true, siteInfo!);

    if (response.status) {
      return api_response({
        data: { ...finalData, id: response.id },
        status: true,
        success: true,
        msg: finalData.id ? 'user data updated' : 'user created',
      });
    } else {
      return invalid_response('Error occurred, try again', 200);
    }
  } catch (error) {
    return invalid_response('Error creating or updating user');
  }
}

export async function server_generate_user_token({
  formData,
  siteInfo,
}: {
  siteInfo: BrandType;
  formData: any;
}) {
  try {
    const tokenValue = random_code(32);
    const code = randomNumber(5);

    const data: UserTypes = {
      id: formData.id,
      token: {
        code,
        value: tokenValue,
        expire: convertDateTime(addToCurrentDate({ days: 1 })),
      },
    };

    const response = await upsert(data, 'users', true, siteInfo!);

    if (response.status) {
      return api_response({ data: data, status: true, success: true });
    } else {
      return invalid_response('error occurred try again', 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error creating or updating user');
  }
}

export const server_get_user = async ({
  context,
  request,
}: {
  context?: any;
  request?: NextRequest;
}): Promise<Response> => {
  try {
    const { user, msg, status }: any = await getCurrentUser();

    const { subscription } = await getSubscription(user.subscriptionId);

    return response({
      msg,
      status,
      statusCode: httpStatusCodes[status ? 200 : 500],
      data: { ...user, subscription },
      skipCookies: true,
      skipCSRF: true,
    });
  } catch (error) {
    console.error('Error in get_user:', error);
    return invalid_response('An unexpected error occurred while fetching user data');
  }
};

export const get_user = async ({
  id,
}: {
  id?: string;
  context?: any;
  siteInfo?: BrandType;
  brandId?: string;
  uid?: string;
  request?: NextRequest;
}): Promise<{ status: boolean; msg?: string; data?: UserTypes }> => {
  try {
    let conditions: any = {};

    if (!isNull(id)) {
      conditions = { id };
    }

    if (isNull(conditions)) {
      show_error('No get user condition provided', 'No get user condition provided', false);
      return { status: false, msg: 'no condition provided' };
    }

    const [userData]: UserTypes[] = await fetchDataWithConditions('users', conditions);

    if (isNull(userData)) {
      return {
        msg: `No User Found for: ${JSON.stringify(conditions)}`,
        status: false,
      };
    }

    const brandConditions = { userId: userData.id };
    const [userBrand]: BrandType[] = await fetchDataWithConditions('brands', brandConditions);

    let auth = await getSeverSessionData();

    const responseData: UserTypes = {
      ...userData,
      brand: userBrand ?? {},
      auth,
    };

    return {
      data: responseData,
      status: true,
    };
  } catch (error) {
    console.error('Error in get_user:', error);
    return { status: false, msg: 'An unexpected error occurred while fetching user data' };
  }
};

export async function get_users() {
  try {
    const response = await fetchData('users', '', true);
    let res: any = {};

    if (response) {
      res.msg = 'success';
      res.code = 'success';
      res.success = true;
    } else {
      res.msg = 'error getting user data';
      res.code = 'error';
      res.success = false;
    }

    return api_response(res, response);
  } catch (error) {}
  return api_response({});
}

export async function server_user_stats({
  userId,
  brandId,
  duration = 3,
}: {
  userId: string;
  brandId: string;
  duration: number;
}) {
  try {
    const currentDate: any = convertDateTime();

    // Calculate start timestamps for different periods
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const thisMonthTimestamp = Math.floor(thisMonthStart.getTime() / 1000);

    const durationStart = new Date(thisMonthStart);
    durationStart.setMonth(durationStart.getMonth() - duration);
    const durationTimestamp = Math.floor(durationStart.getTime() / 1000);

    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthTimestamp = Math.floor(lastMonthStart.getTime() / 1000);

    // Initialize stats objects with additional duration data array
    let totalRevenue: StatType = {
      all: 0,
      lastMonth: 0,
      thisMonth: 0,
      data: [],
      durationData: [], // Data for specified duration
    };
    let subscriptions: StatType = {
      all: 0,
      lastMonth: 0,
      thisMonth: 0,
      data: [],
      durationData: [],
    };
    let sales: StatType = {
      all: 0,
      lastMonth: 0,
      thisMonth: 0,
      data: [],
      durationData: [],
    };
    let users: StatType = {
      all: 0,
      lastMonth: 0,
      thisMonth: 0,
      active: 0,
      data: [],
      durationData: [],
    };
    let transactions: StatType = {
      all: 0,
      lastMonth: 0,
      thisMonth: 0,
      active: 0,
      data: [],
      durationData: [],
    };

    // Update fetch conditions to include duration
    const revenueData: PaymentType = await fetchDataWithConditions('payments', {
      type: 'credit',
      trnxType: 'share',
      createdAt: { $gte: durationTimestamp },
    });

    const subscriptionsData: SubscriptionModel = await fetchDataWithConditions('subscriptions', {
      brandId,
      expiresAt: { $gt: currentDate },
      createdAt: { $gte: durationTimestamp },
    });

    const salesData: OrderType = await fetchDataWithConditions('orders', {
      brandId,
      status: 'completed',
      createdAt: { $gte: durationTimestamp },
    });

    const userData: UserTypes = await fetchDataWithConditions('users', {
      brandId,
      createdAt: { $gte: durationTimestamp },
    });

    const transactionsData: UserTypes = await fetchDataWithConditions('transactions', {
      brandId,
      createdAt: { $gte: durationTimestamp },
    });

    // Helper function to group data by month
    const groupByMonth = (data: any[]) => {
      const monthlyData: any = {};
      for (let i = 0; i < duration; i++) {
        const monthDate = new Date(thisMonthStart);
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(
          2,
          '0',
        )}`;
        monthlyData[monthKey] = 0;
      }

      data.forEach((item) => {
        const date = new Date(item.createdAt * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += item.amount || 1;
        }
      });

      return Object.entries(monthlyData).map(([month, value]) => ({
        month,
        value,
      }));
    };

    // Process revenue data
    if (revenueData && Array.isArray(revenueData)) {
      totalRevenue.data = revenueData;
      totalRevenue.all = revenueData.reduce((sum, item) => sum + (item.amount || 0), 0);
      totalRevenue.thisMonth = revenueData
        .filter((item) => item.createdAt >= thisMonthTimestamp)
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      totalRevenue.lastMonth = revenueData
        .filter(
          (item) => item.createdAt >= lastMonthTimestamp && item.createdAt < thisMonthTimestamp,
        )
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      totalRevenue.durationData = groupByMonth(revenueData);
    }

    // Process subscriptions data with duration
    if (subscriptionsData && Array.isArray(subscriptionsData)) {
      subscriptions.data = subscriptionsData;
      subscriptions.all = subscriptionsData.length;
      subscriptions.thisMonth = subscriptionsData.filter(
        (item) => item.createdAt >= thisMonthTimestamp,
      ).length;
      subscriptions.lastMonth = subscriptionsData.filter(
        (item) => item.createdAt >= lastMonthTimestamp && item.createdAt < thisMonthTimestamp,
      ).length;
      subscriptions.durationData = groupByMonth(subscriptionsData);
    }

    // Process sales data with duration
    if (salesData && Array.isArray(salesData)) {
      sales.data = salesData;
      sales.all = salesData.length;
      sales.thisMonth = salesData.filter((item) => item.createdAt >= thisMonthTimestamp).length;
      sales.lastMonth = salesData.filter(
        (item) => item.createdAt >= lastMonthTimestamp && item.createdAt < thisMonthTimestamp,
      ).length;
      sales.durationData = groupByMonth(salesData);
    }

    // Process transactions data with duration
    if (transactionsData && Array.isArray(transactionsData)) {
      transactions.data = transactionsData;
      transactions.all = transactionsData.length;
      transactions.thisMonth = transactionsData.filter(
        (item) => item.createdAt >= thisMonthTimestamp,
      ).length;
      transactions.lastMonth = transactionsData.filter(
        (item) => item.createdAt >= lastMonthTimestamp && item.createdAt < thisMonthTimestamp,
      ).length;
      transactions.durationData = groupByMonth(transactionsData);
    }

    // Process users data with duration
    if (userData && Array.isArray(userData)) {
      users.data = userData;
      users.all = userData.length;
      users.thisMonth = userData.filter((item) => item.createdAt >= thisMonthTimestamp).length;
      users.lastMonth = userData.filter(
        (item) => item.createdAt >= lastMonthTimestamp && item.createdAt < thisMonthTimestamp,
      ).length;
      const thirtyDaysAgo = currentDate - 30 * 24 * 60 * 60;
      users.active = userData.filter((item) => item.updatedAt >= thirtyDaysAgo).length;
      users.durationData = groupByMonth(userData);
    }

    const res: any = {
      data: {
        totalRevenue,
        subscriptions,
        sales,
        users,
        transactions,
      },
      msg: 'success',
      code: 'success',
      success: true,
    };

    return api_response(res, res.data);
  } catch (error) {
    const errorRes = {
      msg: 'error getting user data',
      code: 'error',
      success: false,
      data: null,
    };
    return api_response(errorRes, null);
  }
}

export async function server_add_user_bank_details(formData: any) {
  let response = {
    status: false,
    msg: 'error adding bank',
    code: '',
    data: {},
  };
  try {
    const siteInfo = await getBrandInfo();
    const session = await getSeverSessionData();

    let [user]: UserTypes[] = await fetchDataWithConditions('users', { id: session.userId });

    if (isNull(user) || isNull(session)) {
      return invalid_response('user not found', 500);
    }

    if (formData?.action === 'default_account') {
      const bankAR = await makeBankDefault({ formData, userId: user?.id! });
      return api_response(bankAR);
    } else if (formData?.action === 'delete') {
      const deleteAcc = await deleteBankAcount({ formData, userId: user?.id! });
      return api_response(deleteAcc);
    }

    const missing = findMissingFields({
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      bankCode: formData.bankCode,
      bankName: formData.bankName,
      user,
      auth: session,
    });

    if (missing) {
      console.error(missing, 'missing');
      return invalid_response('some data missing', 200);
    }

    let userLevel = session?.tier ?? 0;

    if (userLevel < 2) {
      response.status = false;
      response.code = 'notVerified';
      response.msg = 'Verification Needed';
      return api_response(response);
    }

    const compare = compareNames(
      session?.verificationData?.verifiedName ?? '',
      formData?.accountName || '',
    );

    if (!compare) {
      return invalid_response('Account Name different from Verified Name');
    }

    const fundSources = user?.fundSources ?? [];

    const existingBank: _FundSouces =
      fundSources.find((f) => f.accountNumber === formData.accountNumber) ?? ({} as any);

    if (!isNull(existingBank)) {
      return invalid_response('Bank account already exists');
    }

    const blackList: _FundSouces =
      fundSources.find(
        (f) => f.accountNumber === formData.accountNumber && f.blackListed === true,
      ) ?? ({} as any);

    const blackListedName = compareNames(
      blackList?.accountName ?? '',
      formData?.accountName || '',
      3,
    );

    if (blackList?.blackListed || blackListedName) {
      return invalid_response("Account can't be added");
    }

    const vaData: _FundSouces = {
      ...formData.bankInfo,
      id: `${formData.accountNumber}-${user.id}`,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      bankCode: formData.bankCode,
      bankName: formData.bankName,
      userId: user.id,
      uid: session?.id,
      expireAt: convertDateTime(addToCurrentDate({ years: 100 })) as any,
      walletId: formData?.walletId,
      currency: user.defaultCurrency,
      type: 'bank_account',
      status: 'active',
      role: 'payout',
    };

    fundSources.push(vaData);

    const createVA = await upsert({ id: user.id, fundSources }, 'users', true, siteInfo!);

    if (isNull(user.accountNumber) || isNull(user.accountNumber)) {
      const bankAR = await makeBankDefault({ formData, userId: user?.id! });
    }

    response.status = createVA.status;
    response.msg = 'Bank Details Added';
    response.code = 'success';
    response.data = vaData;
    return api_response(response);
  } catch (error) {
    console.error(error, 'error at add user bank details');
    response.status = false;
    response.msg = 'error adding bank';
    response.code = 'error';
    return api_response(response);
  }
}

export async function makeBankDefault({ formData, userId }: { formData: any; userId: string }) {
  let response = {
    status: false,
    msg: 'error making account default',
    code: '',
  };
  try {
    const bankAccInfo = {
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      bankCode: formData.bankCode,
    };

    const updateUser: any = await updateDataWithConditions({
      collectionName: 'users',
      conditions: { id: userId },
      updateFields: { ...bankAccInfo, bankAccInfo },
    });

    return { data: bankAccInfo, status: updateUser.status, msg: 'successful' };
  } catch (error) {
    console.error(error, 'error at making bank default');
    response.status = false;
    response.msg = 'error making bank default';
    response.code = 'error';
    return response;
  }
}

export async function deleteBankAcount({ formData, userId }: { formData: any; userId: string }) {
  let response = {
    status: false,
    msg: 'error making account default',
    code: '',
  };
  try {
    const bankAccInfo = {
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankCode: '',
    };

    const updateUser: any = await updateDataWithConditions({
      collectionName: 'users',
      conditions: { id: userId },
      updateFields: { ...bankAccInfo, bankAccInfo },
    });

    return { data: bankAccInfo, status: updateUser.status, msg: 'successful' };
  } catch (error) {
    console.error(error, 'error at making bank default');
    response.status = false;
    response.msg = 'error making bank default';
    response.code = 'error';
    return response;
  }
}

export async function server_user_account_verifications(formData: any) {
  try {
    const user = formData.user ?? {};
    const auth = formData?.user?.auth ?? {};
    const data = formData.data ?? {};
    const tierData = formData.tierData ?? {};

    const missing = findMissingFields({ userId: formData?.user?.id, auth, data, user });

    if (missing) {
      console.error(missing, 'missing');
      return invalid_response('some data missing', 200);
    }

    const siteInfo = await getBrandInfo();

    const fullName = data.accountName || data.name;
    const words = fullName.trim().split(' ');

    const lastName = words[0] || '';
    const firstName = words[words.length - 1] || '';

    let verify: any = { status: false, msg: 'verification unsucessful' };
    let dLimit = tierData?.dailyLimit![0];
    let mLimit = tierData?.monthlyLimit![0];

    switch (data.verificationDocType) {
      case 'bvn':
        if (isNull(data.bvn)) return invalid_response('bvn number missing', 200);
        verify = await bvnVerification({
          data,
          user,
          auth,
          tierData,
          firstName,
          lastName,
          siteInfo,
          generateVa: true,
          vaSp: 'paystack',
          wallet: user.walletId,
        });
        break;

      case 'nin':
        if (isNull(data.nin)) return invalid_response('nin number missing', 200);
        verify = await ninVerification({
          formData,
          firstName,
          lastName,
          siteInfo,
          generateVa: false,
        });
        break;

      default:
        if (data.phone) {
          verify = await validateCustomerPhone({
            country: user.country ?? '',
            phone: data.phone,
          });
        } else {
          return invalid_response('missing verification data', 200);
        }
    }

    let res: any = {};

    if (verify.status) {
      const [authData]: AuthModel[] = await fetchDataWithConditions('auth', { id: auth.id });
      const merged = deepMergeAll([
        authData.verificationData || {},
        verify.data || {},
        {
          verifiedName: fullName,
          tier: tierData.tier,
        },
      ]);

      const verifications = {
        monthlyLimit: mLimit,
        dailyLimit: dLimit,
        name: fullName,
        tier: tierData.tier,
        verificationData: merged,
      };

      await updateDataWithConditions({
        conditions: { id: auth?.id },
        collectionName: 'auth',
        updateFields: verifications,
      });
      res.msg = verify.msg;
      res.code = 'success';
      res.success = verify.status;
      res.data = verify.data;
    } else {
      res.msg = verify.msg;
      res.code = 'error';
      res.success = false;
      res.data = {};
    }

    return api_response(res);
  } catch (error) {
    console.error(error);
  }
  return api_response('error occured during verification');
}
