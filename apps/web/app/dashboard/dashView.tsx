'use client';
import React, { useMemo, memo } from 'react';
import Action from '@/app/dashboard/action';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import LoadingScreen from '@/src/loading_screen';
import { useUserContext } from '@/app/contexts/user_context';
import UserNavbarContent from '@/src/user_nav_content';
import View from '@/app/views/view';
import SetUp from '@/dashboard/setup';
import { convertDateTime } from '@/helpers/convertDateTime';
import ClientView from '@/app/views/client_view';

function DashView({ params }: { params: { base: string; action: string; seg1: string } }) {
  const { essentialData } = useUserContext();

  const { user, auth, siteInfo, nav, rates, brand } = essentialData;

  const missing = useMemo(() => {
    return findMissingFields({ user, siteInfo, rates });
  }, [user, siteInfo, rates]);

  if (isNull(auth) || convertDateTime() > convertDateTime(auth.expiresAt)) {
    return (
      <ClientView
        siteInfo={siteInfo}
        params={['login']}
        table={'pages'}
        rates={rates}
        auth={auth}
        onCallback={() => {}}
      />
    );
  }

  if (missing) {
    console.info('Missing fields detected:', missing);
    return <LoadingScreen />;
  }

  if (!isNull(user)) {
    if (isNull(brand) && ['creator', 'hoster'].includes(siteInfo?.type ?? '')) {
      return <SetUp />;
    } else if (isNull(user?.subscription)) {
      return <SetUp />;
    }
  }

  return (
    <UserNavbarContent auth={auth}>
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 h-full overflow-y-auto scrollbar-hide-mobile ">
          <Action
            defaultData={{}}
            action={params.action}
            base={params.base}
            seg1={params.seg1}
            navigation={nav}
          />
        </div>
      </div>
    </UserNavbarContent>
  );
}

// Wrap the component with React.memo for parent re-render optimization
export default memo(DashView);
