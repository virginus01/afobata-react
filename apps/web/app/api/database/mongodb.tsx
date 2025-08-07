import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import { mode } from '@/app/src/constants';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { getBrandInfo } from '@/api/brand/brand';
import { modHeaders } from '@/app/helpers/modHeaders';
import { baseUrl } from '@/app/helpers/baseUrl';
import { clearCache } from '@/app/actions';
import { cache } from 'react';
import { handleInternalRequest } from '@/api/db/[endpoint]/[cluster]/[table]/route';

// Base API configuration
const API_BASE_URL = '/api/db';

// Helper function to make API calls
async function makeApiCall({
  endpoint,
  options,
  cacheRes,
  tags = [],
}: {
  endpoint: string;
  options: RequestInit;
  cacheRes?: boolean;
  tags?: string[];
}) {
  const url = await baseUrl(`${API_BASE_URL}${endpoint}`);

  const defaultOptions: RequestInit = {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if ((cacheRes || tags) && options.method === 'GET') {
    tags.push('all');

    defaultOptions.next = {
      ...(cacheRes ? { revalidate: process.env.NODE_ENV === 'development' ? 0 : 36000 } : {}),
      ...(tags ? { tags: tags } : {}),
    };
  } else if (tags || (!cacheRes && options.method === 'GET')) {
    tags.forEach((tag) => {
      if (tag !== 'all') {
        clearCache(tag);
      }
    });
  }

  // const response = await fetch(url, { ...defaultOptions, ...options });

  // if (!response.ok) {
  //   console.error(`DB api call failed: ${response.status} ${response.statusText}`);
  //   return { status: false, data: [] };
  // }

  const response = await handleInternalRequest({
    url,
    endpoint,
    ...(options.method !== 'GET' && {
      body: typeof options.body === 'string' ? JSON.parse(options.body) : (options.body ?? {}),
    }),
  });

  const result = await response.json();

  if (tags.includes('products')) {
    // JSON.parse(result);
  }

  return result ?? {};
}

// Helper function to handle authentication
async function getAuthHeaders() {
  const auth = await getAuthSessionData();
  return {
    Authorization: auth?.accessToken ? `Bearer ${auth.accessToken}` : '',
    'SITE-SECRET': process.env.SITE_SECRET,
    'X-User-ID': auth?.id || '',
  } as any;
}

export async function lockAndUnlockTable({
  table,
  id,
  action = 'lock',
}: {
  table: string;
  id: string;
  action?: 'lock' | 'unlock';
}) {
  try {
    let data = {
      id,
      processing: action === 'lock' ? true : false,
    };

    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        table,
        id,
        data,
        conditions: { id },
      }),
    };

    const result = await makeApiCall({
      endpoint: `/update/${process.env.MONGODB_DATABASE}/${table}`,
      options,
      tags: [table],
    });

    return mongo_response(result);
  } catch (error) {
    console.error('Failed to update via API:', error);
    return mongo_response({ status: false, msg: 'error occurred' });
  }
}

export async function updateData({
  data,
  table,
  id,
  siteInfo,
}: {
  data: Record<string, any>;
  table: string;
  id: string;
  siteInfo?: BrandType;
}) {
  try {
    if (isNull(id) || isNull(table) || isNull(data)) {
      console.error('no id, table or data found');
      return mongo_response({ status: false, msg: 'no id, table or data found' });
    }

    let brand = siteInfo;
    if (isNull(siteInfo)) {
      brand = await getBrandInfo();
    }

    const currentDateTime = convertDateTime().toLocaleString();

    // Clean data
    delete data.id;
    delete data.slug;
    delete data.updatedAt;
    data.updatedAt = data.updatedAt || currentDateTime;
    data.lastUpdatedFrom = brand?.id;

    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        table,
        id,
        data,
        conditions: { id },
      }),
    };

    const result = await makeApiCall({
      endpoint: `/update/${process.env.MONGODB_DATABASE}/${table}`,
      options,
      tags: [table],
    });

    return mongo_response(result);
  } catch (error) {
    console.error('Failed to update via API:', error);
    return mongo_response({ status: false, msg: 'error occurred' });
  }
}

export async function removeKey({ key, table }: { key: string; table: string }) {
  try {
    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        table,
        key,
      }),
    };

    const result = await makeApiCall({
      endpoint: `/remove-field/${process.env.MONGODB_DATABASE}/${table}`,
      options,
      tags: [table],
    });

    return mongo_response(result);
  } catch (error) {
    console.error('Failed to remove key via API:', error);
    return mongo_response({ status: false, msg: 'error occurred' });
  }
}

export async function updateWithSlug({
  data,
  table,
  id,
  siteInfo,
}: {
  data: Record<string, any>;
  table: string;
  id: string;
  siteInfo?: BrandType;
}) {
  try {
    if (isNull(id) || isNull(table) || isNull(data)) {
      console.error('no id, table or data found');
      return mongo_response({ status: false, msg: 'no id, table or data found' });
    }

    let brand = siteInfo;
    if (isNull(siteInfo)) {
      brand = await getBrandInfo();
    }

    const currentDateTime = convertDateTime().toLocaleString();

    // Clean data
    delete data.id;
    delete data.updatedAt;
    data.updatedAt = data.updatedAt || currentDateTime;
    data.lastUpdatedFrom = brand?.id;

    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'PUT',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        table,
        id,
        data,
        matchBy: ['id'],
      }),
    };

    const result = await makeApiCall({
      endpoint: `/update/${process.env.MONGODB_DATABASE}/${table}`,
      options,
      tags: [table],
    });

    return mongo_response(result);
  } catch (error) {
    console.error('Failed to update with slug via API:', error);
    return mongo_response({ status: false, msg: 'error occurred' });
  }
}

export const fetchData = cache(
  async (collectionName: string, id: any, cacheRes?: boolean): Promise<any> => {
    try {
      const authHeaders = await getAuthHeaders();

      const queryParams = new URLSearchParams();

      if (id) {
        queryParams.append('cds', encodeURIComponent(JSON.stringify({ id })));
      }

      const queryString = queryParams.toString();
      const mod = await modHeaders('get');

      const options: any = {
        method: 'GET',
        headers: {
          ...mod,
          ...authHeaders,
        },
      };

      const result = await makeApiCall({
        endpoint: `/fetch/${process.env.MONGODB_DATABASE}/${collectionName}?${queryString}`,
        options,
        tags: [collectionName],
        cacheRes,
      });

      return result?.data ?? [];
    } catch (error) {
      console.error(`Failed to fetch data from collection "${collectionName}":`, error);
      return null;
    }
  },
);

export const fetchDataWithConditions = cache(
  async (
    collectionName: string,
    conditions: { [key: string]: any },
    sortOptions: { [key: string]: any } = {},
    cacheRes: boolean = true,
  ): Promise<any> => {
    try {
      const authHeaders = await getAuthHeaders();

      const queryParams = new URLSearchParams();

      if (conditions) {
        queryParams.append('cds', encodeURIComponent(JSON.stringify(conditions)));
      }
      if (sortOptions) {
        queryParams.append('sort', encodeURIComponent(JSON.stringify(sortOptions)));
      }

      const queryString = queryParams.toString();
      const mod = await modHeaders('get');

      const options = {
        method: 'GET',
        headers: {
          ...mod,
          ...authHeaders,
        },
      };

      const result = await makeApiCall({
        endpoint: `/fetch/${process.env.MONGODB_DATABASE}/${collectionName}?${queryString}`,
        options,
        tags: [collectionName],
        cacheRes,
      });

      return result?.data ?? [];
    } catch (error) {
      console.error(
        `Failed to fetch data from collection "${collectionName}" with conditions:`,
        error,
      );
      return [];
    }
  },
);

export async function deleteDataWithConditions({
  collectionName,
  conditions,
  ignoreCache = false,
}: {
  collectionName: string;
  conditions: { [key: string]: any };
  ignoreCache?: boolean;
}): Promise<{ deletedCount: number }> {
  try {
    if (isNull(conditions)) {
      throw Error("conditions can't be null for delete");
    }

    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'DELETE',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        collectionName,
        conditions,
        ignoreCache,
      }),
    };

    const result = await makeApiCall({
      endpoint: `/delete/${process.env.MONGODB_DATABASE}/${collectionName}`,
      options,
      tags: [collectionName],
    });

    return { deletedCount: result.deletedCount || 0 };
  } catch (error) {
    console.error(`Failed to delete data from collection "${collectionName}":`, error);
    return { deletedCount: 0 };
  }
}

export const fetchPaginatedData = cache(
  async ({
    collectionName,
    conditions,
    limit = '10',
    page = '1',
    sortOptions = {},
    cacheRes = true,
  }: {
    collectionName: string;
    conditions: { [key: string]: any };
    limit?: string;
    page?: string;
    sortOptions?: { [key: string]: any };
    cacheRes?: boolean;
  }): Promise<{
    data: any[];
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const authHeaders = await getAuthHeaders();

      const queryParams = new URLSearchParams();

      if (conditions) queryParams.append('cds', encodeURIComponent(JSON.stringify(conditions)));

      if (sortOptions) queryParams.append('sort', encodeURIComponent(JSON.stringify(sortOptions)));

      if (limit) queryParams.append('limit', limit);

      if (page) queryParams.append('page', page);

      const queryString = queryParams.toString();

      const mod = await modHeaders('get');

      const options = {
        method: 'GET',
        headers: {
          ...mod,
          ...authHeaders,
        },
      };

      const result = await makeApiCall({
        endpoint: `/fetch-paginated/${process.env.MONGODB_DATABASE}/${collectionName}?${queryString}`,
        options,
        tags: [collectionName],
        cacheRes,
      });

      return result ?? {};
    } catch (error) {
      console.error(`Failed to fetch paginated data from collection "${collectionName}":`, error);
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: parseInt(page, 10),
          itemsPerPage: parseInt(limit, 10),
        },
      };
    }
  },
);
export const fetchMultiplePaginatedData = cache(
  async ({
    collectionNames,
    conditions,
    limit = '10',
    page = '1',
    sortOptions = {},
    cacheRes = true,
  }: {
    collectionNames: string[];
    conditions: { [key: string]: any };
    limit?: string;
    page?: string;
    sortOptions?: { [key: string]: any };
    cacheRes?: boolean;
  }): Promise<{
    data: any[];
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const authHeaders = await getAuthHeaders();

      const queryParams = new URLSearchParams();

      if (conditions) queryParams.append('cds', encodeURIComponent(JSON.stringify(conditions)));

      if (sortOptions) queryParams.append('sort', encodeURIComponent(JSON.stringify(sortOptions)));

      if (limit) queryParams.append('limit', limit);

      if (page) queryParams.append('page', page);

      if (collectionNames.length > 0) {
        queryParams.append('tables', collectionNames.join(','));
      }

      const queryString = queryParams.toString();

      const mod = await modHeaders('get');

      const options = {
        method: 'GET',
        headers: {
          ...mod,
          ...authHeaders,
        },
      };

      const result = await makeApiCall({
        endpoint: `/fetch-multiple-paginated/${process.env.MONGODB_DATABASE}/all?${queryString}`,
        options,
        tags: collectionNames,
        cacheRes,
      });

      return result ?? {};
    } catch (error) {
      console.error(`Failed to fetch data from multiple collections:`, error);
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: parseInt(page, 10),
          itemsPerPage: parseInt(limit, 10),
        },
      };
    }
  },
);

export async function updateDataWithConditions({
  collectionName,
  conditions,
  updateFields,
  personalize,
  siteInfo,
}: {
  collectionName: string;
  conditions: { [key: string]: any };
  updateFields: { [key: string]: any };
  personalize?: boolean;
  siteInfo?: BrandType;
}): Promise<{ status: boolean }> {
  try {
    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        collectionName,
        conditions,
        data: updateFields,
        personalize,
      }),
    };

    const result = await makeApiCall({
      endpoint: `/update/${process.env.MONGODB_DATABASE}/${collectionName}`,
      options,
      tags: [collectionName],
    });

    return mongo_response(result);
  } catch (error) {
    console.error(`Failed to update data with conditions via API:`, error);
    return mongo_response({ status: false, msg: 'Failed to update data' });
  }
}

export function mongo_response(mongoRes: any, id = '') {
  if (mongoRes.status) {
    return { ...mongoRes, id, msg: mongoRes.msg ?? mongoRes.error };
  } else if (mongoRes) {
    return { ...mongoRes, msg: mongoRes.msg ?? mongoRes.error };
  } else {
    return { status: false };
  }
}

export async function deleteData(collectionName: string, id: any): Promise<any> {
  try {
    const authHeaders = await getAuthHeaders();

    if (id) {
      const options = {
        method: 'DELETE',
        headers: {
          ...authHeaders,
        },
        body: JSON.stringify({
          id,
        }),
      };

      const result = await makeApiCall({
        endpoint: `/delete/${process.env.MONGODB_DATABASE}/${collectionName}`,
        options,
        tags: [collectionName],
      });

      return {
        status: true,
        success: true,
        msg: 'deleted',
      };
    } else {
      return {
        status: false,
        success: false,
        msg: 'ID is required to delete a specific document.',
      };
    }
  } catch (error) {
    return {
      status: false,
      success: false,
      msg: 'not deleted',
    };
  }
}

export async function upsert(
  item: any,
  collectionName: string,
  upsert = true,
  siteInfo: BrandType,
) {
  try {
    item = beforeUpdate(item);

    if (isNull(item)) {
      return mongo_response({});
    }

    let brand = siteInfo;

    if (isNull(siteInfo)) {
      brand = await getBrandInfo();
    }

    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'POST',
      headers: {
        ...authHeaders,
      },

      body: JSON.stringify({
        collectionName,
        data: item,
        upsert,
        brandId: brand?.id,
        mode,
      }),
    };

    const result = await makeApiCall({
      endpoint: `/upsert/${process.env.MONGODB_DATABASE}/${collectionName}`,
      options,
      tags: [collectionName],
    });

    return mongo_response(result);
  } catch (error) {
    console.error('Error in upsert via API:', error);
    return mongo_response({});
  }
}

export async function bulkUpsert(
  data: any[],
  collectionName: string,
  upsert = true,
  siteInfo?: BrandType,
) {
  // Input validation
  if (!data || data.length === 0) {
    return mongo_response({
      status: false,
      error: 'Invalid or empty data array',
    });
  }

  try {
    const brand = siteInfo || (await getBrandInfo());

    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'POST',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        collectionName,
        data: data,
        upsert,
        brandId: brand?.id,
        mode,
      }),
    };

    const result = await makeApiCall({
      endpoint: `/bulk-upsert/${process.env.MONGODB_DATABASE}/${collectionName}`,
      options,
      tags: [collectionName],
    });

    return mongo_response(result);
  } catch (error) {
    console.error('Critical error in bulkUpsert via API:', error);
    return mongo_response({
      status: false,
      msg: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error,
    });
  }
}

export async function modifyFieldValue({
  collectionName,
  filter,
  fieldName,
  value,
  operation,
}: {
  collectionName: string;
  filter: Record<string, any>;
  fieldName: string;
  value: number;
  operation: 'increment' | 'decrement';
}): Promise<any> {
  try {
    const missing = findMissingFields({
      collectionName,
      filter,
      fieldName,
      value,
      operation,
    });

    if (missing) {
      throw Error(`missing: ${missing}`);
    }

    const authHeaders = await getAuthHeaders();

    const options = {
      method: 'PATCH',
      headers: {
        ...authHeaders,
      },
      body: JSON.stringify({
        collectionName,
        filter,
        fieldName,
        value,
        operation,
      }),
    };

    const result = await makeApiCall({
      endpoint: `/modify-field/${process.env.MONGODB_DATABASE}/${collectionName}`,
      options,
      tags: [collectionName],
    });

    return result;
  } catch (error) {
    console.error(`Error modifying field via API:`, error);
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
