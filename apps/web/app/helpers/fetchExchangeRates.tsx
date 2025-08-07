import { cdnFetch } from '@/app/helpers/cdnFetch';
import { cache } from 'react';

export const fetchExchangeRates = cache(
  async ({ subBase, fromCdn = true }: { subBase?: string; fromCdn?: boolean } = {}): Promise<{
    rates: any;
  }> => {
    const { isNull } = await import('@/app/helpers/isNull');
    let data = {};

    if (fromCdn) {
      const ratesFromCDN = await cdnFetch({ key: 'rates' });
      if (!isNull(ratesFromCDN)) {
        return { rates: ratesFromCDN };
      }
    }

    try {
      const { baseUrl } = await import('@/app/helpers/baseUrl');
      const { api_get_exchange_rates } = await import('@/app/routes/api_routes');
      const url = await api_get_exchange_rates({ subBase: 'none' });

      const finalUrl = await baseUrl(url);
      const brandRes = await fetch(finalUrl, {
        method: 'GET',
        headers: await (
          await import('@/app/helpers/modHeaders')
        ).modHeaders('get', false, {} as any, false),
        credentials: 'include',
        cache: 'force-cache',
        next: {
          revalidate: process.env.NODE_ENV === 'production' ? 3600 : 1,
          tags: ['rates'],
        },
      });
      if (!brandRes.ok) {
        console.error(brandRes.statusText);
        return { rates: {} };
      }
      const brandResult = await brandRes.json();
      if (brandResult.status && brandResult.data) {
        data = brandResult.data;
      }
      return { rates: data || {} };
    } catch (error) {
      console.error('getting essentials error:', error);
      return { rates: {} };
    }
  },
);
