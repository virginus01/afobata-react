import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { fetchDataWithConditions, upsert } from '@/app/api/database/mongodb';
import slugify from 'slugify';

export async function server_create_and_update_addon(formData: AddonType) {
  try {
    const data = {
      ...formData,
    };
    if (formData.slug) {
      data.slug = slugify(formData.slug!, {
        lower: true,
        trim: true,
        replacement: '_',
      });
    }

    const response = await upsert(data, 'addons', true, {});

    if (response.status) {
      return api_response({ data: response.id, status: true, success: true });
    } else {
      return invalid_response('error occurred try again', 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error creating or updating addon');
  }
}

export async function server_get_addons({ userId, id }: { userId: string; id?: string }) {
  try {
    let conditions: any = {};
    let response: any = {};
    if (id) {
      conditions.id = id;
      [response] = await fetchDataWithConditions('addons', conditions);
    } else {
      response = await fetchDataWithConditions('addons', conditions);
    }

    if (response) {
      return api_response({ data: response, status: true, success: true });
    } else {
      return invalid_response('error occurred try again', 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error creating or updating user');
  }
}
