import {
  deleteDataWithConditions,
  fetchDataWithConditions,
  updateDataWithConditions,
  upsert,
} from '@/database/mongodb';
import { httpStatusCodes } from '@/app/helpers/status_codes';
import { encrypt } from '@/api/helper';

import { centralDomain, FREE_PACKAGE_ID } from '@/app/src/constants';
import { WorldCurrencies } from '@/app/data/currencies';
import { Brand } from '@/app/models/Brand';
import { createBrand, getBrandInfo } from '@/api/brand/brand';
import { random_code } from '@/app/helpers/random_code';
import { randomNumber } from '@/app/helpers/randomNumber';
import { isNull } from '@/app/helpers/isNull';
import { lowercase } from '@/app/helpers/lowercase';
import { response } from '@/app/helpers/response';
import { getUserId } from '@/app/helpers/getUserId';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { generateWalletId } from '@/app/helpers/generateWalletId';
import { getCurrentUser } from '@/api/user';
import { createFBUser, deleteFBAuth, loginFBUser } from '@/api/firebase';
import { getDId } from '@/app/helpers/getDId';
import { findMissingFields } from '@/app/helpers/findMissingFields';

import { getAuthSessionData, getSeverSessionData } from '@/app/controller/auth_controller';
import { hashPassword } from '@/app/helpers/passwordHelpers';

export async function createAuth({
  data,
  siteInfo,
}: {
  data: AuthModel | any;
  siteInfo: BrandType;
}) {
  const api_key = random_code(10);
  const api_secret = await encrypt(random_code(26));

  let currencyId = data?.defaultCurrency;

  if (isNull(data.country)) {
    return { msg: 'country missing' };
  }

  if (isNull(currencyId)) {
    const cur = WorldCurrencies.find((c) => lowercase(c.countryId!) === lowercase(data.country!));
    currencyId = cur?.currencyCode || data?.defaultCurrency;
  }

  if (isNull(currencyId)) {
    return { msg: 'currency missing' };
  }

  let id = randomNumber(10);

  const hashedPassword = await hashPassword(data?.password);

  const AuthData: any = {
    id,
    isAdmin: false,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    defaultCurrency: currencyId,
    country: data?.country,
    providerId: data.providerId,
    password: hashedPassword,
    uid: data.uid,
    emailVerified: data.emailVerified,
    photoURL: data.photoURL,
    phoneNumber: data.phoneNumber,
    registeredBy: siteInfo.userId,
    joinedBrandId: siteInfo.id,
    loggedBrandId: siteInfo.id,
    api_key,
    api_secret,
    verificationData: data.verificationData,
  };

  const existingAuth = await fetchDataWithConditions('auth', { email: AuthData.email });

  if (!isNull(existingAuth)) {
    return { msg: 'User already exist' };
  }

  let fbUser = await createFBUser({
    email: data.email,
    password: data?.password,
  });

  if (!fbUser.status || !fbUser.data) {
    const login = await loginFBUser({ email: data.email, password: data.password });
    if (login.status && login.data) {
      data = login.data;
    } else {
      return { status: false, msg: fbUser.msg };
    }
  }

  AuthData.accessToken = data.accessToken;
  AuthData.providerId = data.providerId;
  AuthData.uid = data.uid;
  AuthData.emailVerified = data.emailVerified;
  AuthData.photoURL = data.photoURL;
  AuthData.phoneNumber = data.phoneNumber;

  const result = await upsert(AuthData, 'auth', true, siteInfo);

  return { data: AuthData, status: result.status };
}

export async function server_signup({
  data,
  siteInfo,
}: {
  data: AuthModel | any;
  siteInfo: BrandType;
}) {
  let [userAuth]: UserTypes[] = await fetchDataWithConditions('auth', {
    $or: [{ email: data.email }, { uid: data.uid }],
  });

  if (!isNull(userAuth)) {
    return await response({
      status: false,
      statusCode: httpStatusCodes[500],
      msg: 'Account already exist',
    });
  }

  const formData = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    defaultCurrency: data.defaultCurrency,
    country: data.country,
    accessToken: data.accessToken,
    providerId: data.providerId,
    uid: data.uid,
    ipInfo: data.visitorInfo,
    emailVerified: data.emailVerified,
    photoURL: data.photoURL,
    phoneNumber: data.phoneNumber,
  };

  const userAuthResult = await createAuth({ data: formData, siteInfo });

  if (userAuthResult.status) {
    return response({
      data: userAuthResult.data,
      status: true,
      statusCode: httpStatusCodes[200],
      msg: 'account created',
    });
  } else {
    return response({
      data: userAuth,
      status: false,
      statusCode: httpStatusCodes[500],
      msg: userAuthResult.msg || 'server error during account creation',
    });
  }
}

export async function server_update_auth({
  formData,
  siteInfo,
}: {
  formData: AuthModel | any;
  siteInfo: BrandType;
}) {
  try {
    const firebaseAuthUID = formData.uid;

    let brand: Brand = siteInfo as any;
    if (isNull(siteInfo) || isNull(siteInfo.id)) {
      brand = await getBrandInfo();
    }

    const authData: AuthModel = {
      id: formData.id,
      emailVerified: formData.emailVerified,
    };

    const result = await upsert(authData, 'auth', true, siteInfo);

    const userId = getUserId({ userId: authData.id!, brandId: brand.id! });

    updateDataWithConditions({
      collectionName: 'users',
      conditions: { id: userId },
      updateFields: { auth: authData },
    });

    if (result.status) {
      return api_response({ data: authData, status: true, msg: 'successful' });
    } else {
      invalid_response('error', 200);
    }
  } catch (error) {
    throw error;
  }
}

export async function createUser({
  auth,
  siteInfo,
  data,
}: {
  auth: AuthModel;
  siteInfo: BrandType;
  data?: UserTypes;
}) {
  if (isNull(auth) || isNull(auth.id)) {
    return { status: false, msg: 'auth data missing' };
  }

  if (isNull(siteInfo) || isNull(siteInfo.id)) {
    return { status: false, msg: 'Brand info missing' };
  }

  const hash = getUserId({ userId: auth.id!, brandId: siteInfo.id! });
  const id = hash || randomNumber(10);
  const api_key = random_code(10);
  const api_secret = await encrypt(random_code(26));

  const body: any = {
    ...auth,
    ...data,
    brandId: siteInfo.id,
    id,
    defaultCurrency: auth.defaultCurrency || 'USD',
    userId: id,
    slug: id,
    hash,
    uid: auth.id,
    firebaseId: auth.uid,
    api_key,
    api_secret,
    selectedProfile: siteInfo.type === 'creator' ? 'creator' : 'custom',
  };

  const walletHash = generateWalletId({
    userId: body.id,
    brandId: siteInfo.id!,
    identifier: 'main',
    currency: body.defaultCurrency,
  });

  const wallet = {
    userId: body.id,
    identifier: 'main',
    brandId: siteInfo.id,
    currency: body.defaultCurrency,
    id: body.id,
    value: 0,
    shareValue: 0,
    hash: walletHash,
  };

  let [currencyData]: CurrencyType[] = await fetchDataWithConditions('currencies', {
    id: lowercase(body.defaultCurrency ?? ''),
  });

  const currencyInfo: CurrencyType = {
    currencyCode: currencyData.currencyCode,
    currencyName: currencyData.currencyName,
    currencySymbol: currencyData.currencySymbol,
  };

  const existingUser = await fetchDataWithConditions('users', {
    $or: [{ id: body.id }, { hash }],
  });

  if (!isNull(existingUser)) {
    return { msg: 'User already exist' };
  }

  const response = await upsert(
    { ...body, packageId: FREE_PACKAGE_ID, subscription: {}, wallet, currencyInfo },
    'users',
    true,
    siteInfo!,
  );

  return { user: body, status: response.status };
}

export async function server_add_update_subsidiary({ body: incomingBody }: { body: any }) {
  let body: any = incomingBody;

  if (['creator', 'hoster', 'admin'].includes(body?.brandData?.type)) {
    return response({ status: false, msg: `${body.brandData.type} can't be addded as subsidiary` });
  }

  const missing = findMissingFields({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: body.password,
    country: body.country,
    slug: body.brandData?.slug,
    name: body.brandData?.name,
    type: body.brandData?.type,
  });

  if (missing) {
    console.error('Missing some data at create subsidiary:', missing);
    return response({ msg: 'Some data is missing', status: false });
  }

  const existingBrand = await fetchDataWithConditions('brands', {
    slug: lowercase(body.brandData.slug),
  });

  if (!isNull(existingBrand)) {
    return invalid_response('Brand with the URL already exists', 200);
  }

  const { user, brand } = await getCurrentUser();

  const serverAuth = await getSeverSessionData();

  const domain = lowercase(`${body.brandData.slug}.${brand?.domain ?? centralDomain ?? ''}`);
  const existingDomain = await fetchDataWithConditions('domains', { domain });

  if (!isNull(existingDomain)) {
    return response({ status: false, msg: 'Brand with the subdomain already exists' });
  }

  const authResult = await createAuth({
    data: { ...body, verificationData: serverAuth?.verificationData },
    siteInfo: brand ?? {},
  });

  if (!authResult.status) {
    console.error(authResult.msg);
    return invalid_response(authResult.msg, 200);
  }

  const userResult = await createUser({
    auth: authResult.data,
    data: {
      bossId: user?.id,
      subscriptionId: user?.subscriptionId,
    },
    siteInfo: brand ?? {},
  });

  if (!userResult.status) {
    console.error(userResult.msg);
    await deleteFBAuth({ uid: authResult?.data?.uid });
    return invalid_response('Error creating user', 200);
  }

  const session: AuthModel = authResult.data;
  const hash = getDId({ userId: session?.userId ?? '', brandId: brand?.id! });

  const brandBody: BrandType = {
    domain,
    name: body.brandData.name,
    slug: lowercase(body.brandData.slug),
    brandId: brand?.id,
    userId: session.userId,
    uid: session.id,
    profiles: ['custom'],
    logo: brand?.logo,
    icon: brand?.icon,
    email: session.email,
    type: body.brandData.type,
    parentCompanyId: brand?.id,
    subscriptionId: brand?.subscriptionId,
  };

  const createB = await createBrand({
    session,
    siteInfo: brand ?? {},
    hash,
    domain,
    body: brandBody,
  });

  if (!createB.status) {
    await deleteFBAuth({ uid: body.uid });
    await deleteDataWithConditions({
      collectionName: 'users',
      conditions: {
        $or: [{ id: userResult?.user?.id }, { email: body.email }],
      },
    });
    return invalid_response('Failed to create brand', 500);
  }

  return response(createB);
}
