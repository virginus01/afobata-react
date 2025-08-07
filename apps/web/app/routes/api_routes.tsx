import { baseUrl } from '@/app/helpers/baseUrl';
import { isNull } from '@/app/helpers/isNull';

const subFolder = async (): Promise<string> => {
  return 'none';
};
const defautlRunTime = 'edge';

export const api_get_img_url = async ({
  id,
  height,
  width,
  ext = 'webp',
}: {
  id: string;
  width: number;
  height: number;
  ext?: string;
}): Promise<string> => {
  return `/api/image?id=${id}&width=${width}&height=${height}&ext=${ext}`;
};

export const api_get_products = async ({
  userId,
  productType,
  spId,
  subBase,
  page = 1,
  limit = 50,
  ignore_brand_add,
  marketerBrandId,
  conditions,
}: {
  userId?: string;
  productType?: string;
  spId?: string;
  subBase?: string;
  page?: number;
  limit?: number;
  ignore_brand_add?: 'yes' | 'no';
  marketerBrandId?: string;
  conditions?: any;
}): Promise<string> => {
  // If subBase is not provided, fetch it
  if (!subBase) {
    subBase = await subFolder();
  }

  // Build the query string dynamically, filtering out undefined/null values
  const queryParams = new URLSearchParams();

  if (userId) queryParams.append('user_id', userId);
  if (productType) queryParams.append('type', productType);
  if (spId) queryParams.append('spId', spId);
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (ignore_brand_add) queryParams.append('ignore_brand_add', ignore_brand_add);
  if (marketerBrandId) queryParams.append('mbi', marketerBrandId);

  if (conditions) {
    queryParams.append('cds', encodeURIComponent(JSON.stringify(conditions)));
  }

  // Combine base path with query params
  const queryString = queryParams.toString();

  return `/api/${subBase}/${defautlRunTime}/api_get_products?${queryString}`;
};

export const api_get_posts = async ({
  userId,
  postType,
  spId,
  subBase,
  page = 1,
  limit = 50,
}: {
  userId: string;
  postType?: string;
  spId?: string;
  subBase?: string;
  page?: number;
  limit?: number;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_posts?user_id=${userId}&type=${postType}&spId=${spId}&page=${page}&limit=${limit}`;
};

export const api_order_action = async ({ subBase }: { subBase: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_order_action`;
};

export const api_get_addons = async ({
  userId,
  subBase,
  id = '',
}: {
  userId: string;
  id?: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_addons?userId=${userId}&id=${id}`;
};

export const api_get_packages = async ({
  userId,
  subBase,
  id = '',
}: {
  userId: string;
  id?: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_packages?userId=${userId}&id=${id}`;
};

export const api_create_and_update_addon = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_and_update_addon`;
};

export const api_get_product = async ({
  id,
  subBase,
  userId,
  ignore_brand_add = 'no',
}: {
  id: string;
  subBase?: string;
  userId?: string;
  ignore_brand_add?: 'yes' | 'no';
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_get_product?id=${id}&userId=${userId}&ignore_brand_add=${ignore_brand_add}`;
};

export const api_get_post = async ({
  id,
  subBase,
  userId,
}: {
  id: string;
  subBase?: string;
  userId?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_get_post?id=${id}&userId=${userId}`;
};

export const api_get_data = async ({
  id = '',
  subBase,
  userId,
  page = 1,
  limit = 50,
  ignore_brand_add = 'no',
  conditions,
}: {
  id?: string;
  subBase?: string;
  userId?: string;
  ignore_brand_add?: 'yes' | 'no';
  s?: string;
  page?: number;
  limit?: number;
  conditions?: any;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  const params = new URLSearchParams({
    ...(id && { id }), // Add userId if it exists
    ...(userId && { userId }), // Add userId if it exists
    page: page.toString(), // Add page number
    ignore_brand_add: ignore_brand_add,
    limit: limit.toString(), // Add limit
  });
  if (conditions) {
    params.append('cds', encodeURIComponent(JSON.stringify(conditions)));
  }

  const queryString = params.toString();

  return `/api/${subBase}/${defautlRunTime}/api_get_data?${queryString}`;
};

export const api_create_or_update_product = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_or_update_product`;
};

export const api_create_or_update_post = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_or_update_post`;
};

export const api_dynamic_create_or_update = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_dynamic_create_or_update`;
};

export const api_withdraw_revenue = async ({ subBase }: { subBase: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_withdraw_revenue`;
};

export const api_get_product_by_pin = async ({
  id,
  subBase,
}: {
  id: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_product_by_pin?id=${id}`;
};

export const api_delete_product = async ({
  productId,
  isEndPoint = false,
  subBase,
}: {
  productId: string;
  isEndPoint?: boolean;
  subBase?: string;
}) => {
  return `/api/${subBase}/${defautlRunTime}/delete_product?id=${productId}`;
};

export const api_get_orders = async ({
  userId,
  orderStatus,
  subBase,
  page = 1,
  limit = 50,
}: {
  userId: string;
  orderStatus: string;
  subBase?: string;
  page?: number;
  limit?: number;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_orders?user_id=${userId}&status=${orderStatus}&page=${page}&limit=${limit}`;
};

export const api_get_payments = async ({
  userId,
  orderStatus,
  type,
  subBase,
  page = 1,
  limit = 50,
}: {
  userId: string;
  orderStatus: string;
  subBase?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_payments?user_id=${userId}&status=${orderStatus}&type=${type}&page=${page}&limit=${limit}`;
};

export const api_get_sps = async ({
  type,
  status = 'live',
  subBase,
}: {
  type: string;
  status?: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_sps?type=${type}&status=${status}`;
};

export const api_get_wallet = async ({
  userId,
  brandId,
  currency,
  type,
  subBase,
}: {
  userId: string;
  brandId: string;
  type: string;
  subBase: string;
  currency: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_wallet?type=${type}&brandId=${brandId}&userId=${userId}&currency=${currency}`;
};

export const api_get_crypto_wallet = async ({
  userId,
  brandId,
  type,
  subBase,
  currency,
}: {
  userId: string;
  brandId: string;
  type: string;
  subBase: string;
  currency: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_crypto_wallet?type=${type}&brandId=${brandId}&userId=${userId}&currency=${currency}`;
};

export const api_create_crypto_wallet = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_crypto_wallet`;
};

export const api_get_wallets = async ({
  userId,
  brandId,
  type,
  subBase,
}: {
  userId: string;
  brandId: string;
  type?: string;
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_wallets?type=${type}&brandId=${brandId}&userId=${userId}`;
};

export const api_get_revenue_info = async ({
  userId,
  brandId,
  type,
  subBase,
}: {
  userId: string;
  brandId: string;
  type?: string;
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_revenue_info?type=${type}&brandId=${brandId}&userId=${userId}`;
};

export const api_get_orders_by_ref = async ({
  ref,
  status = 'live',
  subBase,
}: {
  ref: string;
  status?: string;
  subBase?: string;
}) => {
  return `/api/${subBase}/${defautlRunTime}/api_get_orders_by_ref?ref=${ref}&status=${status}`;
};

export const api_get_brand = async ({ subBase }: { subBase: string }): Promise<string> => {
  return `/api/${subBase}/${defautlRunTime}/api_get_brand`;
};

export const api_get_options = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_options`;
};

export const api_get_user_brand = async ({
  userId,
  subBase,
}: {
  userId: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_user_brand?userId=${userId}`;
};

export const api_create_update_brand = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_update_brand`;
};

export const api_update_views = async ({ subBase }: { subBase: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return await baseUrl(`api/${subBase}/${defautlRunTime}/api_update_views`);
};

export const api_get_location_data = async ({ subBase }: { subBase: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return await baseUrl(`api/${subBase}/${defautlRunTime}/get_location_data`);
};

export const api_import_products = async ({ subBase }: { subBase: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_import_products`;
};

export const api_create_and_update_plan = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_and_update_package`;
};

export const api_delete = async ({
  subBase,
  endpoint,
  id,
  userId,
}: {
  subBase: string;
  endpoint: string;
  id: string;
  userId: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/${endpoint}?id=${id}&user=${userId}`;
};

export const api_brand_domain_connection = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_brand_domain_connection`;
};

export const api_add_or_update_domain = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_add_or_update_domain`;
};

export const api_get_domain_verification = async ({
  subBase,
  userId,
  brandId,
}: {
  subBase: string;
  brandId: string;
  userId: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_domain_verification?userId=${userId}&brandId=${brandId}`;
};

export const api_refresh_domain_status = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_refresh_domain_status`;
};

export const api_custom_domain_actions = async ({
  subBase,
}: {
  subBase: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_custom_domain_actions`;
};

export const api_get_logged_user = async ({
  subBase,
  remark,
}: {
  subBase?: string;
  remark?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_get_logged_user?remark=${remark}`;
};

export const api_get_user = async ({
  id,
  api_key,
  api_secret,
  subBase,
  brandId,
  uid,
  remark,
}: {
  id?: string;
  uid?: string;
  api_key?: string;
  api_secret?: string;
  subBase?: string;
  brandId?: string;
  remark?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  if (isNull(brandId)) {
    brandId = subBase;
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_logged_user?remark=${remark}`;
};

export const api_get_views = async ({
  table,
  slug,
  subBase,
  brandId,
}: {
  table?: string;
  slug?: string;
  subBase?: string;
  brandId?: string;
  remark?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  if (isNull(brandId)) {
    brandId = subBase;
  }

  return `/api/${subBase}/${defautlRunTime}/api_get_views?table=${table ?? ''}&slug=${slug ?? ''}`;
};

export const api_get_auth = async ({
  userId,
  api_key,
  api_secret,
  subBase,
}: {
  userId?: string;
  api_key?: string;
  api_secret?: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/get_user?id=${userId}&api_key=${api_key}&api_secret=${api_secret}`;
};

export const api_get_keys = async ({
  keyType,
  subBase,
}: {
  keyType: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_keys?keyType=${keyType}`;
};

export const api_get_site_keys = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_site_keys?keyType=site`;
};

export const api_decrypt = async ({
  data,
  subBase,
}: {
  data: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/decrypt?crypto=${data}`;
};

export const api_query_payment = async ({
  id,
  subBase,
}: {
  id: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_query_payment?id=${id}`;
};

export const api_create_order = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_order`;
};

export const api_create_payment = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_payment`;
};

export const api_create_va = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_va`;
};

export const api_update_user = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_update_user`;
};

export const api_add_user_bank_details = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_add_user_bank_details`;
};

export const api_update_order = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_update_order`;
};

export const api_update_auth = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_update_auth`;
};

export const api_starter = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_update_auth`;
};

export const api_brand_setup = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_brand_setup`;
};

export const api_crud = async ({
  subBase,
  id,
  table,
  method,
  action = 'crud',
  conditions = {},
  userId,
}: {
  subBase?: string;
  id: string;
  table: string;
  method: 'post' | 'get' | 'put' | 'patch' | 'delete';
  action?: 'crud' | string;
  conditions?: any;
  userId?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  const queryParams = new URLSearchParams();

  if (conditions) {
    queryParams.append('cds', encodeURIComponent(JSON.stringify(conditions)));
  }

  const queryString = queryParams.toString();

  return `/api/${subBase}/${defautlRunTime}/${action}?${queryString}&userId=${userId}&${table}&${id}`;
};

export const api_create_user = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_create_user`;
};

export const api_update_info = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_update_info`;
};

export const api_verifications = async ({
  id,
  spId,
  type,
  subBase,
}: {
  id: string | number;
  spId: string;
  type: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_verifications?id=${id}&spId=${spId}&type=${type}`;
};

export const api_get_banks = async ({
  id,
  country,
  subBase,
}: {
  id?: string;
  country?: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_banks?id=${id}&country=${country}`;
};

export const api_refresh_views = async ({
  userId,
  subBase,
}: {
  userId?: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_refresh_views?userId=${userId}`;
};

export const api_get_images = async ({
  source,
  tag,
  subBase,
}: {
  source: string;
  tag: string;
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/api_get_images?source=${source}&tag=${tag}`;
};

export const api_logout = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/auth/logout`;
};

export const api_login = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/auth/login`;
};

export const api_signup = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_signup`;
};

export const api_add_update_subsidiary = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_add_update_subsidiary`;
};

export const api_user_account_verifications = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/${subBase}/${defautlRunTime}/api_user_account_verifications`;
};

export const api_get_info = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder(); // Fetch cached subBase if not provided
  }
  return `/api/${subBase}/${defautlRunTime}/get_info`;
};

export const api_get_ip_info = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_get_ip_info`;
};

export const api_user_stats = async ({
  subBase,
  userId,
  brandId,
  duration,
}: {
  subBase?: string;
  userId: string;
  brandId: string;
  duration: number;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_user_stats?userId=${userId}&brandId=${brandId}&duration=${duration}`;
};

export const api_upload_file = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/node/api_upload_file`;
};

export const api_check_action_status = async ({
  subBase,
  branchId,
}: {
  subBase?: string;
  branchId: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_check_action_status?branchId=${branchId}`;
};

export const api_send_mail = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_send_mail`;
};

export const api_generate_user_token = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_generate_user_token`;
};

export const api_get_files = async ({
  subBase,
  userId,
  type,
}: {
  subBase?: string;
  userId?: string;
  type?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_get_files?userId=${userId}&type=${type}`;
};

export const api_get_currencies = async ({
  subBase,
  conditions,
}: {
  subBase?: string;
  conditions?: any;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  const queryParams = new URLSearchParams();

  if (conditions) {
    queryParams.append('cds', encodeURIComponent(JSON.stringify(conditions)));
  }

  const queryString = queryParams.toString();

  return `/api/${subBase}/${defautlRunTime}/api_get_currencies?${queryString}`;
};

export const always = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }
  return `/api/a/node/run_cron_job?target=always`;
};

export const api_get_exchange_rates = async ({
  subBase,
}: {
  subBase?: string;
  conditions?: any;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  const queryParams = new URLSearchParams();

  const queryString = queryParams.toString();

  return `/api/${subBase}/${defautlRunTime}/api_get_exchange_rates?${queryString}`;
};

export const api_get_parents = async ({
  subBase,
  brandId,
}: {
  subBase?: string;
  brandId: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return await baseUrl(`/api/${subBase}/${defautlRunTime}/api_get_parents?brandId=${brandId}`);
};

export const api_get_csrf = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = 'none';
  }

  return `/api/${subBase}/${defautlRunTime}/api_get_csrf`;
};

export const api_dynamic_get_data = async ({
  table,
  subBase,
  page = 1,
  limit = 10000,
  perPage = 10,
  conditions,
  tables = [],
  renderPage,
  sort = { createdAt: -1 },
  tag = '',
  essentials = [],
  remark = '',
}: {
  table: string;
  tag?: string;
  renderPage?: string;
  subBase?: string;
  tables?: string[];
  essentials?: string[];
  page?: number;
  limit?: number;
  perPage?: number;
  conditions: any;
  sort: any;
  remark?: string;
}): Promise<string> => {
  // If subBase is not provided, fetch it
  if (!subBase) {
    subBase = await subFolder();
  }

  // Build the query string dynamically, filtering out undefined/null values
  const queryParams = new URLSearchParams();

  if (conditions) {
    queryParams.append('cds', encodeURIComponent(JSON.stringify(conditions)));
  }

  if (sort) {
    queryParams.append('sort', encodeURIComponent(JSON.stringify(sort)));
  }

  if (tables.length > 0) {
    queryParams.append('tables', tables.join(',')); // Convert array to CSV format
  }

  // Combine base path with query params
  const queryString = queryParams.toString();

  return `/api/${subBase}/${defautlRunTime}/api_dynamic_get_data?table=${table}&page=${page}&limit=${limit}&${queryString}&perPage=${perPage}&renderPage=${renderPage}&tag=${tag}&essentials=${essentials?.join(
    ',',
  )}&remark=${remark}`;
};

export const api_create_wallet = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_create_wallet`;
};

export const api_create_subscription = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_create_subscription`;
};

export const api_trigger_build = async ({ subBase }: { subBase?: string }): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/node/api_trigger_build`;
};

export const api_change_order_status = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_change_order_status`;
};

export const api_credit_and_debit_ai_units = async ({
  subBase,
}: {
  subBase?: string;
}): Promise<string> => {
  if (!subBase) {
    subBase = await subFolder();
  }

  return `/api/${subBase}/${defautlRunTime}/api_credit_and_debit_ai_units`;
};
