export const brandBaseUrl = ({
  user,
  siteInfo,
  slug = '',
}: {
  user: UserTypes;
  siteInfo: BrandType;
  slug?: string;
}) => {
  let port = '';
  if (process.env.NODE_ENV === 'development') {
    // return `http://localhost:3000/${slug}`;
    port = ':3000';
  }

  let url = '#';

  if (user.brand?.domain) {
    url = `http://${user.brand?.domain}${port}/${slug}`;
  } else {
    url = `${user.brand?.slug}.afobata.com${port}/${user.brand?.slug}`;
  }

  return url;
};
