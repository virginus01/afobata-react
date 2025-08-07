'use server';
import { headers } from 'next/headers';
export async function apiEndPoint(slug?: string): Promise<string> {
  const headersList = await headers();
  const { parseUrl } = await import('@/middleware/requestDomain');
  const url = parseUrl(headersList);
  try {
    if (!slug) {
      return '#';
    }
    if (!slug.startsWith('/')) {
      slug = '/' + slug;
    }
    const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
    const fullUrl = protocol + url.fullHostName + slug;
    return fullUrl;
  } catch (error) {
    console.error('Error in apiEndPoint:', error);
    return '#';
  }
}
