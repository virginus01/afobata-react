'use server';
import { headers } from 'next/headers';
export async function getGlobalCacheLink({ slug }: { slug: string }): Promise<string> {
  try {
    const { isNull } = await import('@/app/helpers/isNull');
    const globalCacheSys = process.env.GLOBAL_CACHE_SYSTEM;
    if (isNull(globalCacheSys) || !slug) return '';
    const { parseUrl } = await import('@/middleware/requestDomain');
    const headersList = await headers();
    const domain = parseUrl(headersList);
    const slugify = (await import('slugify')).default;
    const sDomain = slugify(domain.hostname, { lower: true, strict: true });
    const key = `${domain.subdomain ? `${domain.subdomain}/` : `${sDomain}/`}${slug}.json`;
    switch (globalCacheSys) {
      case 'vercel_blob':
        return `https://${process.env.NEXT_PUBLIC_VERCEL_BLOB_KEY ?? ''}.public.blob.vercel-storage.com/${key}`;
      default:
        return '';
    }
  } catch {
    return '';
  }
}
