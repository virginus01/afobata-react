'use client';
import { isNull } from '@/app/helpers/isNull';
import CustomLink from '@/app/src/custom_link';
import LazyLucideIcon from '@/app/widgets/lazy_lucide_icon';
import { memo } from 'react';

const FeatureStyle2 = ({
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
    <div className="mx-auto max-w-7xl p-2">
      <div className="text-3xl font-bold text-center md:text-4xl py-14">
        {preference?.title ?? ''}
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {!isNull(lists) &&
          lists.map((list: any, i: number) => {
            const listData: any = list;

            return (
              <div
                className={`w-full p-2 rounded-lg md:w-full bg-opacity-40 text-${listData.color} bg-${listData.bg_color}`}
                key={i}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer">
                  {listData.icon && (
                    <LazyLucideIcon className="text-gray-400" iconName={listData?.icon} />
                  )}
                </div>
                <div className="py-3 font-bold">{listData?.title ?? ''}</div>
                <div className="leading-snug mb-2">{listData?.description ?? ''}</div>
                {listData.link && (
                  <CustomLink
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
            <CustomLink style={1} href={preference.link} className="py-3 px-5 whitespace-nowrap">
              {preference.linkText ?? 'See all features'}
            </CustomLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FeatureStyle2);
