import { useDynamicContext } from "@/app/contexts/dynamic_context";
import { curFormat } from "@/app/helpers/curFormat";
import { isNull } from "@/app/helpers/isNull";
import { readableDate } from "@/app/helpers/readableDate";
import { uppercase } from "@/app/helpers/uppercase";
import { Brand } from "@/app/models/Brand";
import Invoice from "@/app/receipt/receipt";
import CustomDrawer from "@/app/src/custom_drawer";
import IconButton from "@/app/widgets/icon_button";
import ListView from "@/app/widgets/listView";
import FilterSortSearchBar from "@/app/widgets/searchFilterAndSort";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import React, { useCallback, useLayoutEffect, useState } from "react";

export default function InvoiceOverview({
  siteInfo,
  user,
  params,
  limit = 50,
  display = "table",
}: {
  user: UserTypes;
  siteInfo: Brand;
  params: any;
  limit?: number;
  display?: "table" | "chart" | "widget";
}) {
  const [finalData, setFinalData] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState<{
    referenceId: string;
    invoice: CheckOutDataType;
    orders: OrderType;
    siteInfo: BrandType;
  }>({} as any);

  const { fetchData, refreshKey } = useDynamicContext();
  let tag: string = `${user?.selectedProfile ?? ""}_${siteInfo?.id}_invoice`;

  useLayoutEffect(() => {
    const getData = async () => {
      try {
        const result: any = await fetchData({
          table: "payments",
          tag,
          conditions: {
            userId: user.id,
            createdFrom: siteInfo.id,
            trnxType: "purchase",
          },
          limit,
          sortOptions: {},
          brandSlug: siteInfo.slug ?? "",
        });

        if (!isNull(result)) {
          setFinalData(
            result.map((item: PaymentType) => ({
              ...item,
              price: item.amount,
              action: "add",
              title: `Invoice of ${curFormat(
                item.amount,
                item.currencySymbol || item.currency || ""
              )}`,
            }))
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [params.action, params.base, user.id, siteInfo.slug, refreshKey]);

  const handleSearch = useCallback((searchValue: string) => {
    const newConditions = {
      $or: [
        { title: { $regex: searchValue, $options: "i" } },
        { id: { $regex: searchValue, $options: "i" } },
      ],
    };
    // setFilter(newConditions);
    // setSearchPhrase(searchValue);
  }, []);

  return (
    <div>
      {display === "table" && (
        <>
          <FilterSortSearchBar
            originalData={finalData as any}
            setData={setFinalData}
            searchableKeys={["title", "description"]}
            sortableKeys={["price", "views", "sales"]}
            placeholder="Search title or description"
            onSearch={() => {}}
          />
          <ListView
            data={finalData}
            setActiveData={(data) => {
              setReceiptData({
                referenceId: data.referenceId ?? "",
                invoice: data as any,
                orders: [] as any,
                siteInfo: siteInfo as any,
              });
            }}
            display={[]}
          />
        </>
      )}
      {display === "widget" && (
        <Card className="brand-bg-card brand-text-card xl:col-span-2 border border-none">
          <CardHeader className="flex flex-row items-center inset-0 p-0">
            <div className="grid gap-2 p-2">
              <CardTitle className="text-xs">Recent Invoices</CardTitle>
              <CardDescription className="text-xs">
                Recent invoices from our platform.
              </CardDescription>
            </div>
            <IconButton
              className="ml-auto gap-1 text-xs p-2"
              size="xs"
              iconPosition="after"
              icon={<ArrowUpRight className="h-3 w-3" />}
            >
              View All
            </IconButton>
          </CardHeader>

          <CardContent className="inset-0 p-0">
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
            ) : finalData.length > 0 ? (
              finalData.map((trnx: PaymentType, i) => (
                <div
                  onClick={() => {
                    setReceiptData({
                      referenceId: trnx.referenceId ?? "",
                      invoice: trnx as any,
                      orders: [] as any,
                      siteInfo: siteInfo as any,
                    });
                  }}
                  className="flex items-center justify-between py-2 border border-t border-gray-200 hover:cursor-pointer"
                  key={i}
                >
                  <div className="px-2">
                    <div className="text-xs"> {trnx.title}</div>
                    <p className="hidden text-xs text-muted-foreground md:inline">
                      {readableDate(trnx.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="ml-4 text-xs">
                      {curFormat(
                        trnx.amount || 0,
                        uppercase(trnx.currencySymbol || trnx.currency || "")
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center text-xs">No invoice yet</div>
            )}
          </CardContent>
        </Card>
      )}
      {receiptData && !isNull(receiptData?.referenceId) && (
        <CustomDrawer
          isOpen={!isNull(receiptData?.referenceId)}
          onClose={() => {
            setReceiptData({} as any);
          }}
          header={"Receipt"}
          isHeightFull={true}
          isWidthFull={false}
        >
          <Invoice
            siteInfo={siteInfo as any}
            referenceId={receiptData?.referenceId}
            iniInvoice={receiptData.invoice as any}
            defaultView="receipt"
            user={user}
          />
        </CustomDrawer>
      )}
    </div>
  );
}
