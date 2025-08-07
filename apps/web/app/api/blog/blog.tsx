import { fetchPaginatedData, upsert } from '@/app/api/database/mongodb';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { isNull } from '@/app/helpers/isNull';
import slugify from 'slugify';
import { getBrandInfo } from '@/api/brand/brand';

export async function server_create_or_update_post(formData: PostTypes) {
  let response: any = {};

  try {
    let slug = '';
    const siteInfo = await getBrandInfo();

    if (formData.slug) {
      slug = slugify(formData.slug!, {
        lower: true, // Convert to lower case
        strict: true, // Remove special characters
      });
    } else {
      return invalid_response('slug is missing', 200);
    }

    const cres = await get_post({ id: slug! });
    const product = await cres.json();

    let slugExist = false;

    if (product.success && product.data.id !== formData.id) {
      slugExist = true;
    }

    const data: PostTypes = {
      id: formData.id || '',
      title: formData.title,
      slug: slug,
      userId: formData.userId,
      body: formData.body,
      description: formData.description,
      type: formData.type,
      status: (formData.status as any) || 'published',
      brandId: formData.brandId,
      premiumPin: formData.premiumPin,
      freePin: formData.freePin,
      freeView: formData.freeView,
      multiple: formData.multiple,
      price: formData.price,
      formerPrice: formData.formerPrice,
      image: formData.image,
      tags: formData.tags,
      category: formData.category,
    };

    let uData = beforeUpdate(data);

    let res: boolean = false;
    if (!slugExist) {
      res = await upsert(uData, 'posts', true, siteInfo!);
    }

    if (res) {
      response.msg = 'blog post page created';
      response.code = 'success';
      response.success = true;
    } else if (slugExist) {
      response.msg = 'post with this slug already exist';
      response.code = 'error';
      response.success = false;
    } else {
      response.msg = 'post page not created. contact admin';
      response.code = 'error';
      response.success = false;
    }

    return api_response(response);
  } catch (error) {
    console.error(error);
    return invalid_response('error creating/updating post');
  }
}

export async function get_post({
  id,
}: {
  id?: any;
  userId?: string;
  tenantId?: string;
  context?: any;
}) {
  try {
    let res: any = [];

    let response: any = {};

    if (res[0]) {
      response.msg = 'post fetched';
      response.code = 'success';
      response.success = true;
      response.data = res[0];
    } else {
      response.msg = 'post not fetched';
      response.code = 'error';
      response.success = false;
    }

    return api_response(response);
  } catch (error) {
    return api_response({});
  }
}

export async function get_posts({
  user_id,
  type,
  spId,
  page,
  limit,
  context,
}: {
  user_id: any;
  type: string;
  spId?: string;
  page?: string;
  limit?: string;
  context?: any;
}) {
  try {
    let conditions: any = {};

    if (!isNull(user_id)) {
      conditions.userId = user_id;
    }

    if (!isNull(type)) {
      conditions.$or = [{ type: type }, { serviceType: type }];
    }

    if (!isNull(spId)) {
      conditions.spId = spId;
    }

    let res = await fetchPaginatedData({
      collectionName: 'posts',
      conditions,
      limit: limit!,
      page: page!,
    });

    let response: any = {};

    if (res.data.length > 0) {
      response.msg = 'posts fetched';
      response.code = 'success';
      response.success = true;
      response.meta = res.meta;
      response.data = res.data;
    } else {
      response.msg = 'posts not fetched';
      response.code = 'error';
      response.success = false;
      response.meta = {};
      response.data = [];
    }

    return api_response(response);
  } catch (error) {
    console.error(error);
    return api_response('error fetching products');
  }
}
