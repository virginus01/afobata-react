'use server';
import { headers } from 'next/headers';
export async function isBrandSubFHome(): Promise<boolean> {
  try {
    const headersList = await headers();
    const requestUrl = headersList.get('x-url') || '';
    const segments = requestUrl
      .split('/')
      .filter(
        (segment) =>
          segment &&
          segment !== 'api' &&
          segment !== 'http:' &&
          segment !== 'https:' &&
          segment !== 'www',
      );
    if (segments.length < 1) {
      return true;
    }
  } catch (error) {
    console.error(error);
    return true;
  }
  return false;
}
