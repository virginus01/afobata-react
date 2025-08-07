export async function getUserEssentials({
  subBase,
  headersType = 'mod',
}: { subBase?: string; headersType?: 'mod' | 'api' | 'basic' } = {}): Promise<UserEssentials> {
  try {
    const { isNull } = await import('@/app/helpers/isNull');
    const { fetchUserData } = await import('@/app/controller/user_controller');
    const { getCookie } = await import('@/app/actions');
    const getAuthSessionData = await import('@/app/helpers/loadAuthSessionData');
    const userSession = await (await getAuthSessionData.loadAuthSessionData())();
    if (isNull(userSession.brandId)) {
      throw Error('Sesssion Brand Id not found');
    }
    const { getEssentials } = await import('@/app/helpers/getEssentials');
    const { brand } = await getEssentials();
    let { user } = await fetchUserData({ siteInfo: brand as any, subFolder: userSession.brandId });
    if (isNull(user)) {
      const userData = await getCookie('user');
      try {
        if (
          !isNull(userData) &&
          userData.id === userSession.userId &&
          brand.id === user?.brand?.id
        ) {
          user = JSON.parse(userData);
        }
      } catch (error) {
        console.error('error geting and parsing cookie user', error);
      }
    }
    return { brand, user, auth: userSession };
  } catch (error) {
    console.error(error);
    throw Error('error at get user essentials');
  }
}
