'use client';

import React, { useEffect, useState, use } from 'react';

import PackageActionIndex from '@/dashboard/packages/[package_action]';

export default function PackageAction(props: { params: Promise<{ package_action: string }> }) {
  const params = use(props.params);
  return <PackageActionIndex params={params} initialColumns={[]} />;
}
