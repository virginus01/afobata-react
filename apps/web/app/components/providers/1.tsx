'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';

function Providers({
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
  const providers = preference?.providers ?? [];
  const style = parseInt(preference.style ?? 1);

  const Style1 = dynamic(() => import('@/app/components/providers/providers_style_1'), {
    loading: () => <div></div>,
    ssr: false,
  });

  switch (style) {
    case 1:
    default:
      return (
        <Style1
          siteInfo={siteInfo}
          user={user}
          auth={auth}
          className={className}
          lists={providers}
          preference={preference}
        />
      );
  }
}

export default memo(Providers);
