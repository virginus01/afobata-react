import { createUtilityNavigation } from '@/app/utility_constants';
import { createCreatorNavigation } from '@/app/navigations/creator';
import { createAuthNavigation } from '@/app/navigations/auth';
import { createWalletNavigation } from '@/app/navigations/wallet';
import { createProfileNavigation } from '@/app/navigations/profile';
import { createHomeNavigation } from '@/app/navigations/home';
import { createAdminNavigation } from '@/app/navigations/admin_navigation';
import { createBlogNavigation } from '@/app/navigations/blog_navigation';
import { createTrnxNavigation } from '@/app/navigations/transaction_navigation';
import { createDropNavigation } from '@/app/navigations/drop_navigation';
import { createDigitalAssetNavigation } from '@/app/navigations/digital_asset';
import { isAdmin } from '@/app/helpers/isAdmin';
import { createCatNavigation } from '@/app/navigations/category_navigation';
import { createOrderNavigation } from '@/app/navigations/orders_navigation';
import { createPageNavigation } from '@/app/navigations/pages_navigatation';
import { createPurchaseNavigation } from '@/app/navigations/purchase_navigation';
import { createAppearanceNavigation } from '@/app/navigations/appearance';
import { domainsNavigation } from '@/app/navigations/domains';

export const PRIMARY_COLOR = 'red-500';
export default async function GetNavigation({
  selectedProfile,
  user,
  siteInfo,
}: {
  selectedProfile?: string;
  user?: UserTypes;
  siteInfo: BrandType;
}): Promise<any> {
  const home_navigation = await createHomeNavigation({ siteInfo });
  const creator_navigation = createCreatorNavigation({ siteInfo, user: user ?? {} });
  const appearance_navigation = createAppearanceNavigation({ siteInfo, user: user ?? {} });
  const order_navigation = createOrderNavigation({ siteInfo, user: user! });
  const admin_navigation = createAdminNavigation({ slug: siteInfo.slug! });
  const purchase_nav = createPurchaseNavigation({ siteInfo, user: user ?? {} });
  const utility_navigation = createUtilityNavigation({ slug: siteInfo.slug! });
  const domain_navigation = domainsNavigation({ siteInfo, user: user ?? {} });
  const pages_navigation = await createPageNavigation({
    siteInfo,
    user: user || {},
  });
  const digi_asset_navigation = createDigitalAssetNavigation({
    slug: siteInfo.slug!,
  });
  const blog_navigation = createBlogNavigation({ siteInfo: siteInfo });
  const drop_navigation = createDropNavigation({ siteInfo: siteInfo });
  const auth_navigation = await createAuthNavigation({
    siteInfo,
    user: user?.id ? user : {},
    auth: user?.auth || {},
  });
  const wallet_navigation = createWalletNavigation({
    siteInfo,
    user: user?.id ? user : null,
  });
  const profile_navigation = createProfileNavigation({
    siteInfo,
    user: user?.id ? user : null,
  });

  const trnx_navigation = createTrnxNavigation({
    siteInfo,
    user: user?.id ? user : null,
  });

  const cat_navigation = createCatNavigation({
    siteInfo,
    user: user || {},
  });

  let isUserAdmin = false;
  if (user) {
    isUserAdmin = isAdmin(user!);
  }

  const creator_subMenu = [
    ...creator_navigation,
    //  ...digi_asset_navigation,
    ...utility_navigation,
    ...drop_navigation,
    ...blog_navigation,
    ...pages_navigation,
    ...appearance_navigation,
    ...purchase_nav,
    ...domain_navigation,
    ...cat_navigation,
    ...order_navigation,
    ...trnx_navigation,
    ...wallet_navigation,
    ...profile_navigation,
    ...auth_navigation,
  ];

  const user_menu = [
    ...(isUserAdmin
      ? [
          {
            name: 'Admin',
            id: 'admin',

            shortDesc: `I want to access all the business features on ${siteInfo.name} such as building and managing my own site with all premium features, selling products, blogging, etc.`,
            brandShortDesc: `I want my users to be able to sell and resell products on my website just as on ${siteInfo.name}, and also own a site like mine under my own brand while having access to all business features.`,
            availableToUsers: true,
            availableToBrands: true,
            minLevel: 4,
            sub: [...creator_subMenu],
          },
        ]
      : []),
    {
      name: 'Creator',
      title: 'Sell Any Product',
      id: 'creator',

      shortDesc: `I want to access all the business features on ${siteInfo.name} such as building and managing my own site with all premium features, selling products, blogging etc`,
      brandShortDesc: `I want my users be able to sell and resell products on my website just as on ${siteInfo.name} and also own a site like mine and under my own brand and have access to all business features`,
      availableToUsers: true,
      availableToBrands: true,
      minLevel: 4,
      sub: [...creator_subMenu],
    },

    {
      name: 'Hosting',
      title: "Manage Other People's platform",
      id: 'hoster',

      shortDesc: `I want to access all the business features on ${siteInfo.name} such as building and managing my own site with all premium features, selling products, blogging etc`,
      brandShortDesc: `I want my users be able to sell and resell products on my website just as on ${siteInfo.name} and also own a site like mine and under my own brand and have access to all business features`,
      availableToUsers: true,
      availableToBrands: true,
      minLevel: 4,
      sub: [...creator_subMenu],
    },

    // {
    //   name: "Crypto & Virtual/Gift Card",
    //   id: "digital_asset",
    //
    //   shortDesc: `I want to sell my BTC, USDT on ${siteInfo.name} and get credited in less than 20 minutes, also other related services such as gift/virtual card services`,
    //   brandShortDesc: `I want users to convert their cryptocurrency (BTC) on my website and other digital assets related services such as gift/virtual card service`,
    //   availableToUsers: true,
    //   availableToBrands: true,
    //   minLevel: 1,
    //   sub: [
    //    // ...digi_asset_navigation,
    //     ...trnx_navigation,
    //     ...profile_navigation,
    //     ...wallet_navigation,
    //     ...auth_navigation,
    //   ],
    // },
    {
      name: 'Utility Services',
      id: 'utility',

      shortDesc: `I want to use ${siteInfo.name} for services such as data, tv, electric subscriptions, airtime recharge, waec, Jamb and neco pins purchase`,
      brandShortDesc: `I want to use my website/app render services such as data, tv, electric subscriptions, airtime recharge, waec, Jamb, neco pins purchase and other related services`,
      availableToUsers: true,
      availableToBrands: true,
      minLevel: 1,
      sub: [
        ...utility_navigation,
        ...trnx_navigation,
        ...profile_navigation,
        ...purchase_nav,
        ...order_navigation,
        ...wallet_navigation,
        ...auth_navigation,
      ],
    },

    {
      name: 'Blogging',
      id: 'blog',

      shortDesc: `I want to use ${siteInfo.name} access some blog information and news updates accross all news and blog categories and join news channels`,
      brandShortDesc: `I want my website/app be exclusively for blogging, so I can monetise and make money through views, ads, package reselling and other blogging benefits`,
      availableToUsers: false,
      availableToBrands: true,
      minLevel: 1,
      sub: [...blog_navigation, ...profile_navigation, ...wallet_navigation, ...auth_navigation],
    },

    {
      name: 'Ecommerce Store',
      id: 'store',

      shortDesc: `I want to buy some products on ${siteInfo.name}, I want to access some product(s) already bought.`,
      brandShortDesc: `I want to use my website/app exclusively for ecommerce purpose, selling both physical, digital products including courses, events, subscriptions etc`,
      availableToUsers: false,
      availableToBrands: true,
      minLevel: 1,
      sub: [
        ...order_navigation,
        ...trnx_navigation,
        ...wallet_navigation,
        ...purchase_nav,
        ...profile_navigation,
        ...auth_navigation,
      ],
    },
    {
      name: 'Custom Plateform',
      id: 'custom',

      shortDesc: `I am want to access dynamic features on ${siteInfo.name}`,
      brandShortDesc: `I understand that ${siteInfo.name} can be used to build any type of website/app, what I need is not listed, I want to customize mine to fit my own business category`,
      availableToUsers: false,
      availableToBrands: true,
      minLevel: 1,
      sub: [
        ...utility_navigation,
        ...trnx_navigation,
        ...order_navigation,
        ...purchase_nav,
        ...profile_navigation,
        ...wallet_navigation,
        ...auth_navigation,
      ],
    },
  ];

  const home_menu = [
    {
      name: 'Home',
      id: 'home',
      shortDesc: 'I am a creator I want to sell digital/physical products and services on afobata',
      sub: [...home_navigation, ...auth_navigation],
    },
  ];

  let menuId = selectedProfile || user?.selectedProfile || 'home';

  if (siteInfo?.type !== 'creator') {
    menuId = 'custom';
  }

  let curatedNav: any = user_menu;

  let filteredNavigation = curatedNav.find((menu: any) => menu.id === menuId);

  const filteredHomeNavigation = home_menu.find((menu) => menu.id === 'home') || {};

  filteredNavigation = curatedNav.find((menu: any) => menu.id === menuId);

  return {
    userNav: filteredNavigation,
    homeNav: filteredHomeNavigation,
    allNavs: curatedNav,
  };
}
