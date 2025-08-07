import { fetchExchangeRates } from '@/helpers/fetchExchangeRates';
import { getEssentials } from '@/helpers/getEssentials';
import { isNull } from '@/helpers/isNull';
import PageRenderer from '@/app/renderer/page_renderer';
import { pageView } from '@/app/views/views_helper';
import { notFound } from 'next/navigation';

const View = async ({
  params,
  paramSource,
  plateForm = 'web',
  table,
  renderPage,
  conditions,
  siteInfo,
}: ViewProps) => {
  try {
    if (params.includes('favicon.ico')) {
      return;
    }
    const essential = await getEssentials();

    const { brand, seg1, data, rendererData, pageEssentials, auth } = await pageView({
      params,
      table,
      slug: params[0],
      renderPage,
      conditions,
      siteInfo: (siteInfo as any) || essential.brand,
    });

    if (!isNull(data)) {
      if (isNull(rendererData)) {
        throw Error('rendererData not found');
      }

      let rates = {};

      if (['products', 'pages'].includes(data.table)) {
        const ratesData = await fetchExchangeRates({});
        rates = ratesData?.rates ?? {};
      }

      return (
        <PageRenderer
          plateForm={plateForm}
          siteInfo={brand}
          user={{}}
          auth={auth || {}}
          rates={rates}
          rendererData={rendererData}
          data={data}
          navigation={[]}
          pageEssentials={pageEssentials}
        />
      );
    } else {
      console.info('No matching route found for params:', params);
      notFound();
    }
  } catch (error) {
    console.error('Error in View component:', error instanceof Error ? error.message : error);
    notFound();
  }
};

View.displayName = 'View';

export default View;
