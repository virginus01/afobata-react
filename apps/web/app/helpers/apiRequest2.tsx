export const apiRequest2 = async ({
  url,
  body,
  method = 'GET',
  tag,
  headers,
}: {
  url: string;
  body: object;
  method: string;
  tag?: string;
  headers: HeadersInit;
}): Promise<{ data: any; status: boolean; msg: string }> => {
  try {
    const { baseUrl } = await import('@/app/helpers/baseUrl');
    const finalUrl = await baseUrl(url);
    const response = await fetch(finalUrl, {
      method,
      headers,
      body: JSON.stringify(body),
    });
    const res = await response.json();
    return { data: res.data, status: res.status, msg: res.msg };
  } catch (error: any) {
    console.error(`API Error [${method}] - ${url}:`, error.message || error);
    throw error;
  } finally {
  }
};
