import { contact_us, pricing } from '@/app/routes/page_routes';

export async function createHomeNavigation({
  siteInfo,
}: {
  siteInfo: BrandType;
}): Promise<NavItem[]> {
  let navMenu: any = [];

  let homeLink = '/';

  let navs = [
    {
      name: 'Home',
      href: homeLink,
      id: 'home',
      position: 1,
    },
    {
      name: 'Contact',
      href: contact_us({ subBase: siteInfo.slug! }),
      id: 'contact',
      position: 1,
    },
    ...(siteInfo.type === 'creator'
      ? [
          {
            name: 'Pricing',
            href: pricing({ subBase: siteInfo.slug! }),
            id: 'pricing',
            position: 1,
          },
        ]
      : []),
  ];

  navs.map((item: NavItem) => {
    navMenu.push(item);
  });

  return navMenu;
}
