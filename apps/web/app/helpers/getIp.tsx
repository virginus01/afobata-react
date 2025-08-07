'use server';
import { headers } from 'next/headers';
export async function getIp() {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    let userIp;
    if (process.env.NODE_ENV === 'development') {
      userIp = '102.89.47.90';
    } else {
      userIp = forwardedFor ? forwardedFor.split(',')[0] : realIp || 'Unknown';
    }
    return userIp;
  } catch (error) {
    return '0.0.0.0';
  }
}
