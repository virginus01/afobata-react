import { apiEndPoint } from '@/app/helpers/apiEndPoint';

export async function baseUrl(slug?: string): Promise<string> {
  const url = await apiEndPoint(slug);
  return url;
}
