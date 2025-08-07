export const packageCheckpoint = async ({
  data,
  siteInfo,
}: {
  data: DataType;
  siteInfo: BrandType;
}): Promise<boolean> => {
  try {
    const { isAdmin } = await import('@/app/helpers/isAdmin');
    const { isNull } = await import('@/app/helpers/isNull');
    if (data.type !== 'package') {
      return true;
    }
    const getAuthSessionData = await import('@/app/helpers/loadAuthSessionData');
    const session = await (await getAuthSessionData.loadAuthSessionData())();
    if (isAdmin(session)) {
      return true;
    }
    if (!isNull(data.parentId)) {
      return true;
    }
    return false;
  } catch (error: any) {
    return false;
  }
};
