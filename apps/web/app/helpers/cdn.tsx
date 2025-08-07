'use server';

import { put, head, del } from '@vercel/blob';
import { headers } from 'next/headers';
import { parseUrl } from '@/middleware/requestDomain';
import slugify from 'slugify';
import { isNull } from '@/app/helpers/isNull';

export async function globalCacheSave({
  data,
  slug,
  cacheDuration = 3600,
}: {
  data: any;
  slug: string;
  cacheDuration?: number;
}) {
  const globalCacheSys = process.env.GLOBAL_CACHE_SYSTEM;

  if (!slug || !globalCacheSys) return;

  const headersList = await headers();
  const domain = parseUrl(headersList);

  const sDomain = slugify(domain.hostname, {
    lower: true,
    strict: true,
  });

  const key = `${domain.subdomain ? `${domain.subdomain}/` : `${sDomain}/`}${slug}.json`;

  if (isNull(globalCacheSys)) return;

  try {
    switch (globalCacheSys) {
      case 'vercel_blob':
        try {
          await put(key, JSON.stringify(data), {
            access: 'public',
            addRandomSuffix: false,
            cacheControlMaxAge: cacheDuration,
            allowOverwrite: false,
            contentType: 'application/json',
          });
          console.info(key, ' ✅ updated in Vercel Blob cache');
        } catch (error) {
          console.info('🛑 Data failed saved to Vercel Blob cache');
        }
        break;
    }
  } catch (error) {
    console.error('Error saving to Vercel Blob:', error);
  }
}

export async function globalCacheDelete({ slugs }: { slugs: string[] }) {
  const globalCacheSys = process.env.GLOBAL_CACHE_SYSTEM;

  if (!slugs || !globalCacheSys) return;

  let urls: string[] = [];

  if (isNull(globalCacheSys)) return;

  try {
    switch (globalCacheSys) {
      case 'vercel_blob':
        try {
          slugs.forEach((slug) => {
            const key = `https://${process.env.NEXT_PUBLIC_VERCEL_BLOB_KEY ?? ''}.public.blob.vercel-storage.com/${slug}.json`;
            urls.push(key);
          });

          await del(urls, {});

          console.info(urls, 'deleted in Vercel Blob cache');
        } catch (error) {
          console.info('Data failed delete to Vercel Blob cache');
        }
        break;
    }
  } catch (error) {
    console.error('Error deleting to Vercel Blob:', error);
  }
}
