import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import slugify from 'slugify';
import { get_site_info, getBrandInfo } from '@/api/brand/brand';
import { priced } from '@/helpers/price_logic';
import { sendMail, validateEmail } from '@/api/mail/send_mail';
import { Order } from '@/app/models/Order';
import {
  bulkUpsert,
  deleteData,
  fetchDataWithConditions,
  fetchPaginatedData,
  upsert,
} from '@/api/database/mongodb';
import { Brand } from '@/app/models/Brand';
import { api_response } from '@/helpers/api_response';
import { invalid_response } from '@/helpers/invalid_response';
import { isNull } from '@/helpers/isNull';

export async function delete_product(id?: any) {
  try {
    let res = await deleteData('products', id);

    let response: any = {};

    if (res.status) {
      response.msg = 'product deleted';
      response.code = 'success';
      response.success = true;
      res.data = {};
    } else {
      response.msg = res.msg || 'product not deleted';
      response.code = 'error';
      response.success = false;
      res.data = {};
    }

    return api_response(response);
  } catch (error) {
    return api_response({});
  }
}

export async function server_create_or_update_product(formData: ProductTypes, siteInfo: any) {
  let response: any = {};

  try {
    let slug = '';

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
      premiumPin: formData.premiumPin,
      freePin: formData.freePin,
      freeView: formData.freeView,
      multiple: formData.multiple,
      price: parseInt(formData?.price?.toString() || '0'),
      formerPrice: parseInt(formData?.formerPrice?.toString() || '0'),
      currency: formData.currency,
      image: formData.image,
      tags: formData.tags,
      category: formData.category || 'uncategorized',
    };

    let uData = beforeUpdate(data);

    let res: any = {};

    if (!slugExist) {
      res = await upsert(uData, 'products', true, siteInfo);
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

export async function server_import_product(formData: ProductTypes[], context: any) {
  let response: any = {};

  try {
    const siteInfo = await get_site_info(context);

    let products: ProductTypes[] = [];

    for (let product of formData) {
      let slug = slugify(product?.slug!);

      const data: ProductTypes = {
        parentId: product.parentId || '',
        title: product.title,
        slug: slug,
        type: product.type,
        marketerBrandId: product.marketerBrandId,
      };

      let uData = beforeUpdate(data);

      products.push(uData);
    }

    let res: any = {};
    res = await bulkUpsert(products, 'products', true, siteInfo);

    if (res.status) {
      response.msg = `${res.added} products imported, ${res.updated} existed`;
      response.code = 'success';
      response.success = true;
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

export async function get_product({
  id,
  brand,
  context,
}: {
  id?: any;
  brand?: BrandType;
  context?: any;
}) {
  try {
    let [product] = await fetchDataWithConditions('products', {
      $or: [{ slug: id }, { id }],
    });

    let response: any = {};

    if (product) {
      let cBrand: BrandType = brand ?? {};
      if (isNull(brand)) {
        cBrand = await getBrandInfo(context);
      }

      let newProduct = product;

      try {
        newProduct = await modProduct({ product, siteInfo: cBrand });
      } catch (error: any) {
        console.error('modProduct error:', error);
        newProduct = product;
      }

      response.msg = 'product fetched';
      response.code = 'success';
      response.success = true;
      response.data = newProduct;
    } else {
      response.msg = 'product not fetched';
      response.code = 'error';
      response.success = false;
      response.data = {};
    }

    return api_response(response!);
  } catch (error) {
    return api_response({});
  }
}

export async function server_get_product_by_pin(id?: any) {
  try {
    let res: any[] = [];

    let response: any = {};

    if (res[0]) {
      response.msg = 'course fetched';
      response.code = 'success';
      response.success = true;
    } else {
      response.msg = 'course not fetched';
      response.code = 'error';
      response.success = false;
    }

    return api_response(response, res[0]);
  } catch (error) {
    return api_response({});
  }
}

export async function get_products({
  user_id,
  type,
  spId,
  page,
  limit,
  context,
  siteInfo,
  ignore_brand_add = 'no',
  mbi,
  conditions,
}: {
  user_id: any;
  type: string;
  spId?: string;
  page?: string;
  limit?: string;
  context?: any;
  siteInfo?: BrandType;
  ignore_brand_add?: 'yes' | 'no';
  mbi?: string;
  conditions?: any;
}) {
  try {
    if (isNull(conditions)) {
      return invalid_response('no condition specidied');
    }

    let res = await fetchPaginatedData({
      collectionName: 'products',
      conditions,
      limit: limit!,
      page: page!,
    });

    let response: any = {};

    if (res.data.length > 0) {
      let products = [];
      let cBrand = siteInfo;

      if (isNull(siteInfo)) {
        cBrand = await get_site_info(context);
      }

      for (const product of res.data) {
        let newProduct = product;

        if (!isNull(product.marketerBrandId)) {
          const [parentProduct] = await fetchDataWithConditions('products', {
            id: product.parentId,
          });

          const { title, slug, ...modParentProduct } = parentProduct;
          newProduct = { ...product, ...modParentProduct };
        }

        products.push(newProduct);
      }

      response.msg = 'products fetched';
      response.code = 'success';
      response.success = true;
      response.meta = res.meta;
      response.data = products;
    } else {
      response.msg = 'no product fetched';
      response.code = 'error';
      response.success = false;
      response.meta = {};
      response.data = [];
    }

    return api_response(response);
  } catch (error) {
    console.error('error fetching product', error);
    return invalid_response('error fetching products');
  }
}

export async function fulfill_digital_product({
  product,
  order,
  brand,
  user,
}: {
  product: DataType;
  order: Order;
  brand: BrandType;
  user: UserTypes;
}) {
  try {
    if (process.env.NODE_ENV === 'production') {
      let isValid = user.emailVerified;

      if (!isValid) {
        isValid = await validateEmail(order.email ?? '');
      }

      if (isValid) {
        const sendData: SendMailData = {
          to: [order.email ?? '', 'afobata@gmail.com'],
          from: `${brand.name} <no-reply@afobata.com>`,
          subject: 'Thank your for your order',
          body: { data: { product, order, brand, user }, templateId: 'fullFillDigital' },
        };

        const send = await sendMail({
          data: sendData,
        });

        if (!send.success) {
          console.error(send.msg);
        }
      }
    }
    return { status: 'processed' };
  } catch (e) {
    console.error(e);
    return { status: order.status };
  }
}

export async function modProduct({
  product,
  siteInfo,
}: {
  product: DataType;
  siteInfo: BrandType;
}) {
  let newProduct: any = product;

  if (isNull(siteInfo)) throw Error("siteInfo can't be null");

  try {
    let parentData: DataType = {};

    if (product.serviceType === 'utility') {
      const siteRule = siteInfo.rules ?? [];
      const ruleObj = siteRule.find((r) => r.name === product.type);
      newProduct.rules = { reseller: ruleObj };
    }

    if (!isNull(product.parentId)) {
      [parentData] = await fetchDataWithConditions('products', { id: product.parentId });

      if (parentData && parentData.price) {
        newProduct.price = Number(parentData.price);
        newProduct.reseller_discount = Number(parentData.reseller_discount);
        newProduct.currency = parentData.currency;
        newProduct.currencySymbol = parentData.currencySymbol;
      }
    } else {
      newProduct.price = Number(newProduct.price);
      newProduct.reseller_discount = Number(newProduct.reseller_discount);
    }

    newProduct.parentData = parentData;

    newProduct = priced({ product: newProduct, siteInfo });
    return newProduct;
  } catch (error) {
    throw Error(error as any);
  }
}
