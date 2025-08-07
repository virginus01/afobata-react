import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { fetchDataWithConditions, upsert } from '@/app/api/database/mongodb';
import { CRUD_CONFIG } from '@/app/src/constants';
import { clearCache } from '@/app/actions';
import { Data } from '@/app/models/Data';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { invalid_response } from '@/app/helpers/invalid_response';
import { api_response } from '@/app/helpers/api_response';

// Main logic for handling the request
export async function crud_edge_put({
  body,
  siteInfo,
}: {
  body: Data;
  siteInfo: BrandType;
}): Promise<any> {
  const { table, id, data } = body as any;

  const missing = findMissingFields({ table, id, data });

  if (missing) return invalid_response(`${missing} are missing`, 409);

  // Check for duplicate entries
  let [existingItem] = await fetchDataWithConditions(
    table,
    { $or: [{ id }, { slug: data.slug ?? '' }] },
    {},
    false,
  );

  if (existingItem) {
    return api_response({
      data: existingItem,
      status: false,
      success: false,
      code: 'exists',
      msg: 'Data already exists',
    });
  }

  const semiFinalData = beforeUpdate(data, true);
  const { wallet, subscription, password, api_secret, ...finalData } = semiFinalData;

  // Validate and handle table operations
  if (CRUD_CONFIG.allowedTables.includes(table)) {
    const result = await upsert(finalData, table, true, siteInfo);
    clearCache(table);

    return result.status
      ? api_response({
          status: result.status,
          msg: result.msg ?? 'Created successfully',
          data: finalData,
          code: 'notExist',
        })
      : invalid_response(result.msg || 'Failed to create item', 500);
  }

  return invalid_response('Operation not allowed on this table', 403);
}
