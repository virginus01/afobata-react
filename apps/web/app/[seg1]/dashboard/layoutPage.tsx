'use client';

import AccessDenied from '@/app/components/access_denied';
import { isNull } from '@/app/helpers/isNull';
import { route_public_page } from '@/app/routes/page_routes';
import { Toaster } from 'sonner';
import { useUserContext } from '@/app/contexts/user_context';
import React, { useLayoutEffect, useState } from 'react';
import UserNavbarContent from '@/app/src/user_nav_content';
import LoadingScreen from '@/app/src/loading_screen';

export default function LayOutPage({
  children,
  params = {} as any,
}: {
  children: React.ReactNode;
  params: { seg1: string; base?: string; action?: string };
}) {
  const [loading, setLoading] = useState(true);
  const { essentialData, essentialDataLoading, setParams } = useUserContext();

  useLayoutEffect(() => {
    setParams(params as any);
    setLoading(essentialDataLoading);
  }, [params, setParams, essentialDataLoading]);

  const { brand, user, auth, nav } = essentialData;

  let redirectUrl = '/';

  if (loading) {
    return <LoadingScreen />;
  }

  if (isNull(brand)) {
    redirectUrl = route_public_page({ paths: ['login'] });
    return (
      <AccessDenied
        link={redirectUrl}
        info="Brand not found. Try again later or contact support if this persists."
      />
    );
  }

  if (isNull(user)) {
    redirectUrl = route_public_page({ paths: ['login'] });
    return (
      <AccessDenied
        link={redirectUrl}
        info="You have been logged out. Please log in again to regain access."
      />
    );
  }

  if (isNull(auth)) {
    redirectUrl = route_public_page({ paths: ['login'] });
    return (
      <AccessDenied
        link={redirectUrl}
        info="You have been logged out. Please log in again to regain access."
      />
    );
  }

  if (brand.isTester && !user.isTester) {
    redirectUrl = route_public_page({ paths: ['login'] });
    return (
      <AccessDenied
        subject="You're not a tester"
        buttonText="Logout"
        link={redirectUrl}
        info="You can't access this because you're not a tester"
      />
    );
  }

  if ([user?.status].includes('suspended')) {
    redirectUrl = route_public_page({
      params: [{ userId: user?.id!, case: 'suspended' }],
      paths: ['contact-us'],
    });
    return (
      <AccessDenied
        link={redirectUrl}
        info="If you think this is unjust, kindly contact the support."
        buttonText="Contact Us"
      />
    );
  }

  return (
    <UserNavbarContent showMenu={true} auth={auth}>
      <main id="user" className="w-full h-full flex-col justify-between">
        <div className="flex flex-col flex-grow-2 text-gray-600 dark:text-white dark:bg-gray-800">
          <div className="sm:ml-auto sm:w-4/5">
            <div className="flex flex-col flex-grow-0 mt-[13vh] sm:mt-[8vh]">
              <div>{children}</div>
            </div>
          </div>
        </div>
        <Toaster position="bottom-right" visibleToasts={6} richColors />
      </main>
    </UserNavbarContent>
  );
}
