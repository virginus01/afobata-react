import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import slugify from 'slugify';
import { get_product } from '@/api/product';
import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { upsert } from '@/app/api/database/mongodb';
import { getBrandInfo } from '@/api/brand/brand';

export async function server_create_or_update_category(formData: ProductTypes) {
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

    const cres = await get_product({ id: slug! });
    const product = await cres.json();

    let slugExist = false;

    if (product.success && product.data.id !== formData.id) {
      slugExist = true;
    }

    const data: ProductTypes = {
      id: formData.id || '',
      title: formData.title,
      slug: slug,
      userId: formData.userId,
      brandId: formData.brandId,
      body: formData.body,
      description: formData.description,
      type: formData.type,
      status: (formData.status as any) || 'published',
      image: formData.image,
      tags: formData.tags,
      category: formData.category || 'uncategorized',
    };

    let uData = beforeUpdate(data);

    let res: any = {};

    if (!slugExist) {
      res = await upsert(uData, 'categories', true, siteInfo);
    }

    if (res.status) {
      response.msg = 'product page created';
      response.code = 'success';
      response.success = true;
    } else if (slugExist) {
      response.msg = 'Item with this slug already exist';
      response.code = 'error';
      response.success = false;
    } else {
      response.msg = 'course page not created. contact admin';
      response.code = 'error';
      response.success = false;
    }

    return api_response(response);
  } catch (error) {
    console.error(error);
    return invalid_response('error creating/updating product');
  }
}
