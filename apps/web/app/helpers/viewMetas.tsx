export async function viewMetas({
  siteInfo,
  data,
}: {
  siteInfo: BrandType;
  data: any;
}): Promise<metaTagModel> {
  const { baseUrl } = await import('@/app/helpers/baseUrl');
  const title = data.title || data.name || '';
  let canonical = await baseUrl(data.slug);
  if (
    siteInfo.requestFrom !== 'primaryDomain' &&
    siteInfo.requestFrom !== 'customDomain' &&
    data.dataType !== 'brand'
  ) {
    canonical = await baseUrl(`${siteInfo.slug}/${data.slug}`);
  }
  if (
    (siteInfo.id === 'admin' || siteInfo.requestFrom === 'customDomain') &&
    data.dataType === 'brand'
  ) {
    canonical = await baseUrl();
  }
  return {
    title,
    canonical,
    openGraphDescription: '',
    description: '',
    openGraphTitle: '',
  };
}
