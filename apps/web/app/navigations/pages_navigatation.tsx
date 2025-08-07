import { isNull } from '@/app/helpers/isNull';
import { crud_page, route_user_page } from '@/app/routes/page_routes';

export async function createPageNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes;
}): Promise<NavItem[]> {
  let navMenu: any = [];

  let homeLink = `/${siteInfo.slug}`;

  let navs: OnRouteModel[] | NavItem[] | any[] = [
    {
      name: 'Pages',
      href: '#',
      id: 'pages',
      position: 11,
      sub: [
        {
          name: 'Static Pages',
          href: route_user_page({
            subBase: siteInfo.slug!,
            action: 'static',
            base: 'pages',
            params: [{ type: 'user' }],
          }),
          id: 'static',
          type: 'user',
          position: 1,
          action: 'static',
          base: 'pages',
          title: 'Default Static Pages',
          searchParams: { type: 'user' },
        },
        {
          name: 'Custom Pages',
          href: crud_page({
            type: 'custom',
            subBase: siteInfo.slug!,
            action: 'overview',
            base: 'pages',
          }),
          position: 3,
          id: 'custom',
          action: 'overview',
          base: 'pages',
          title: 'Custom Pages',
        },
      ],
    },
  ];

  navs.map((item: NavItem) => {
    navMenu.push(item);
  });

  return navMenu;
}
