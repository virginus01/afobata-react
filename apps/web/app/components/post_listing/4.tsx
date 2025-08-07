'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getDynamicData } from '@/app/helpers/getDynamicData';
import { isNull } from '@/app/helpers/isNull';
import indexedDB from '@/app/utils/indexdb';
import Link from 'next/link';

function RecentNewsSidebar({
  siteInfo,
  data,
  pageEssentials,
  maxItems = 5,
}: {
  siteInfo: BrandType;
  data: PostTypes[];
  pageEssentials: any;
  maxItems?: number;
}) {
  const [recentNews, setRecentNews] = useState<PostTypes[]>(() => {
    if (
      pageEssentials &&
      pageEssentials.blog_posts &&
      !Array.isArray(pageEssentials?.blog_posts?.data)
    ) {
      console.info('data not array');
      return [];
    }
    // Filter and limit the posts for recent news
    const newsItems = pageEssentials?.blog_posts?.data || [];
    return newsItems.slice(0, maxItems);
  });

  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const getRecentNews = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const table = 'posts';
        const conditions = { category: 'news' }; // Assuming you have a "news" category
        const sortOptions: any = { createdAt: -1 };
        const limit = maxItems;

        const cd = await indexedDB.queryData({
          table,
          conditions,
          limit,
          sort: sortOptions ?? {},
        });

        if (!isNull(cd)) {
          setRecentNews(cd);
          setIsLoading(false);
        }

        const { data } = await getDynamicData({
          subBase: siteInfo.slug!,
          table,
          conditions,
          limit,
          sortOptions,
        });

        if (data) {
          setRecentNews(data);
          indexedDB.saveOrUpdateData({ table, data });
        }
      } catch (error) {
        console.error('Error fetching recent news:', error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    // Only fetch if we don't already have data from pageEssentials
    if (recentNews.length === 0) {
      getRecentNews();
    } else {
      setIsLoading(false);
    }
  }, [siteInfo, maxItems, recentNews.length]);

  return (
    <aside className="bg-white rounded-lg shadow-md p-4 w-full">
      <div className="border-b border-gray-200 pb-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent News</h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {recentNews.map((news, index) => (
            <Link key={index} href={news.slug ?? '#'} className="block group">
              <div className="flex items-start space-x-3">
                {news?.images?.[0]?.url ? (
                  <div className="flex-shrink-0">
                    <Image
                      src={news.images[0].url}
                      alt={news.title ?? ''}
                      className="w-16 h-16 object-cover rounded"
                      height={64}
                      width={64}
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded"></div>
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                    {news.title}
                  </h3>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>{news.createdAt}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {recentNews.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            href="/news"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all news
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </aside>
  );
}

export default RecentNewsSidebar;
