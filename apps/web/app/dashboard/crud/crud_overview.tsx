'use client';

import React, { useEffect, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { SectionHeader } from '@/app/src/section_header';
import { CustomButton } from '@/app/widgets/widgets';
import { FaPlus } from 'react-icons/fa';
import { crud_page } from '@/app/routes/page_routes';
import { useBaseContext } from '@/app/contexts/base_context';
import CustomDrawer from '@/app/src/custom_drawer';
import { SmartFilter } from '@/app/widgets/smart_filter';
import DropAction from '@/dashboard/drop/drop_action';
import { flattenCondition } from '@/app/helpers/flattenCondition';
import { isAdmin } from '@/app/helpers/isAdmin';
import { isNull } from '@/app/helpers/isNull';
import { Data } from '@/app/models/Data';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import FilterSortSearchBar from '@/app/widgets/searchFilterAndSort';
import ListView from '@/app/widgets/listView';
import SideBarActions from '@/dashboard/sidebar_content';

interface OverViewIndexProps {
  params: { action: string; base: string; seg1?: string };
  user: UserTypes;
  siteInfo: BrandType;
  columns?: string[];
  type: string;
  status: any;
  table: string;
  defaultData: any[];
  baseData: BaseDataType;
}

function CrudOverView({
  params,
  user,
  siteInfo,
  columns = [],
  type,
  status = '',
  table,
  defaultData = [],
  baseData,
}: OverViewIndexProps) {
  const { addRouteData } = useBaseContext();
  const [searchPhrase, setSearchPhrase] = useState('');
  const actionTitle = `${status || type} ${params.base}`;
  const [action, setAction] = useState(params.action);
  const [base, setBase] = useState(params.base);
  const [sideBarClose, setSideBarClose] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<Data[]>(Array.isArray(defaultData) ? [] : []);
  const [selectedData, setSelectedData] = useState([]);
  const [activeData, setActiveData] = useState<any>();
  const [limit, setLimit] = useState(10);
  const [conditions, setConditions] = useState<any>(() => {
    const initial: any =
      user.selectedProfile === 'hoster'
        ? { userId: user.id, parentBrandId: user?.brand?.id }
        : { userId: user.id, parentBrandId: siteInfo.id };
    if (!isNull(type)) initial.type = type;
    return initial;
  });

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

  let tag: string = `${user?.selectedProfile ?? ''}_${siteInfo?.id}_${flattenCondition(
    andConditions,
  )}`;

  useLayoutEffect(() => {
    const getData = async () => {
      try {
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
    setSearchPhrase(searchValue);
  }, []);

  useEffect(() => {
    if (sideBarClose) {
      setSideBarClose(false);
    }
  }, [sideBarClose]);
  const RightButton: React.FC = () => (
    <CustomButton
      bordered={false}
      icon={<FaPlus />}
      iconPosition="before"
      onClick={() => {
        addRouteData({
          isOpen: true,
          title: `Add ${params.base}`,
          rates: {},
          type,
          base: params.base,
          action: type === 'package' ? (isAdmin(user) ? 'add' : 'drop') : 'add',
          slug: crud_page({
            type: type,
            base: params.base,
            action: type === 'package' ? (isAdmin(user) ? 'add' : 'drop') : 'add',
            subBase: siteInfo.slug!,
          }),
          isHeightFull: params.base === 'pages' ? 'yes' : 'no',
          isWidthFull: params.base === 'pages' ? 'yes' : 'no',
        });
      }}
    >
      <div className="p-0.5"> {`New ${baseData?.baseData?.title ?? ' Item'}`}</div>
    </CustomButton>
  );

  let showRightButtons = ['products', 'posts', 'pages'].includes(params.base);

  return (
    <>
      <SectionHeader
        title={actionTitle}
        style={3}
        rightWidget={showRightButtons && action !== 'drop' ? <RightButton /> : <></>}
      >
        <FilterSortSearchBar
          originalData={filteredData}
          setData={setFilteredData}
          searchableKeys={['title', 'description']}
          sortableKeys={['price', 'views', 'sales']}
          placeholder="Search title or description"
          onSearch={handleSearch}
        />

        {action === 'drop' ? (
          <DropAction
            params={params}
            siteInfo={siteInfo}
            user={user}
            auth={{}}
            defaultData={filteredData}
          />
        ) : (
          <ListView
            data={filteredData}
            setActiveData={(data) => {
              setActiveData(data);
            }}
            display={[]}
          />
        )}
      </SectionHeader>

      {isSortOpen && (
        <CustomDrawer
          direction="right"
          isWidthFull={false}
          isHeightFull={true}
          showHeader={true}
          isOpen={isSortOpen}
          onClose={() => setIsSortOpen(false)}
          header="Switch Profile"
        >
          {''}
        </CustomDrawer>
      )}

      {isFilterOpen && (
        <CustomDrawer
          direction="right"
          isWidthFull={false}
          isHeightFull={true}
          showHeader={true}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          header="Filter"
        >
          <SmartFilter
            data={[]}
            onFilteredDataChange={(data: any) => {
              setFilteredData(data);
            }}
          />
        </CustomDrawer>
      )}

      {activeData && (
        <CustomDrawer
          direction="right"
          isWidthFull={false}
          isHeightFull={true}
          showHeader={true}
          isOpen={!isNull(activeData)}
          onClose={() => setActiveData({})}
          header={activeData.title || activeData.name || 'Action'}
        >
          <SideBarActions
            onDelete={() => {
              setFilteredData((prev) => [...prev, activeData.id]);
              setActiveData({});
            }}
            onClose={() => {
              setActiveData({});
            }}
            data={activeData!}
            base={params.base}
            siteInfo={siteInfo}
            user={user}
          />
        </CustomDrawer>
      )}
    </>
  );
}

export default CrudOverView;
