'use client';

import React, { useEffect, useState, use } from 'react';

import { product_overview_page, api_get_orders } from '@/app/src/constants';
import { RaisedButton } from '@/app/widgets/widgets';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { readableDate } from '@/app/helpers/readableDate';
import LoadingScreen from '@/app/src/loading_screen';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaList } from 'react-icons/fa';
import { useUserContext } from '@/app/contexts/user_context';
import { OrdersOverview } from '@/dashboard/orders-options/[order_actions]/orders_overview';
import { modHeaders } from '@/app/helpers/modHeaders';
import LoadingBar from '@/app/widgets/loading';
import { useBaseContext } from '@/app/contexts/base_context';

export default function Orders(props: { params: Promise<{ order_actions: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [order, setOrder] = useState<ProductTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userId } = useUserContext();
  const [initialRows, setInitialRows] = useState<string[][]>([]);
  const [isSidebarOpen] = useState(false);
  const [action] = useState(params.order_actions);
  const [orderStatus, setOrderStatus] = useState(searchParams.get('status') || '');
  const [actionTitle, setActionTitle] = useState('Dashboard');
  const { isUserLoaded, essentialData } = useUserContext();
  const { isPending } = useBaseContext();

  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    const status = searchParams.get('status') as string;
    setOrderStatus(status);

    if (status === 'paid') {
      setActionTitle('Paid Orders');
    } else if (status === 'aboundoned') {
      setActionTitle('Aboundoned Transactions');
    } else if (status === 'processed') {
      setActionTitle('Processed Transactions');
    } else if (status === 'completed') {
      setActionTitle('Completed Transactions');
    } else {
      setActionTitle('Pending Orders');
    }
  }, [searchParams, action]);

  useEffect(() => {
    async function getOrders() {
      try {
        const url = await api_get_orders({
          userId,
          orderStatus,
          limit: 10000,
          page: 1,
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const res = await response.json();

        if (res.status) {
          setInitialRows([]);
          setColumns([]);
          const newRows = res.data.map((item: any) => {
            let amount = '0';
            if (item.price == 0) {
              amount = 'FREE';
            } else {
              amount = formatCurrency(item.price! || 0, 'NGN', 0, 'en-NG');
            }
            return [
              item.title,
              item.name,
              amount,
              formatCurrency(item.commission! || 0, 'NGN', 0, 'en-NG'),
              formatCurrency(item.subsidy! || 0, 'NGN', 0, 'en-NG'),
              item.type,
              item.status,
              readableDate(item.createdAt),
              item,
            ];
          });

          setColumns((prev) => [...prev, 'title']);
          setColumns((prev) => [...prev, 'name']);
          setColumns((prev) => [...prev, 'amount']);
          setColumns((prev) => [...prev, 'profit']);
          setColumns((prev) => [...prev, 'subsidy']);
          setColumns((prev) => [...prev, 'type']);
          setColumns((prev) => [...prev, 'status']);
          setColumns((prev) => [...prev, 'date']);
          setColumns((prev) => [...prev, 'action']);

          setInitialRows(newRows);
        } else {
          setInitialRows([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }

    if (action === 'overview' && user && isUserLoaded) {
      getOrders();
    }
  }, [user, action, isSidebarOpen, orderStatus, isUserLoaded, userId, searchParams]);

  useEffect(() => {
    if ((action === 'view' && (!user || !order)) || (action === 'overview' && !user)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [user, order, action, initialRows]);

  const RightButton: React.FC = () => (
    <RaisedButton
      size="auto"
      color="auto"
      icon={<FaList />}
      iconPosition="before"
      onClick={() =>
        router.push(
          `${product_overview_page({
            productType: orderStatus,
            subBase: essentialData?.siteInfo?.slug!,
          })}`,
        )
      }
    >
      {actionTitle}s
    </RaisedButton>
  );
  if (isPending) {
    return <LoadingBar />;
  } else if (loading) {
    return <LoadingScreen />;
  } else if (action === 'overview') {
    return (
      <OrdersOverview
        product_type={orderStatus}
        actionTitle={actionTitle}
        initialRows={initialRows}
        columns={columns}
      />
    );
  }
}
