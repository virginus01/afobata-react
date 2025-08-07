'use client';

import { isNull } from '@/app/helpers/isNull';
import CustomLink from '@/app/src/custom_link';
import React, { memo, useState } from 'react';

const StepsStyle1 = ({
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
  const [selected, setSelected] = useState<any>(!isNull(lists) ? { ...lists[0], index: 0 } : {});

  if (isNull(lists)) return null;

  const renderImage = () =>
    selected?.image && !isNull(selected.image) ? (
      <div className="block w-full p-6 pb-0 md:hidden">
        <img
          src={selected.image}
          alt="Step Image"
          className="object-center w-full h-full object-cover border border-gray-200"
          onError={() => console.warn('Image failed to load:', selected.image)}
        />
      </div>
    ) : null;

  return (
    <div className={`relative p-4 ${className}`}>
      <div className="px-6 mb-10 md:mb-24 mt-36 max-w-7xl md:px-0">
        <div className="my-24 font-bold text-center f-25">{preference?.title ?? ''}</div>

        <div className="relative items-center justify-center w-full md:flex md:space-x-24">
          {/* LEFT SIDE */}
          <div className="w-full md:w-2/5">
            <div className="w-full md:w-96">
              <div className="border-l">
                {lists.map((list: any, i: number) => (
                  <div
                    key={i}
                    className={`py-2 pl-5 cursor-pointer border-l ${
                      selected.index === i ? 'border-red-600 font-bold' : ''
                    }`}
                    onClick={() => setSelected({ ...list, index: i })}
                  >
                    {list.title}
                  </div>
                ))}

                {/* Mobile-only image */}
                {renderImage()}
              </div>
            </div>

            {/* CTA */}
            {preference.link && (
              <div className="inline-block mt-10 md:mt-0">
                <div className="relative flex items-center justify-center mt-10">
                  <CustomLink
                    className="px-5 py-3"
                    style={1}
                    href={preference.link}
                    siteInfo={siteInfo}
                  >
                    {preference.linkText || 'Click here'}
                  </CustomLink>
                </div>
              </div>
            )}
          </div>

          {/* Desktop-only image */}
          {selected?.image && !isNull(selected.image) && (
            <div className="hidden w-full p-6 pb-0 md:block">
              <img
                src={selected.image}
                alt="Step Image"
                className="object-center w-full h-full object-cover border border-gray-200"
                onError={() => console.warn('Image failed to load:', selected.image)}
              />
            </div>
          )}
        </div>

        {/* Background Images */}
        <div className="absolute left-0 top-28 hidden md:block z-[-1]">
          <img
            src="/images/components/setup_1_bg_img.png"
            alt="Background Image"
            className="object-cover object-center w-full h-full"
            onError={() =>
              console.warn('Background image (desktop) failed to load: setup_bg_img.png')
            }
          />
        </div>
        <div className="absolute left-0 top-28 block md:hidden z-[-1]">
          <img
            src="/images/components/setup_1_bg_img2.png"
            alt="Background Image"
            className="object-cover object-center w-full h-full"
            onError={() =>
              console.warn('Background image (mobile) failed to load: setup_1_bg_img2.png')
            }
          />
        </div>
      </div>
    </div>
  );
};

export default memo(StepsStyle1);
