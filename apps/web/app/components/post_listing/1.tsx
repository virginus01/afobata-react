'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getDynamicData } from '@/app/helpers/getDynamicData';
import { isNull } from '@/app/helpers/isNull';
import indexedDB from '@/app/utils/indexdb';
import Link from 'next/link';

function List1({
  siteInfo,
  data,
  pageEssentials,
}: {
  siteInfo: BrandType;
  data: PostTypes[];
  pageEssentials: any;
}) {
  const [posts, setPaginatedData] = useState<PostTypes[]>(() => {
    if (
      pageEssentials &&
      pageEssentials.blog_posts &&
      !Array.isArray(pageEssentials?.blog_posts?.data)
    ) {
      console.info('data not array');
      return [];
    }
    return pageEssentials?.blog_posts?.data ?? [];
  });

  const [trendingPosts, setTrendingPosts] = useState<PostTypes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const getRecent = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const table = 'posts';
        const conditions = {};
        const sortOptions = { createdAt: -1 };

        const cd = await indexedDB.queryData({ table, conditions });
        if (!isNull(cd)) {
          setPaginatedData(cd);
          // Set trending posts as a subset of regular posts
          setTrendingPosts(cd.slice(5, 9));
          setIsLoading(false);
        }

        const { data } = await getDynamicData({
          subBase: siteInfo.slug!,
          table,
          conditions,
        });

        if (data) {
          setPaginatedData(data);
          // Set trending posts as a subset of regular posts
          setTrendingPosts(data.slice(5, 9));
          indexedDB.saveOrUpdateData({ table, data });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    //  getRecent();
  }, [siteInfo.slug]);

  return (
    <div className="max-w-7xl mx-auto py-2">
      {/* Featured Post */}
      {posts.length > 0 && (
        <div className="mb-4">
          <Link href={posts[0]?.slug ?? '#'} className="block">
            <div className="relative">
              {posts[0]?.images?.[0]?.url && (
                <Image
                  src={posts[0].images[0].url}
                  alt={posts[0].title ?? ''}
                  className="w-full h-64 object-cover"
                  height={256}
                  width={800}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                <div className="inline-block bg-red-600 text-white text-xs font-medium px-2 py-1 mb-2">
                  BREAKING NEWS
                </div>
                <h2 className="text-lg font-bold">{posts[0].title}</h2>
                <div className="flex items-center text-xs text-gray-300 mt-1">
                  <span>Published: {posts[0].createdAt}</span>
                  <span className="mx-2">•</span>
                  <span>Source: {siteInfo.name}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 2x2 Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {posts.slice(1, 5).map((post, index) => (
          <Link key={index} href={post.slug ?? '#'} className="block">
            <div className="border border-gray-200">
              {post?.images?.[0]?.url && (
                <div className="relative">
                  <Image
                    src={post.images[0].url}
                    alt={post.title ?? ''}
                    className="w-full h-48 object-cover"
                    height={192}
                    width={400}
                  />
                  <div className="absolute bottom-0 left-0 bg-red-600 text-white text-xs px-2 py-1">
                    {post.category || 'NEWS'}
                  </div>
                </div>
              )}
              <div className="p-3">
                <h3 className="font-bold text-sm">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-2">
                  Published: {post.createdAt} • Source: {siteInfo.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Trending News Section */}
      <div className="mb-6">
        <div className="bg-gray-100 p-2 mb-4">
          <h2 className="text-sm font-bold text-gray-800">TRENDING NEWS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingPosts.map((post, index) => (
            <Link key={index} href={post.slug ?? '#'} className="flex items-start mb-4">
              {post?.images?.[0]?.url && (
                <Image
                  src={post.images[0].url}
                  alt={post.title ?? ''}
                  className="w-24 h-20 object-cover mr-3"
                  height={80}
                  width={96}
                />
              )}
              <div>
                <h3 className="font-bold text-sm">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Published: {post.createdAt} • Source: {siteInfo.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default List1;
