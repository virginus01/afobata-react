import { appearance_page } from '@/app/src/constants';
import { isAdmin } from '@/helpers/isAdmin';

export function createAppearanceNavigation({
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
      name: 'Appearance',
      href: '#',
      position: 11,
      id: 'appearance',
      sub: [
        {
          name: 'Menus',
          href: appearance_page({
            type: 'menus',
            subBase: slug,
            action: 'menus',
            base: 'appearance',
          }),
          position: 1,
          id: 'menus',
          action: 'menus',
          base: 'appearance',
          type: 'menus',
        },
        {
          name: 'Translations',
          href: appearance_page({
            type: 'translations',
            subBase: slug,
            action: 'translations',
            base: 'appearance',
          }),
          position: 1,
          id: 'translations',
          action: 'translations',
          base: 'appearance',
          type: 'translations',
        },
      ],
    },
  ].filter(Boolean) as NavItem[]; // Remove false values

  return navs;
}
