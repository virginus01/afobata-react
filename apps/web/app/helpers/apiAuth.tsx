import { fetchDataWithConditions } from '@/app/api/database/mongodb';
import { isNull } from '@/app/helpers/isNull';

export async function apiAuth({
  apiKey,
  apiSecret,
}: {
  apiKey?: string;
  apiSecret?: string;
}): Promise<ApiAuthModel> {
  let res: ApiAuthModel = { isAuthenticated: false, uid: '', isAdmin: false, data: {}, user: {} };
  const [user]: UserTypes[] = await fetchDataWithConditions('users', {
    $or: [{ api_key: apiKey }],
  });
  if (isNull(user)) {
    return { isAuthenticated: false, user: {} };
  }
  //const decryptedUserSecret = await decrypt(user.api_secret ?? "");
  const decryptedUserSecret = '';
  if (apiSecret === decryptedUserSecret) {
    res = { isAuthenticated: true, user };
  } else {
    res = { isAuthenticated: false, user: {} };
  }
  return res;
}
