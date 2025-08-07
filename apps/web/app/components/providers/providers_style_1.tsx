'use client';

import CustomImage from '@/app/widgets/optimize_image';
import Image from 'next/image';
import React, { memo } from 'react';

const ProvidersStyle1 = ({
  siteInfo,
  user,
  auth,
  className,
  preference = {},
  lists,
}: {
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
  className: string;
  component?: SiteComponent;
  preference?: Record<any, any>;
  lists: any;
}) => {
  return (
    <div className="py-16">
      <div className="container space-y-16">
        <div className="flex flex-col items-center text-center md:w-3/4 mx-auto space-y-3 relative">
          <div className="font-briston leading-none">
            Over
            <span className="text-primary relative inline-block">
              {preference.providersNumber}+
              <CustomImage
                height={100}
                width={100}
                link="/images/components/frame.svg"
                alt=""
                className="absolute top-0 left-0"
              />
            </span>
            {preference.title}
          </div>

          <p>{preference.discription}</p>
          <CustomImage
            link="/images/components/million_happy_users.png"
            className="absolute -right-[50px] -top-10  hidden md:block"
            alt=""
          />
        </div>

        <CustomImage link={preference.image} alt="service providers & partners" />
      </div>
    </div>
  );
};

export default memo(ProvidersStyle1);
