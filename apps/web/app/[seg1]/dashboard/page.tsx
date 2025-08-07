import React from 'react';
import DashView from '@/app/dashboard/dashView';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { isNull } from '@/app/helpers/isNull';
import View from '@/app/views/view';

export default async function Page(props: {
  params: Promise<{ action: string; base: string; seg1: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const auth = await getAuthSessionData();

  const filters = await props?.searchParams;

  if (isNull(auth) || filters?.action === 'login') {
    return <View params={['login']} paramSource={'1'} />;
  }

  return <DashView params={params} />;
}
