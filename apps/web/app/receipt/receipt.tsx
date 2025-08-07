'use client';

import { useEffect, useState } from 'react';
import { api_get_orders_by_ref } from '@/app/src/constants';
import { fetcher } from '@/app/helpers/fetcher';
import { isNull } from '@/app/helpers/isNull';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReceiptBody from '@/app/receipt/receipt_body';
import OrderTokens from '@/app/receipt/tokens';
import DigitalOrderLinks from '@/app/receipt/digital_access';
import { Order } from '@/app/models/Order';
import { Brand } from '@/app/models/Brand';
import CustomCard from '@/app/widgets/custom_card';
import OrderSideDetails from '@/app/dashboard/crud/crud_actions/order';
import OrderSideActions from '@/app/dashboard/crud/crud_actions/actions/order_actions';

const Invoice = ({
  siteInfo,
  referenceId,
  iniInvoice,
  iniOrders,
  defaultView,
  user,
}: {
  siteInfo: Brand;
  referenceId: string;
  iniInvoice?: CheckOutDataType | null;
  iniOrders?: Order[];
  defaultView: 'receipt' | 'products';
  user?: UserTypes;
}) => {
  const ref = referenceId;

  const [invoice, setInvoice] = useState<CheckOutDataType | null>(iniInvoice ?? null);
  const [orders, setOrders] = useState<Order[]>(iniOrders ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoice && ref && siteInfo?.slug) {
        try {
          setIsLoading(true);
          const url = await api_get_orders_by_ref({ ref, subBase: siteInfo?.slug });
          const res = await fetcher(url);
          if (res) {
            setInvoice(res);
            setOrders(res.orders ?? []);
          }
        } catch (err) {
          console.error('Failed to fetch invoice:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInvoice();
  }, [ref, siteInfo?.slug, invoice]);

  const tokenOrders = orders.filter((order) => order.type === 'electric' || !isNull(order.tokens));
  const digitalOrders = orders.filter((order) => order.type === 'digital');

  return (
    <div className="w-full h-full text-sx">
      {isLoading && (
        <div className="fixed top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Updating...
        </div>
      )}

      <Tabs defaultValue={defaultView} className="w-full">
        {invoice && orders.length > 0 && (tokenOrders.length > 0 || digitalOrders.length > 0) && (
          <TabsList className="flex flex-row justify-between w-full items-center">
            <TabsTrigger value="receipt" className="w-full">
              Receipt
            </TabsTrigger>
            <TabsTrigger value="products" className="w-full">
              Products
            </TabsTrigger>
          </TabsList>
        )}

        {invoice && (
          <TabsContent value="receipt">
            <ReceiptBody siteInfo={siteInfo} referenceId={referenceId} invoice={invoice} />
          </TabsContent>
        )}

        <TabsContent value="products">
          <OrderTokens tokenOrders={tokenOrders} siteInfo={siteInfo} />
          <DigitalOrderLinks orders={digitalOrders} />

          {!isNull(user) && (
            <>
              {orders.map((order, i) => {
                return (
                  <div
                    className="flex flex-col sm:flex-row space-y-4 space-x-0 sm:space-y-0 sm:space-x-2 w-full"
                    key={i}
                  >
                    <div className="w-full sm:w-3/4">
                      <CustomCard title="Details" childrenClass="inset-0 p-0 m-0">
                        <OrderSideDetails order={order as any} user={user ?? {}} />
                      </CustomCard>
                    </div>
                    <div className="w-full sm:w-1/4">
                      <OrderSideActions
                        item={order as any}
                        setItem={(item) => {}}
                        base={'order'}
                        siteInfo={siteInfo as any}
                        user={user ?? {}}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoice;
