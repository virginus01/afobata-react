import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import StaticPages from '@/dashboard/pages/static_pages';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { flattenCondition } from '@/app/helpers/flattenCondition';
import { isNull } from '@/app/helpers/isNull';

import { Data } from '@/app/models/Data';

export default function PagesIndex({
  user,
  siteInfo,
  auth,
  params,
  id,
  iniSearchParams,
  existingPages,
  type,
}: {
  user: UserTypes;
  siteInfo: BrandType;
  id: string;
  iniSearchParams: any;
  auth: AuthModel;
  existingPages: Data[];
  params: { action: string; base: string; seg1: string };
  type?: string;
}) {
  const [limit, setLimit] = useState(10);
  const [conditions, setConditions] = useState<any>(() => {
    const initial: any =
      user.selectedProfile === 'hoster'
        ? { userId: user.id, parentBrandId: user?.brand?.id }
        : { userId: user.id, parentBrandId: siteInfo.id };
    if (!isNull(type)) initial.type = type;
    return initial;
  });
  const [filteredData, setFilteredData] = useState<Data[]>(existingPages);

  const [filter, setFilter] = useState<any>(() => {
    const initial: any = {};
    return initial;
  });

  const [loading, setLoading] = useState(true);

  const { fetchData, refreshKey } = useDynamicContext();

  const andConditions = useMemo(() => {
    return [
      { ...conditions },
      ...(!isNull(filter) && Object.keys(filter).length > 0 ? [{ ...filter }] : []),
    ];
  }, [filter, conditions]);

  let pageContent = <></>;

  let tag: string = `${user?.selectedProfile ?? ''}_${siteInfo?.id}_${flattenCondition(
    andConditions,
  )}`;

  useLayoutEffect(() => {
    const getData = async () => {
      try {
        const table = 'pages';

        const andConditions = [
          { ...conditions },
          ...(!isNull(filter) && Object.keys(filter).length > 0 ? [{ ...filter }] : []),
        ];

        const result: any = await fetchData({
          table,
          tag,
          conditions: { $and: andConditions },
          limit,
          sortOptions: {},
          brandSlug: siteInfo?.slug!,
        });

        if (!isNull(result)) {
          setFilteredData(
            result.map((item: Data) => ({
              ...item,
              action: 'add',
            })),
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [params.action, params.base, user.id, siteInfo.slug, refreshKey, type, filter]);

  const handleSearch = useCallback((searchValue: string) => {
    const newConditions = {
      $or: [
        { title: { $regex: searchValue, $options: 'i' } },
        { id: { $regex: searchValue, $options: 'i' } },
      ],
    };
    setFilter(newConditions);
    //  setSearchPhrase(searchValue);
  }, []);

  switch (params.action) {
    case 'static':
      pageContent = (
        <StaticPages
          existingPages={filteredData}
          siteInfo={siteInfo}
          user={user}
          id={id}
          iniSearchParams={iniSearchParams}
        />
      );
      break;

    case 'landing':
      pageContent = (
        <StaticPages
          existingPages={existingPages}
          siteInfo={siteInfo}
          user={user}
          id={id}
          iniSearchParams={iniSearchParams}
        />
      );
      break;

    default:
      <>invalid page route</>;
  }

  return pageContent;
}
