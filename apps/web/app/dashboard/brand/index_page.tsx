import React from 'react';
import { BrandPageIndex } from '@/dashboard/brand';
import { AppBuilder } from '@/dashboard/brand/app_builder';
import Internationalize from '@/dashboard/brand/internationalize';
import CreateBrand from '@/dashboard/brand/create_brand';
import { isNull } from '@/app/helpers/isNull';
import CustomDomain from '@/dashboard/brand/custom_domain';
import SubsidiariesOverview from '@/app/dashboard/brand/subsidiaries/overview';

interface BrandPageIndexProps {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
  brand: BrandType;
  iniProfiles: any[];
  navigation: any;
}

export default function BrandIndexPage({
  params,
  user,
  siteInfo,
  iniProfiles = [],
  brand,
  navigation,
}: BrandPageIndexProps) {
  let pageContent = <></>;

  if (isNull(user.brand)) {
    return <CreateBrand siteInfo={brand!} user={user!} />;
  }

  switch (params.action) {
    case 'settings':
      pageContent = (
        <BrandPageIndex
          siteInfo={brand!}
          user={user!}
          params={params}
          iniProfiles={navigation?.allNavs || []}
        />
      );
      break;

    case 'domains':
      pageContent = <CustomDomain />;
      break;

    case 'build-app':
      pageContent = <AppBuilder user={user!} siteInfo={brand!} />;
      break;

    case 'text-customize':
      pageContent = <Internationalize user={user!} siteInfo={brand!} />;
      break;

    case 'subsidiaries':
      pageContent = <SubsidiariesOverview />;
      break;

    default:
      pageContent = <>Invalid Brand Action</>;
      break;
  }

  return <div className="pb-48">{pageContent}</div>;
}
