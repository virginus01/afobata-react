'use client';

import { useEffect, useState } from 'react';
import { isNull } from '@/helpers/isNull';
import PageRenderer from '@/app/renderer/page_renderer';
import { pageView } from '@/app/views/views_helper';
import LoadingScreen from '@/src/loading_screen';
import { removeUnserializable } from '@/helpers/removeUnserializable';
import indexedDB from '@/app/utils/indexdb';

type ViewProps = {
  params: string[];
  paramSource?: any;
  plateForm?: 'web' | 'mobile';
  table: string;
  renderPage?: any;
  conditions?: any;
  siteInfo?: any;
  auth?: AuthModel;
  rates: any;
  onCallback: (data: any) => void;
};

const ClientView = ({
  params = [],
  paramSource,
  plateForm = 'web',
  table,
  renderPage,
  conditions,
  siteInfo,
  auth,
  rates,
  onCallback,
}: ViewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rendererData, setRendererData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [pageEssentials, setPageEssentials] = useState<any>(null);

  useEffect(() => {
    if (params.includes('favicon.ico')) return;

    const loadCache = async () => {
      try {
        const res = await indexedDB.queryData({ table: `_view_${params[0]}`, conditions: {} });

        if (isNull(res)) return;

        const rR = res[0];
        const { brand, seg1, data, rendererData, pageEssentials, auth } = rR;

        if (res) {
          const rRes = removeUnserializable(res);
          indexedDB.saveOrUpdateData({ table: `view_${params[0]}`, data: rRes });
        }

        if (!isNull(data)) {
          if (isNull(rendererData)) {
            throw new Error('rendererData not found');
          }

          setBrand(brand);
          setData(data);
          setRendererData(rendererData);
          setPageEssentials(pageEssentials);
        } else {
          console.info('No matching route found for params:', params);
        }
      } catch (err: any) {
        console.error('Error in ClientView component:', err.message || err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadCache();
  }, [params[0]]);

  useEffect(() => {
    if (params.includes('favicon.ico')) return;

    const loadData = async () => {
      try {
        const res = await pageView({
          params,
          table,
          slug: params[0],
          renderPage,
          conditions,
          siteInfo: siteInfo,
        });

        const { brand, seg1, data, rendererData, pageEssentials, auth } = res;

        if (res) {
          const rRes = removeUnserializable(res);
          indexedDB.saveOrUpdateData({ table: `view_${params[0]}`, data: rRes });
        }

        if (!isNull(data)) {
          if (isNull(rendererData)) {
            throw new Error('rendererData not found');
          }

          setBrand(brand);
          setData(data);
          setRendererData(rendererData);
          setPageEssentials(pageEssentials);
        } else {
          console.info('No matching route found for params:', params);
        }
      } catch (err: any) {
        console.error('Error in ClientView component:', err.message || err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params[0]]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <PageRenderer
      plateForm={plateForm}
      siteInfo={brand}
      user={{}}
      auth={auth ?? {}}
      rates={rates}
      rendererData={rendererData}
      data={data}
      onCallback={onCallback}
      navigation={[]}
      pageEssentials={pageEssentials}
    />
  );
};

ClientView.displayName = 'ClientView';

export default ClientView;
