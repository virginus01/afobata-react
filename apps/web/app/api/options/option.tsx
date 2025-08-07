import { fetchDataWithConditions } from '@/app/api/database/mongodb';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { isNull } from '@/app/helpers/isNull';

export async function server_get_options(context: any) {
  try {
    const [options] = await fetchDataWithConditions('options', {});

    return api_response({ data: options, status: !isNull(options) });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return invalid_response('Error getting brand', 401);
  }
}
