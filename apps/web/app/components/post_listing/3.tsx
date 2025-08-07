'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Clock, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getDynamicData } from '@/app/helpers/getDynamicData';
import { isNull } from '@/app/helpers/isNull';
import indexedDB from '@/app/utils/indexdb';
import Link from 'next/link';

function BlogList({
  siteInfo,
  data,
  pageEssentials,
}: {
  siteInfo: BrandType;
  data: DataType[];
  pageEssentials: any;
}) {
  const [posts, setPaginatedData] = useState<DataType[]>(() => {
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
          setIsLoading(false);
        }

        const { data } = await getDynamicData({
          subBase: siteInfo.slug!,
          table,
          conditions,
        });

        if (data) {
          setPaginatedData(data);
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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Featured Blog Post */}
      {posts.length > 0 && (
        <article className="mb-16">
          <Link href={posts[0]?.slug ?? '#'}>
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {posts[0]?.images?.[0]?.url && (
                <div className="md:w-1/2">
                  <Image
                    src={posts[0].images[0].url}
                    alt={posts[0].title ?? ''}
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                    height={384}
                    width={600}
                  />
                </div>
              )}
              <div className="md:w-1/2">
                {posts[0].category && (
                  <div className="mb-4">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                      {posts[0].category}
                    </span>
                  </div>
                )}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{posts[0].title}</h2>
                <p className="text-gray-600 mb-6 text-lg line-clamp-3">{posts[0].description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <User className="h-5 w-5 mr-2" />
                  <span className="mr-6">{posts[0].author || 'Admin'}</span>
                  <CalendarDays className="h-5 w-5 mr-2" />
                  <span className="mr-6">{posts[0].createdAt}</span>
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{posts[0].readTime || '5 min read'}</span>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700">
                  Read More <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </Link>
        </article>
      )}

      {/* Blog Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.slice(1).map((post, index) => (
          <article
            key={index}
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-xl hover:transform hover:scale-105"
          >
            <Link href={post.slug ?? '#'}>
              {post?.images?.[0]?.url && (
                <div className="relative">
                  <Image
                    src={post.images[0].url}
                    alt={post.title ?? ''}
                    className="w-full h-48 object-cover"
                    height={192}
                    width={384}
                  />
                  {post.category && (
                    <div className="absolute bottom-0 left-0 m-4">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span className="mr-4">{post.createdAt}</span>
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{post.readTime || '3 min read'}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Load More */}
      {posts.length > 6 && (
        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md">
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
}

export default BlogList;
