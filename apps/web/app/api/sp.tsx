import { api_response } from '@/app/helpers/api_response';
import { fetchDataWithConditions } from '@/api/database/connection';

export async function get_sps(type: string, status: string, id?: string) {
  try {
    let conditions = {};
    if (id) {
      conditions = {
        id: id,
      };
    } else {
      conditions = {
        type: type,
        // status: status,
      };
    }

    let res = await fetchDataWithConditions('service_providers', conditions);

    let response: any = {};

    if (res) {
      let data: any = res;
      if (id) {
        data = res[0];
      }

      if (data) {
        response.msg = 'product fetched';
        response.code = 'success';
        response.success = true;
        response.data = data;
      } else {
        response.msg = 'product not fetched';
        response.code = 'error';
        response.success = false;
        response.data = data;
      }
    }

    return api_response(response);
  } catch (error) {
    return api_response({});
  }
}
