'use client';
import React, { useMemo, memo, useState } from 'react';
import { isNull } from '@/app/helpers/isNull';
import { useUserContext } from '@/app/contexts/user_context';
import LazyComponent from '@/app/components/general/lazy_components';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { useCart } from '@/app/contexts/cart_context';
import { CustomButton } from '@/app/widgets/custom_button';
import { useRouter } from 'next/navigation';
import { dashboard_page } from '@/app/routes/page_routes';

export default function SetUp() {
  const { essentialData } = useUserContext();
  const { refreshPage } = useDynamicContext();
  const { setCartSidebarOpen, completed, setCart } = useCart();
  const [boarded, setBoarded] = useState(false);

  const router = useRouter();
  const { user, auth, nav, rates, brand, siteInfo } = essentialData;

  if (completed || boarded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* SVG with circular green background */}
          <div className="bg-green-100 rounded-full p-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-lg font-medium text-gray-700">{`You're good to go, continue`}</p>

          <CustomButton
            submitting={boarded}
            submittingText="Redirecting to dashboard"
            onClick={() => {
              setCartSidebarOpen(false);
              setCart([]);
              refreshPage(['user'], true);
              setBoarded(true);
              router.push(`${dashboard_page({ subBase: siteInfo?.slug!, action: 'boarded' })}`);
            }}
          >
            Go to Dashboard
          </CustomButton>
        </div>
      </div>
    );
  } else if (!isNull(user)) {
    if (isNull(brand) && ['creator', 'hoster'].includes(siteInfo?.type ?? '')) {
      return (
        <div className="pb-32">
          <LazyComponent
            componentName="BrandSetup"
            importFn={() => import('@/app/widgets/brand_setup').then((m) => m.default)}
          >
            {(BrandSetup) => (
              <BrandSetup user={user} siteInfo={siteInfo} userBrand={brand} navigation={nav} />
            )}
          </LazyComponent>
        </div>
      );
    } else if (isNull(user?.subscription)) {
      return (
        <div className="pb-32">
          <LazyComponent
            componentName="ClientView"
            importFn={() => import('@/app/views/client_view').then((m) => m.default)}
          >
            {(ClientView) => (
              <ClientView
                user={user}
                siteInfo={siteInfo}
                params={['pricing']}
                table={'pages'}
                rates={rates}
                auth={auth}
                onCallback={(data: any) => {
                  refreshPage(['user']);
                  setCartSidebarOpen(false);
                }}
              />
            )}
          </LazyComponent>
        </div>
      );
    }
  }
  return <div>set up complete</div>;
}
