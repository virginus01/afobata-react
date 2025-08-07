import { isNull } from '@/app/helpers/isNull';

export async function cdnFetch({ key }: { key: string }) {
  try {
    let data = {};
    const { getGlobalCacheLink } = await import('@/app/helpers/getGlobalCacheLink');
    const gcsLink = await getGlobalCacheLink({ slug: key });
    if (gcsLink) {
      const resGC = await fetch(gcsLink);
      if (resGC.ok) {
        const result = await resGC.text();
        if (!isNull(result)) {
          const jsonData = JSON.parse(result);
          data = jsonData ?? {};
        }
        console.info(`✅ ${key}  CDN Hit`);
        return data;
      } else {
        console.warn(`⚠️ ${key} CDN fetch failed:`, resGC.statusText);
      }
    }
  } catch (error) {
    //console.error('Global Caching error: ', error);
  }
}
