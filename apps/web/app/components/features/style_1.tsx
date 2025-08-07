'use client';
import { isNull } from '@/app/helpers/isNull';
import CustomLink from '@/app/src/custom_link';
import LazyLucideIcon from '@/app/widgets/lazy_lucide_icon';
import React, { useEffect, useRef } from 'react';
import { memo } from 'react';

const FeatureStyle1 = ({
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
    <div className="px-2 mx-auto md:px-4 my-28 max-w-7xl">
      <div className="max-w-lg mx-auto mb-20 font-bold text-center f-25">
        {preference?.title ?? ''}
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {!isNull(lists) &&
          lists.map((list: any, i: number) => {
            const listData: any = list;

            return (
              <div
                className={`flex items-center space-x-4 cursor-pointer md:space-x-0 md:block text-${listData.color} bg-${listData.bg_color} ${listData.bg_color && 'rounded-lg'}  p-3`}
                key={i}
              >
                <div>
                  {listData.icon && (
                    <LazyLucideIcon className="text-gray-400" iconName={listData?.icon} />
                  )}
                </div>

                <div>
                  <div className="mt-3 mb-2 font-bold">{listData?.title ?? ''}</div>
                  <div>{listData?.description ?? ''}</div>
                </div>

                {listData.link && (
                  <CustomLink
                    siteInfo={siteInfo}
                    href={listData.link}
                    className="pt-5 font-semibold cursor-pointer text-brand-blue"
                  >
                    {listData.linkText ?? 'Learn more'}
                  </CustomLink>
                )}
              </div>
            );
          })}
      </div>

      <div className="flex items-center justify-center mt-20">
        {preference.link && (
          <div className="relative flex items-center justify-center">
            <CustomLink
              style={1}
              href={preference.link}
              siteInfo={siteInfo}
              className="py-3 px-5 whitespace-nowrap"
            >
              {preference.linkText ?? 'See all features'}
            </CustomLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FeatureStyle1);
