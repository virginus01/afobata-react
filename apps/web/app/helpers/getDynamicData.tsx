export async function getDynamicData({
  subBase,
  table,
  renderPage,
  tables,
  essentials,
  conditions,
  limit = 50,
  page = 1,
  perPage = 10,
  sortOptions = { createdAt: -1 },
  tag = 'dynamic',
  cache = true,
  remark = '',
}: {
  subBase: string;
  table: string;
  conditions: any;
  renderPage?: string;
  sortOptions?: SortOptions;
  tables?: string[];
  essentials?: string[];
  limit?: number;
  page?: number;
  perPage?: number;
  tag?: string;
  cache?: boolean;
  remark?: string;
}): Promise<{
  data: any[];
  isLoading: boolean;
  status: boolean;
  meta: any;
  msg: string;
  renderData?: any;
  pageEssentials?: any;
}> {
  let isLoading = true;
  try {
    const { api_dynamic_get_data } = await import('@/app/routes/api_routes');
    const { baseUrl } = await import('@/app/helpers/baseUrl');
    const url = await api_dynamic_get_data({
      subBase,
      table,
      conditions,
      limit,
      page,
      perPage,
      sort: sortOptions,
      tables,
      renderPage,
      tag,
      essentials,
      remark: '',
    });

    const finalUrl = await baseUrl(url);
    const { modHeaders } = await import('@/app/helpers/modHeaders');

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: await modHeaders('get'),
      credentials: 'include',
      cache: 'force-cache',
    };
    if (cache) {
      (fetchOptions as any).next = {
        revalidate: process.env.NODE_ENV === 'production' ? 8600 : 1,
        tags: [table],
      };
    } else {
      (fetchOptions as any).next = { revalidate: 0, cache: 'no-store' };
    }
    const res = await fetch(finalUrl, fetchOptions);
    if (!res.ok) {
      console.error(res.statusText);
      return {} as any;
    }
    const { status, data, meta, msg, renderData, pageEssentials } = await res.json();

    return { data, isLoading, status, meta, msg, renderData, pageEssentials };
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `error fetching data from ${table}: ${error}`);
    return { data: [], isLoading: false, status: false, meta: {}, msg: 'error fetching data' };
  }
}
