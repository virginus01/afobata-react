import { baseUrl } from '@/app/helpers/baseUrl';
import { modHeaders } from '@/app/helpers/modHeaders';

import { api_dynamic_get_data } from '@/app/routes/api_routes';

export default async function FetchDynamicData({
  subBase,
  table,
  renderPage,
  tables,
  essentials,
  conditions,
  limit = 50,
  page = 1,
  perPage = 50,
  sortOptions = { createdAt: -1 },
  tag = 'dynamic',
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
    });
    const finalUrl = await baseUrl(url);
    let headers: any = {};

    headers['Content-Type'] = 'application/json';
    const res = await fetch(finalUrl, {
      method: 'GET',
      headers: await modHeaders(),
    });

    const { status, data, meta, msg, renderData, pageEssentials } = await res.json();

    return { data, isLoading, status, meta, msg, renderData, pageEssentials };
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `error fetching data from ${table}: ${error}`);

    return {
      data: [],
      isLoading: false,
      status: false,
      meta: {},
      msg: 'error fetching data',
    };
  }
}
