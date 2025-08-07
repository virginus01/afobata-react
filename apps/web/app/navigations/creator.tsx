import { blog_page, brand_page, crud_page, route_user_page } from '@/app/src/constants';
import { isAdmin } from '@/helpers/isAdmin';

export function createCreatorNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes;
}): NavItem[] {
  const slug = siteInfo.slug || '';
  let isUserAdmin = isAdmin(user!);

  const navs = [
    siteInfo.type === 'creator' && {
      name: 'Branding',
      href: '#',
      position: 11,
      id: 'brand',
      sub: [
        {
          name: 'Brand Settings',
          href: brand_page({ action: 'settings', subBase: slug }),
          position: 1,
          id: 'setting',
          action: 'settings',
          base: 'brand',
        },
        {
          name: 'Custom Domains',
          href: brand_page({ action: 'domains', subBase: slug }),
          position: 1,
          id: 'custom_domain',
          action: 'domains',
          base: 'brand',
        },
        {
          name: 'Custom Apps',
          href: brand_page({ action: 'build-app', subBase: slug }),
          position: 1,
          id: 'build_app',
          action: 'build-app',
          base: 'brand',
          title: 'Build custom apps for your plateform',
        },
        // {
        //   name: "Text Customization",
        //   href: brand_page({ action: "text-customize", subBase: slug }),
        //   position: 1,
        //   id: "text_customize",
        //   action: "text-customize",
        //   base: "brand",
        //   title: "Change any text to what you want",
        // },
        {
          name: 'Clients Default Pages',
          href: route_user_page({
            subBase: siteInfo.slug!,
            action: 'static',
            base: 'pages',
            params: [{ type: 'default' }],
          }),
          id: 'default',
          type: 'default',
          position: 1,
          action: 'static',
          base: 'pages',
          title: 'Default Client Pages',
          searchParams: { type: 'default' },
        },
        {
          name: 'Packages',
          href: crud_page({
            type: 'package',
            subBase: slug,
            action: isUserAdmin && user.selectedProfile === 'admin' ? 'overview' : 'drop',
            base: 'products',
          }),
          position: 1,
          id: 'package',
          action: isUserAdmin && user.selectedProfile === 'admin' ? 'overview' : 'drop',
          base: 'products',
          type: 'package',
        },
        {
          name: 'Monetization',
          href: `${blog_page({ subBase: siteInfo.slug!, action: 'monetize' })}`,
          action: 'monetize',
          base: 'monetize',
          position: 2,
        },
        {
          name: 'Subsidiaries',
          href: `${route_user_page({ subBase: siteInfo.slug!, base: 'brand', action: 'subsidiaries' })}`,
          action: 'subsidiaries',
          title: 'Subsidiaries',
          base: 'brand',
          position: 10,
        },
      ],
    },
    {
      name: 'Products',
      href: '#',
      position: 12,
      id: 'products',
      sub: [
        {
          name: 'Digital Products',
          href: crud_page({
            type: 'digital',
            subBase: slug,
            action: 'overview',
            base: 'products',
          }),
          position: 1,
          id: 'digital',
          action: 'overview',
          base: 'products',
          type: 'digital',
        },
        {
          name: 'Online Courses',
          href: crud_page({
            type: 'course',
            subBase: slug,
            action: 'overview',
            base: 'products',
          }),
          position: 2,
          id: 'course',
          type: 'course',
          action: 'overview',
          base: 'products',
        },
        {
          name: 'Physical Products',
          href: crud_page({
            type: 'physical',
            subBase: slug,
            action: 'overview',
            base: 'products',
          }),
          position: 3,
          id: 'physical',
          type: 'physical',
          action: 'overview',
          base: 'products',
        },

        {
          name: 'Packages',
          href: crud_page({
            type: 'package',
            subBase: slug,
            action: 'overview',
            base: 'products',
          }),
          position: 3,
          id: 'package',
          type: 'package',
          action: 'overview',
          base: 'products',
        },
      ],
    },
  ].filter(Boolean) as NavItem[]; // Remove false values

  return navs;
}
