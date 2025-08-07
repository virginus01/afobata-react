import { modHeaders } from '@/app/helpers/modHeaders';
export async function pingBrand(url: string): Promise<boolean> {
  try {
    let status = false;
    if (url) {
      const response = await fetch(url, {
        method: 'GET',
        headers: await modHeaders(),
      });
      if (!response.ok) {
        return status;
      }
      const res = await response.json();
      return res.status;
    }
    return status;
  } catch (error) {
    return false;
  }
}
