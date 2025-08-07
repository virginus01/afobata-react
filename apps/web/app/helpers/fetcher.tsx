import { modHeaders } from '@/app//helpers/modHeaders';
export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: await modHeaders('get'),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }
  const response = await res.json();
  if (!response.status) {
    console.error(response.message || 'Failed to fetch item');
  }
  return response?.data ?? {};
};
