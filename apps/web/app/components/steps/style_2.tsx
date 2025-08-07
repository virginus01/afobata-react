'use client';

import { isNull } from '@/app/helpers/isNull';
import CustomLink from '@/app/src/custom_link';
import CustomImage from '@/app/widgets/optimize_image';
import React, { memo } from 'react';

const StepsStyle2 = ({
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
  lists: any[];
}) => {
  if (isNull(lists)) return null;

  return (
    <div className="my-16">
      <div className="container p-4 sm:p-2">
        <div className="grid md:grid-cols-2 gap-10">
          {preference.image && (
            <div className="order-2 md:order-1 p-10 md:p-20 md:pt-0">
              <CustomImage
                link={preference.image ?? ''}
                alt=""
                className="rounded-full border border-[hsl(var(--primary-background-light))]"
                height={500}
                width={500}
              />
            </div>
          )}

          <div className="order-1 md:order-2 space-y-5">
            <div className="font-briston leading-none text-5xl text-[hsl(var(--primary-background-light))]">
              {preference.title}
            </div>

            <div className="space-y-3">
              {lists.map((list: any, i: number) => (
                <div className="flex items-start space-x-3" key={i}>
                  <button className="min-w-[40px] min-h-[40px] rounded-full border brand-border-primary text-[hsl(var(--primary-background-light))]">
                    {i + 1}
                  </button>
                  <div className="">
                    <h2 className="text-2xl font-['Briston']">{list.title}</h2>
                    <p className="font-light">{list.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {preference.link && (
              <div>
                <CustomLink style={1} href={preference.link ?? '#'} className="px-5 py-3">
                  <div className="flex flex-row space-x-2">
                    <span>{preference.linkText ?? 'Get the app'} </span>
                    <CustomImage
                      link="/images/components/arrow-right.svg"
                      alt=""
                      className="brightness-200 brand-text-primary"
                      width={30}
                      height={5}
                    />
                  </div>
                </CustomLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(StepsStyle2);
