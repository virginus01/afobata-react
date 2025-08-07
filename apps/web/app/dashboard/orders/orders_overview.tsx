'use client';

import React, { useEffect, useState, useCallback, useRef, useLayoutEffect, useMemo } from 'react';
import { SectionHeader } from '@/app/src/section_header';
import { RaisedButton } from '@/app/widgets/widgets';
import { FaPlus, FaSearch } from 'react-icons/fa';
import FormInput from '@/app/widgets/hook_form_input';
import CustomDrawer from '@/app/src/custom_drawer';
import { SmartFilter } from '@/app/widgets/smart_filter';
import IconButton from '@/app/widgets/icon_button';
import { ChevronLeft, ChevronRight, Filter, SortDesc } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useCart } from '@/app/contexts/cart_context';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { flattenCondition } from '@/app/helpers/flattenCondition';
import { isNull } from '@/app/helpers/isNull';
import { Data } from '@/app/models/Data';
import ListView from '@/app/widgets/listView';
import SideBarActions from '@/dashboard/sidebar_content';
import FilterSortSearchBar from '@/app/widgets/searchFilterAndSort';

interface OverViewIndexProps {
  params: { action: string; base: string };
  user: UserTypes;
  siteInfo: BrandType;
  columns?: string[];
  type: string;
  status: any;
  table: string;
  initalData: any[];
  baseData: BaseDataType;
}

export default function OrdersOverView({
  params,
  user,
  siteInfo,
  columns = [],
  type,
  status = '',
  table,
  baseData = {} as BaseDataType,
  initalData = [],
}: OverViewIndexProps) {
  const { currencies } = useCart();
  const [searchPhrase, setSearchPhrase] = useState('');
  const actionTitle = `${(status || type) ?? ''} ${params.base}`;
  const [sideBarClose, setSideBarClose] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [conditions, setConditions] = useState<any>(() => {
    const initial: any =
      user.selectedProfile === 'hoster'
        ? { userId: user.id, parentBrandId: user?.brand?.id }
        : { userId: user.id, parentBrandId: siteInfo.id };
    if (!isNull(status)) initial.status = status;
    return initial;
  });
  const [activeData, setActiveData] = useState<any>();
  const [filter, setFilter] = useState<any>(() => {
    const initial: any = {};
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<OrderType[]>(
    Array.isArray(initalData) ? [] : [],
  );

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
  }, [params.action, params.base, user.id, siteInfo.slug, refreshKey, type, filter, status]);

  useEffect(() => {
    if (sideBarClose) {
      setSideBarClose(false);
    }
  }, [sideBarClose]);

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

  const RightButton: React.FC = () => <></>;

  let showRightButtons = ['orders'].includes(params.base);

  let finalData: any[] = [];

  filteredData.map((fData: OrderType) => {
    let commissionsValue: any[] = [];

    if (fData.masterCommission && fData.masterBrandDetails?.ownerId === user.id) {
      commissionsValue.push(parseFloat(fData.masterCommission as any));
    }

    if (fData.orderBrandCommission && fData.orderBrandDetails?.ownerId === user.id) {
      commissionsValue.push(parseFloat(fData.orderBrandCommission as any));
    }

    if (fData.orderParentBrandCommission && fData.orderParentBrandDetails?.ownerId === user.id) {
      commissionsValue.push(parseFloat(fData.orderParentBrandCommission as any));
    }

    if (fData.onwerRevenue && fData.productBrandDetails?.ownerId === user.id) {
      commissionsValue.push(parseFloat(fData.onwerRevenue as any));
    }

    const commissions = commissionsValue.reduce((sum, price) => sum + price, 0);

    finalData.push({
      ...fData,
      action: 'view',
      base: 'orders',
      revenue: commissions,
    });
  });

  let purCur = currencies.filter((cur) => cur.availableForPurchase === true && cur.currencyCode);

  return (
    <>
      <SectionHeader
        title={'Orders'}
        style={3}
        rightWidget={showRightButtons ? <RightButton /> : <></>}
      >
        <div className="flex flex-row space-x-4 justify-between m-2 items-center ">
          <div className="flex space-x-4">
            <IconButton size="xs" onClick={() => setIsFilterOpen(true)}>
              <Filter className="h-3 w-3" />
            </IconButton>
            <IconButton size="xs" onClick={() => setIsSortOpen(true)}>
              <SortDesc className="h-3 w-3" />
            </IconButton>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <FormInput
              controlled={false}
              type="text"
              defaultValue={searchPhrase}
              id="advanced-search-input"
              placeholder="type search keyword"
              className="w-full h-8 py-0"
              onBlur={(e) => {
                setSearchPhrase(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchPhrase((e.target as HTMLInputElement).value);
                  handleSearch((e.target as HTMLInputElement).value);
                }
              }}
              name="search"
              animate={false}
            />
            <RaisedButton
              id="advanced-search-button"
              size="sm"
              color="auto"
              iconPosition="after"
              onClick={() => {
                handleSearch(searchPhrase);
              }}
            >
              <div className="p-1">
                <FaSearch />
              </div>
            </RaisedButton>
          </div>
        </div>
        {user.selectedProfile === 'creator' && (
          <ScrollableSalesCards finalData={finalData} purCur={purCur} user={user} />
        )}

        <FilterSortSearchBar
          originalData={filteredData}
          setData={setFilteredData}
          searchableKeys={['title', 'description']}
          sortableKeys={['price', 'views', 'sales']}
          placeholder="Search title or description"
          onSearch={handleSearch}
        />

        <ListView
          data={finalData}
          setActiveData={(data) => {
            setActiveData(data);
          }}
        />
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
          <SmartFilter data={[]} onFilteredDataChange={(data) => {}} />
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

const ScrollableSalesCards = ({
  finalData,
  purCur,
  user,
}: {
  finalData: any[];
  purCur: any[];
  user?: UserTypes;
}) => {
  const scrollContainerRef: any = useRef(null);

  const scroll = (direction: any) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250; // Adjust based on your card width
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const curFormat = (amount: any, symbol: any) => `${symbol}${amount.toLocaleString()}`;

  let revenue = 0;
  let commissionValues: any[] = [];

  finalData.map((ff) => {
    commissionValues.push(parseFloat(ff.revenue || 0));
  });

  revenue = commissionValues.reduce((sum, price) => sum + price, 0);

  return (
    <div className="relative w-full flex items-center">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 z-10  rounded-full p-1 bg-gray-50 hover:bg-gray-200"
      >
        <ChevronLeft size={24} />
      </button>

      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto scrollbar-hide flex space-x-4 py-2 px-10"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex space-x-4">
          <Card className="brand-bg-card brand-text-card flex-shrink-0 w-64 hover:shadow-lg transition-shadow duration-300 border border-none">
            <CardContent className="p-4">
              <CardTitle className="text-xs font-semibold text-gray-700 mb-2">
                No. of Orders
              </CardTitle>
              <CardDescription className="text-xs font-bold text-blue-600">
                {finalData.length}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="brand-bg-card brand-text-card flex-shrink-0 w-64 hover:shadow-lg transition-shadow duration-300 border border-none">
            <CardContent className="p-4">
              <CardTitle className="text-xs font-semibold text-gray-700 mb-2">
                Total Revenue
              </CardTitle>
              <CardDescription className="text-xs font-bold text-blue-600">
                {curFormat(revenue, user?.currencyInfo?.currencySymbol)}
              </CardDescription>
            </CardContent>
          </Card>

          {purCur
            .map((pc, index) => {
              // Filter and sum volumes for specific currency
              const volumePrices = finalData
                .filter((d) => d.orderCurrency === pc.currencyCode)
                .map((d) => d.amount);

              const totalVolume = volumePrices.reduce((sum, price) => sum + price, 0);

              return (
                <Card
                  key={index}
                  className="flex-shrink-0 w-64 hover:shadow-lg transition-shadow duration-300 border border-none"
                >
                  <CardContent className="p-4">
                    <CardTitle className="text-xs font-semibold text-gray-700 mb-2">
                      Sales Volume ({pc.currencyCode})
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-purple-600">
                      {curFormat(totalVolume, pc.currencySymbol)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })
            .sort((a, b) => {
              // Extract total volume from CardDescription for sorting
              const extractVolume = (card: any) => {
                const volumeText = card.props.children.props.children[1].props.children;
                return parseFloat(volumeText.replace(/[^\d.]/g, ''));
              };
              return extractVolume(b) - extractVolume(a);
            })}
        </div>
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 z-10  rounded-full p-1 bg-gray-50 hover:bg-gray-200"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export { ScrollableSalesCards };
