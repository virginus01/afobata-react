import { UserContextProvider } from '@/app/contexts/user_context';
import NoCopy from '@/app/src/prevent_copy';
import React, { Suspense } from 'react';
import { isNull } from '@/app/helpers/isNull';
import View from '@/app/views/view';
import { verifyJWT } from '@/app/helpers/verifyJWT';
import { StatusBarInit } from '@/app/components/statusbarInit';
import { getAuthSessionData } from '@/app/controller/auth_controller';

export default async function BSLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ seg1: string; base?: string; action?: string }>;
}) {
  const resolvedParams = await params;

  const auth = await getAuthSessionData();

  if (isNull(auth)) {
    console.warn('no session found');
    return <View params={['login']} paramSource={'1'} />;
  }

  const jwtVerify = await verifyJWT(auth?.accessToken ?? '');

  if (isNull(jwtVerify) || jwtVerify.userId !== auth.userId) {
    console.warn('jwt verification failed');
    return <View params={['login']} paramSource={'1'} />;
  }

  return (
    <>
      <StatusBarInit overlay={false} style="light" />
      <UserContextProvider auth={auth}>
        <NoCopy>{children}</NoCopy>
      </UserContextProvider>
    </>
  );
}
