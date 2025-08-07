import { getClientCookie } from '@/app/helpers/getClientCookie';

export function testCookieRetrieval(cookieName: string): void {
  console.info(`Testing cookie retrieval for: ${cookieName}`);
  const cookie = getClientCookie(cookieName);
  console.info(`Retrieved cookie value: ${cookie}`);
}
