import {
  dashboard_page,
  login_page,
  logout_page,
  route_public_page,
  signup_page,
} from '@/app/src/constants';

import { isNull } from '@/app/helpers/isNull';

export async function createAuthNavigation({
  siteInfo,
  user,
  auth,
}: {
  siteInfo: BrandType;
  user: UserTypes | null;
  auth: AuthModel;
}): Promise<NavItem[]> {
  let navMenu: any = [];

  let navs = !isNull(auth)
    ? [
        {
          name: 'Dashboard',
          href: `${dashboard_page({ subBase: siteInfo.slug! })}`,
          position: 1,
          id: 'dasboard',
        },
        {
          name: 'Logout',
          href: `${route_public_page({ paths: ['login'] })}`,
          position: 200,
          id: 'logout',
        },
      ]
    : [
        {
          name: 'Login',
          href: `${login_page({ subBase: siteInfo.slug! })}`,
          position: 101,
        },
        {
          name: 'Signup',
          href: `${route_public_page({ paths: ['signup'] })}`,
          position: 102,
        },
      ];

  navs.map((item: NavItem) => {
    navMenu.push(item);
  });

  return navMenu;
}
