'use client';
import React, { useEffect, useState } from 'react';
import { getDynamicData } from '@/app/helpers/getDynamicData';
import Link from 'next/link';
import { updateCashViews } from '@/app/controller/base_controller';
import Image from 'next/image';
import { PostInhouseAds } from '@/app/special_widgets/ads/post_inhouse';

export const BlogView = ({ data, siteInfo }: { data: DataType; siteInfo: BrandType }) => {
  const [posts, setPosts] = useState<PostTypes[] | null>(null);
  const [featuredPost, setFeaturedPost] = useState<PostTypes | null>(null);
  const [popularPosts, setPopularPosts] = useState<PostTypes[] | null>(null);
  const [featuredPosts, setFeaturedPosts] = useState<PostTypes[] | null>(null);

  useEffect(() => {
    const updateCViews = async () => {
      await updateCashViews({ siteInfo, data: data });
    };
    if (siteInfo.inhouseMonetization && siteInfo.inhouseMonetization === 'active') {
      updateCViews();
    }
  }, [data, siteInfo]);

  useEffect(() => {
    const getPosts = async () => {
      const { data, isLoading, msg, meta } = await getDynamicData({
        subBase: siteInfo.slug!,
        table: 'posts',
        conditions: {},
      });

      setPosts(data);
      setFeaturedPosts(data);
      setPopularPosts(data);
      setFeaturedPost([data] as PostTypes);
    };

    getPosts();
  }, [siteInfo.id, siteInfo.slug]);

  return (
    <section className="container mx-auto px-4 lg:px-20 my-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-8 space-y-6">
          {/* Featured Image */}
          {data.image && (
            <div className="w-full">
              <Image
                src={data.image}
                alt={data.title || ''}
                className="w-full rounded-lg shadow-lg border border-gray-200"
              />
            </div>
          )}

          {/* Post Title */}
          <h1 className="text-4xl font-bold text-gray-800">{data.title}</h1>

          {/* Post Metadata */}
          <div className="text-sm text-gray-500 mb-6">
            <p>
              By {data.ownerData?.firstName || 'a user'} •{' '}
              {new Date(data.createdAt!).toLocaleDateString()}
            </p>
          </div>

          {/* In-House Ads */}
          <PostInhouseAds siteInfo={siteInfo} data={data} style={2} />

          {/* Blog Content */}
          <div
            className="prose max-w-full prose-lg prose-gray border-t pt-6 border-gray-200"
            dangerouslySetInnerHTML={{ __html: data.body! }}
          ></div>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['store'].map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="fixed lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
            <ul>
              {posts &&
                posts?.map((post, index) => (
                  <li key={index} className="mb-3">
                    <Link href={post.slug!} className="text-blue-600 hover:underline text-sm">
                      {post.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Ads or Additional Sidebar Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Advertisement</h2>
            <PostInhouseAds siteInfo={siteInfo} data={data} style={1} />
          </div>
        </aside>
      </div>
    </section>
  );
};
