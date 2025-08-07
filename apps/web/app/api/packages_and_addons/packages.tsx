import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { fetchDataWithConditions, upsert } from '@/app/api/database/mongodb';
import slugify from 'slugify';
import { getBrandInfo } from '@/app/api/brand/brand';

export async function server_create_and_update_plan(formData: AddonType) {
  try {
    const siteInfo = await getBrandInfo();
    const data = {
      ...formData,
    };
    if (formData.slug) {
      data.slug = slugify(formData.slug!, {
        lower: true,
        trim: true,
      });
    }

    const response = await upsert(data, 'plans', true, siteInfo);

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

export async function server_get_plans({ userId, id }: { userId?: string; id?: string }) {
  try {
    let conditions: any = {};
    let response: any = {};
    if (id) {
      conditions.id = id;
      [response] = await fetchDataWithConditions('plans', conditions);
    } else {
      response = await fetchDataWithConditions('plans', conditions);
    }

    if (response) {
      return api_response({ data: response, status: true, success: true });
    } else {
      return invalid_response('error occurred try again', 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error getting packages');
  }
}
