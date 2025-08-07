import React from 'react';
import { CalendarDays, Clock, User } from 'lucide-react';
import { SectionOption } from '@/app/types/section';
import { isNull } from '@/app/helpers/isNull';
import Image from 'next/image';
import { PostInhouseAds } from '@/app/special_widgets/ads/post_inhouse';

const BlogHeader = ({ data, siteInfo }: { data: PostTypes; siteInfo: BrandType }) => {
  if (isNull(data)) {
    <>no blog data</>;
    return;
  }

  if (data?.images!) {
    let image = data?.images[0] ?? {};
    return (
      <div>
        <div className="relative w-full h-96 overflow-hidden">
          <Image
            src={image.url!}
            alt={data.title ?? 'Featured Image'}
            className="absolute inset-0 w-full h-full object-cover"
            height={500}
            width={500}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">{data.title}</h1>
              {data.title && <p className="text-xl text-gray-200">{data.title}</p>}
              <div className="flex items-center space-x-6 text-gray-200">
                {data.author && (
                  <div className="flex items-center space-x-2">
                    <User size={20} />
                    <span>{'author'}</span>
                  </div>
                )}
                {data.createdAt && (
                  <div className="flex items-center space-x-2">
                    <CalendarDays size={20} />
                    <span>{data.createdAt}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Clock size={20} />
                  <span>{'some'} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PostInhouseAds siteInfo={siteInfo} data={data as any} style={1} />
      </div>
    );
  }

  // No image version with gradient background
  return (
    <div className="w-full h-full flex justify-center items-center my-16">
      <h1 className="text-3xl font-bold text-gray-800">{data.title}</h1>
    </div>
  );
};

export default BlogHeader;
