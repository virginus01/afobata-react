'use client';
import { getDynamicData } from '@/app/helpers/getDynamicData';
import { isNull } from '@/app/helpers/isNull';
import indexedDB from '@/app/utils/indexdb';
import Link from 'next/link';
import React, { memo, useEffect, useRef, useState } from 'react';

function List2({
  siteInfo,
  config,
  className,
  defaultData = [],
  component = {} as any,
}: {
  siteInfo: BrandType;
  config: any;
  className: string;
  defaultData: any[];
  component?: SiteComponent;
}) {
  const [paginatedData, setPaginatedData] = useState(defaultData);
  const [liveData, setliveData] = useState<any[]>([]);
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
          setliveData(data);
          indexedDB.saveOrUpdateData({ table, data });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getRecent();
  }, [siteInfo.slug]);

  return (
    <div className={`bg-white w-full shadow-xl ring-1 ring-gray-900/5 rounded`} key={component.id}>
      <div
        className={`bg-gray-500 flex items-center justify-center gap-x-4 px-4 py-2 text-xs font-bold text-center text-white rounded-tr rounded-tl`}
      >
        Recent Posts
      </div>
      <div className="pt-2 space-y-2 py-2 px-2 text-base text-gray-600">
        {isLoading ? (
          <ul className="ml-1 inline-block w-full animate-pulse">
            {[...Array(5)].map((_, index) => (
              <li key={index} className="py-2">
                <div className="flex items-center">
                  <div className="bg-gray-300 w-1 h-1 mr-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="ml-1 inline-block w-full">
            {paginatedData.map(({ _id, title, slug }) => (
              <li key={_id} className="py-2">
                <Link prefetch={true} href={`/${slug}`}>
                  <div className="flex items-center">
                    <div className="bg-red-500 w-1 h-1 mr-2"></div>
                    <div className="text-xs align-middle line-clamp-1 lowercase">{title}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export default List2;
