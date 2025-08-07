'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component for better UX
const ComponentLoader = () => (
  <div className="p-4 space-y-3 w-full">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
  </div>
);

// Error fallback component
const ComponentError = ({ componentKey }: { componentKey: string }) => (
  <div className="p-4 text-red-500 border border-red-300 rounded">
    Failed to load component: {componentKey}
  </div>
);

// Helper function to get component with dynamic import based on key
export const getComponent = (key: keyof ComponentMap): ComponentType<any> | null => {
  switch (key) {
    case 'creatorHero':
      return dynamic(() => import('@/app/components/heros/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'header':
      return dynamic(() => import('@/app/components/headers/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'header2':
      return dynamic(() => import('@/app/components/headers/2'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'footer':
      return dynamic(() => import('@/app/components/footers/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'recentPosts':
      return dynamic(() => import('@/app/components/post_listing/3'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'recentPosts2':
      return dynamic(() => import('@/app/components/post_listing/2'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'langSwitcher':
      return dynamic(() => import('@/app/components/lang_switcher/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'productListing1':
      return dynamic(() => import('@/app/components/product_listing/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'login':
      return dynamic(() => import('@/app/components/login/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'signUp':
      return dynamic(() => import('@/app/components/signup/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'blogHeader':
      return dynamic(() => import('@/app/components/blog_headers/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'postBody':
      return dynamic(() => import('@/app/components/post_body/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'utilityBill':
      return dynamic(() => import('@/app/components/utility/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'intro':
      return dynamic(() => import('@/app/components/intro/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'newsListing1':
      return dynamic(() => import('@/app/components/post_listing/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'blogListing1':
      return dynamic(() => import('@/app/components/post_listing/3'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'pricing':
      return dynamic(() => import('@/app/components/pricing/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'pdh':
      return dynamic(() => import('@/app/components/product_detail_header/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'pbc':
      return dynamic(() => import('@/app/components/product_body_content/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'desc_card':
      return dynamic(() => import('@/app/components/desc_card/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'blogBody3':
      return dynamic(() => import('@/app/components/post_body/3'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'appDownloadHero1':
      return dynamic(() => import('@/app/components/app_download/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'purchasedView':
      return dynamic(() => import('@/app/components/purchased_view/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'features':
      return dynamic(() => import('@/app/components/features/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'steps':
      return dynamic(() => import('@/app/components/steps/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    case 'providers':
      return dynamic(() => import('@/app/components/providers/1'), {
        loading: () => <ComponentLoader />,
        ssr: false,
      });

    default:
      return null;
  }
};

// Backward compatibility - empty object since we're using getComponent function
const componentMap = {};

export default componentMap;
