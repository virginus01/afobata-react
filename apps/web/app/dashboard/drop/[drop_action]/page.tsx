'use client';
import { useEffect, useState, use } from 'react';
import { useBaseContext } from '@/app/contexts/base_context';
import { useUserContext } from '@/app/contexts/user_context';
import { useRouter, useSearchParams } from 'next/navigation';
import { api_get_products } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';
import { Overview } from '@/dashboard/drop/inhouse_servicing';

export default function Drop(props: { params: Promise<{ drop_action: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const type = searchParams.get('type') || '';

  const router = useRouter();
  const { user, setUser } = useUserContext();
  const [initialRows, setInitialRows] = useState<string[][]>([]);
  const [action, setAction] = useState(params.drop_action);
  const { userId, setUserId } = useUserContext();
  const [productType, setProductType] = useState(searchParams.get('type') || '');
  const [rows, setRows] = useState<string[][]>(initialRows);
  const [columns, setColumns] = useState<string[]>([]);
  const { essentialData } = useUserContext();
  const { siteInfo } = essentialData;

  useEffect(() => {
    async function getProducts() {
      try {
        let drop_type = 'digital';
        if (type === 'inhouse_shipping') {
          drop_type = 'pysical';
        }

        let conditions: any = {
          $and: [
            {
              $or: [{ parentId: null }, { parentId: { $exists: false } }],
            },
            {
              userId: { $ne: user?.id },
            },
            {
              type: drop_type,
            },
          ],
        };

        const url = await api_get_products({
          productType: drop_type,
          subBase: siteInfo.slug,
          ignore_brand_add: 'yes',
          conditions,
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
          const newRows = res.data.map((item: ProductTypes) => [
            item.title,
            item.status,
            item.cashViews,
            item,
          ]);

          setColumns((prev) => [...prev, 'title']);
          setColumns((prev) => [...prev, 'status']);
          setColumns((prev) => [...prev, 'views']);
          setColumns((prev) => [...prev, 'action']);

          setInitialRows(newRows);
        } else {
          setInitialRows([]);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    }

    getProducts();
  }, [user, action, userId, siteInfo.slug, type]);

  return (
    <>
      <Overview initialRows={initialRows} columns={columns} />
    </>
  );
}
