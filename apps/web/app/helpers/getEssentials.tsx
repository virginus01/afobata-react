import { cache } from 'react';
export const getEssentials = cache(
  async ({ subBase, fromCdn = true }: { subBase?: string; fromCdn?: boolean } = {}): Promise<{
    brand: BrandType;
  }> => {
    const { isNull } = await import('@/app/helpers/isNull');
    let data = {};
    try {
      const { getGlobalCacheLink } = await import('@/app/helpers/getGlobalCacheLink');
      const gcsLink = await getGlobalCacheLink({ slug: 'brand' });

      if (gcsLink && fromCdn) {
        const resGC = await fetch(gcsLink);
        if (resGC.ok) {
          const result = await resGC.text();
          if (!isNull(result)) {
            const jsonData = JSON.parse(result);
            data = jsonData ?? {};
          }
          console.info('✅ Brand CDN Hit');
          return { brand: data || {} };
        } else {
          console.warn('⚠️ Brand CDN fetch failed:', resGC.statusText);
        }
      }
    } catch (error) {
      //console.error('Global Caching error: ', error);
    }

    try {
      const { api_get_brand } = await import('@/app/routes/api_routes');
      const { baseUrl } = await import('@/app/helpers/baseUrl');
      let url = await api_get_brand({ subBase: 'none' });
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
          tags: ['brand'],
        },
      });
      if (!brandRes.ok) {
        console.error(brandRes.statusText);
        return { brand: {} };
      }
      const brandResult = await brandRes.json();
      if (brandResult.status && brandResult.data) {
        data = brandResult.data;
      }
      return { brand: data || {} };
    } catch (error) {
      console.error('getting essentials error:', error);
      return { brand: {} };
    }
  },
);
