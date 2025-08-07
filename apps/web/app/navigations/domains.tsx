import { route_user_page } from '@/app/src/constants';
import { isAdmin } from '@/helpers/isAdmin';

export function domainsNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes;
}): NavItem[] {
  const slug = siteInfo.slug || '';
  let isUserAdmin = isAdmin(user!);

  const navs = [
    {
      name: 'Domains',
      href: '#',
      position: 31,
      id: 'domains',
      sub: [
        {
          name: 'All Domains',
          href: route_user_page({ base: 'domains', action: 'overview', subBase: slug }),
          position: 1,
          id: 'domains',
          action: 'overview',
          base: 'domains',
        },
      ],
    },
  ].filter(Boolean) as NavItem[]; // Remove false values

  return navs;
}
