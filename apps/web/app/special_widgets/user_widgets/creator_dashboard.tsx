import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, ArrowUpRight, CreditCard, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { curFormat } from '@/app/helpers/curFormat';
import IconButton from '@/app/widgets/icon_button';
import { CustomBadge } from '@/app/widgets/badge';
import indexedDB from '@/app/utils/indexdb';

const ShimmerBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export default function CreatorDashboard({
  user,
  siteInfo,
  iniStat,
}: {
  user: UserTypes;
  siteInfo: BrandType;
  iniStat: StatDataType;
}) {
  const [stat, setStat] = useState<StatDataType>(iniStat || []);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const getStats = async () => {
      try {
        const [cachedStat] = await indexedDB.queryData({
          table: 'stats',
          conditions: {},
          tag: `${user.id}-${siteInfo.slug}`,
        });

        if (cachedStat) {
          setStat(cachedStat);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching stats from IndexedDB:', error);
      } finally {
        setLoading(false);
        //   getLiveStats();
      }
    };

    getStats();
  }, []);

  // const getLiveStats = useCallback(async () => {
  //   if (isFetchingRef.current) return;

  //   try {
  //     const url = await api_user_stats({
  //       subBase: siteInfo.slug!,
  //       userId: user.id!,
  //       brandId: user.brand?.id!,
  //       duration: 3,
  //     });
  //     isFetchingRef.current = true;

  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: await modHeaders('get'),
  //       credentials: 'include',
  //     });

  //     const { status, data, msg } = await response.json();

  //     if (status && !isNull(data)) {
  //       setStat(data);
  //       indexedDB.saveOrUpdateData({
  //         table: 'stats',
  //         data,
  //         tag: `${user.id}-${siteInfo.slug}`,
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching stats:', error);
  //   } finally {
  //     isFetchingRef.current = false;
  //   }
  // }, []);

  let sales: any[] = [];
  let transactions: any[] = [];

  if (stat && stat.sales && stat?.sales?.data) {
    sales = stat?.sales?.data;
  }
  if (stat && stat.transactions && stat?.transactions?.data) {
    transactions = stat?.transactions?.data;
  }

  return (
    <div className="flex flex-col flex-grow-0">
      <div className="flex flex-1 flex-col gap-4 md:gap-4 md:p-1">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="brand-bg-card brand-text-card border border-none brand-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <ShimmerBlock className="h-8 w-24 mb-1" />
                  <ShimmerBlock className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-sm font-bold">
                    {curFormat(stat?.totalRevenue?.all || 0, user.currencyInfo?.currencySymbol)}
                  </div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="brand-bg-card brand-text-card border border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <ShimmerBlock className="h-8 w-24 mb-1" />
                  <ShimmerBlock className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-sm font-bold">+{stat?.subscriptions?.all || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stat?.subscriptions?.lastMonth || 0} from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="brand-bg-card brand-text-card border border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <ShimmerBlock className="h-8 w-24 mb-1" />
                  <ShimmerBlock className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-sm font-bold">+{stat?.sales?.all || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stat?.sales?.lastMonth || 0} from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="brand-bg-card brand-text-card border border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <ShimmerBlock className="h-8 w-24 mb-1" />
                  <ShimmerBlock className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-sm font-bold">+{stat?.users?.active || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stat?.users?.active || 0} since last hour
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="brand-bg-card brand-text-card xl:col-span-2 border border-none">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle className="text-xs">Transactions</CardTitle>
                <CardDescription className="text-xs">
                  Recent transactions from your platform.
                </CardDescription>
              </div>
              <IconButton
                className="ml-auto gap-1 text-xs"
                size="xs"
                iconPosition="after"
                icon={<ArrowUpRight className="h-3 w-3" />}
              >
                View All
              </IconButton>
            </CardHeader>

            <CardContent className="inset-0 px-2">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div className="flex items-center justify-between py-4" key={i}>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse hidden md:block"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((trnx: OrderType, i) => (
                  <div className="flex items-center justify-between py-2" key={i}>
                    <div>
                      <div className="text-xs">{trnx.name}</div>
                      <p className="hidden text-xs text-muted-foreground md:inline">{trnx.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CustomBadge color="success" size="xs" text={trnx.status?.toLowerCase()} />
                      <div className="ml-4 text-xs">
                        {curFormat(trnx.amount || 0, trnx.orderCurrencySymbol)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center text-xs">No transactions yet</div>
              )}
            </CardContent>
          </Card>

          <Card className="brand-bg-card brand-text-card border border-none">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle className="text-xs">Recent Sales</CardTitle>
                <CardDescription className="text-xs">
                  Recent sales from your platform.
                </CardDescription>
              </div>
              <IconButton
                className="ml-auto gap-1 text-xs"
                size="xs"
                iconPosition="after"
                icon={<ArrowUpRight className="h-3 w-3" />}
              >
                View All
              </IconButton>
            </CardHeader>
            <CardContent className="inset-0 px-2">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div className="flex items-center justify-between py-4" key={i}>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse hidden md:block"></div>
                    </div>
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))
              ) : sales.length > 0 ? (
                sales.map((sale: OrderType, i) => (
                  <div className="flex items-center justify-between py-2" key={i}>
                    <div className="text-xs">{sale.name}</div>
                    <div className="flex items-center gap-2">
                      <CustomBadge color="success" size="xs" text={sale.status?.toLowerCase()} />
                      <div className="ml-4 text-xs">
                        {curFormat(sale.amount || 0, sale.orderCurrencySymbol)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center text-xs">No sales yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
