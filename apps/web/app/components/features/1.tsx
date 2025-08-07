'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';

function Feature({
  siteInfo,
  user,
  auth,
  className,
  preference = {},
}: {
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
  className: string;
  component?: SiteComponent;
  preference?: Record<any, any>;
}) {
  const lists = preference?.features ?? [];
  const style = parseInt(preference.style ?? 1);

  const FeatureStyle1 = dynamic(() => import('@/app/components/features/style_1'), {
    loading: () => <div></div>,
    ssr: false,
  });

  const FeatureStyle2 = dynamic(() => import('@/app/components/features/style_2'), {
    loading: () => <div></div>,
    ssr: false,
  });

  switch (style) {
    case 2:
      return (
        <FeatureStyle2
          siteInfo={siteInfo}
          user={user}
          auth={auth}
          className={className}
          lists={lists}
          preference={preference}
        />
      );
    case 1:
    default:
      return (
        <FeatureStyle1
          siteInfo={siteInfo}
          user={user}
          auth={auth}
          className={className}
          lists={lists}
          preference={preference}
        />
      );
  }
}

export default memo(Feature);
