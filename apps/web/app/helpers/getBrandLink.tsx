export async function getBrandLink({
  user,
  brand,
}: {
  user: UserTypes;
  brand?: BrandType;
}): Promise<string> {
  const userBrand: BrandType = brand || user?.brand! || {};
  const packageLevel = parseInt(String(user?.subscription?.level! || 0)) || 0;
  let brandLink = '';
  if (userBrand && userBrand.domain) {
    brandLink = `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${userBrand.domain}`;
  } else if (userBrand && userBrand.slug && packageLevel >= 2) {
    brandLink = `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${userBrand.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;
  } else if (userBrand) {
    const { baseUrl } = await import('@/app/helpers/baseUrl');
    brandLink = await baseUrl(userBrand.slug!);
  } else {
    const { baseUrl } = await import('@/app/helpers/baseUrl');
    brandLink = await baseUrl();
  }
  return String(brandLink);
}
