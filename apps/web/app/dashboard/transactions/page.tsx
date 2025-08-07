'use client';
import React, { useEffect, useState } from 'react';
import { api_get_payments, crud_page } from '@/app/src/constants';
import { RaisedButton } from '@/app/widgets/widgets';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { readableDate } from '@/app/helpers/readableDate';
import { useRouter } from 'next/navigation';
import { FaList } from 'react-icons/fa';
import TrnxOverview from '@/dashboard/transactions/trnx_overview';
import { modHeaders } from '@/app/helpers/modHeaders';
import { SectionHeader } from '@/app/src/section_header';

export default function Orders({
  params,
  user,
  siteInfo,
}: {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
}) {
  // const searchParams = useSearchParams();
  // const id = searchParams.get('id') || '';
  const router = useRouter();
  const [order, setOrder] = useState<ProductTypes | null>(null);
  const [loading, setLoading] = useState(true);

  const [initialRows, setInitialRows] = useState<string[][]>([]);
  const [isSidebarOpen] = useState(false);
  const [action] = useState(params.action);
  const [orderStatus, setOrderStatus] = useState('');
  const [type, setType] = useState('');
  const [actionTitle, setActionTitle] = useState('Dashboard');

  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    const status: any = '';
    setOrderStatus(status);
    const type = '';
    setType(type);

    if (status === 'debit') {
      setActionTitle('Wallet Debits Transaction');
    } else if (status === 'credit') {
      setActionTitle('Wallet Credit Transactions');
    } else if (status === 'payouts') {
      setActionTitle('Payouts');
    } else {
      setActionTitle('All Transactions');
    }
  }, [action]);

  useEffect(() => {
    const getTrnx = async () => {
      try {
        const url = await api_get_payments({
          userId: user.id!,
          orderStatus,
          limit: 10000,
          page: 1,
          type,
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
          credentials: 'include',
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

            amount = formatCurrency(item.amount! || 0, 'NGN', 0, 'en-NG');

            return [
              item.name || item.id,
              amount,
              `${item.type} (${item.trnxType})`,
              item.status,
              readableDate(item.createdAt),
              item,
            ];
          });

          setColumns((prev) => [...prev, 'name']);
          setColumns((prev) => [...prev, 'amount']);
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
    };

    if (action === 'overview' && user) {
      getTrnx();
    }
  }, [user, action, isSidebarOpen, orderStatus, user.id, type]);

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
          `${crud_page({
            action: 'overview',
            base: 'products',
            type: orderStatus,
            subBase: siteInfo.slug!,
          })}`,
        )
      }
    >
      {actionTitle}s
    </RaisedButton>
  );

  return (
    <div className="p-0 m-1 min-h-[120vh]">
      <SectionHeader title={actionTitle} style={3}>
        <TrnxOverview
          product_type={orderStatus}
          actionTitle={actionTitle}
          initialRows={initialRows}
          columns={columns}
        />
      </SectionHeader>
    </div>
  );
}
