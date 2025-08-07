import React, { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import CustomCard from '@/app/widgets/custom_card';
import { copyToClipboard } from '@/app/helpers/text';
import { isNull } from '@/app/helpers/isNull';
import { baseUrl } from '@/app/helpers/baseUrl';
import { fetcher } from '@/app/helpers/fetcher';
import { Order } from '@/app/models/Order';
import { Brand } from '@/app/models/Brand';
import { api_dynamic_get_data } from '@/app/routes/api_routes';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderTokens({
  tokenOrders,
  siteInfo,
}: {
  tokenOrders: Order[];
  siteInfo: Brand;
}) {
  const [orders, setOrders] = useState<Order[]>(tokenOrders);

  const needsToken = useMemo(
    () => orders.filter((o) => isNull(o.tokens) && o.type === 'electric'),
    [orders],
  );

  const { data: tokenData } = useSWR(
    needsToken.length > 0 ? 'fetch-electric-orders' : null,
    async () => {
      const ids = needsToken.map((o) => ({ id: o.id }));
      const url = await api_dynamic_get_data({
        subBase: siteInfo.slug ?? '',
        table: 'orders',
        conditions: { $or: ids },
        limit: 100,
        page: 1,
        perPage: 100,
        sort: {},
        tables: [],
        renderPage: '',
        tag: '',
        essentials: [],
      });

      const finalUrl = await baseUrl(url);
      const result = await fetcher(finalUrl);
      return Array.isArray(result) ? result : [];
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  useEffect(() => {
    if (tokenData && Array.isArray(tokenData)) {
      const updated = orders.map((order) => {
        const found = tokenData.find((n) => n.id === order.id);
        return found ? { ...order, ...found } : order;
      });
      setOrders(updated);
    }
  }, [tokenData]);

  return (
    <div>
      {orders.length > 0 &&
        orders.map((order, index) => (
          <div key={index} className="p-2">
            <CustomCard title={`Token: ${order.title ?? ''}`}>
              <div className="space-y-1">
                {Array.isArray(order.tokens) && order.tokens.length > 0 ? (
                  order.tokens.map((t, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="font-bold">{t.token}</span>
                      <button
                        onClick={() => {
                          copyToClipboard(t?.token ?? '');
                          toast.success(`${t?.token ?? ''} copied`);
                        }}
                        className="text-xs"
                      >
                        <Copy className="w-3 -h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span>Loading...</span>
                )}
              </div>
            </CustomCard>
          </div>
        ))}
    </div>
  );
}
