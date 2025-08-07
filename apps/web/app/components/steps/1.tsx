'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';

function Steps({
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
  const steps = preference?.steps ?? [];
  const style = parseInt(preference.style ?? 1);

  const Style1 = dynamic(() => import('@/app/components/steps/style_1'), {
    loading: () => <div></div>,
    ssr: false,
  });

  const Style2 = dynamic(() => import('@/app/components/steps/style_2'), {
    loading: () => <div></div>,
    ssr: false,
  });

  switch (style) {
    case 2:
      return (
        <Style2
          siteInfo={siteInfo}
          user={user}
          auth={auth}
          className={className}
          lists={steps}
          preference={preference}
        />
      );

    case 1:
    default:
      return (
        <Style1
          siteInfo={siteInfo}
          user={user}
          auth={auth}
          className={className}
          lists={steps}
          preference={preference}
        />
      );
  }
}

export default memo(Steps);
