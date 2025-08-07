import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { deleteDataWithConditions } from '@/app/api/database/mongodb';
import { Data } from '@/app/models/Data';
import { getAuthSessionData } from '@/app/controller/auth_controller';

// Configurations
const CONFIG = {
  csrfIgnoredRoutes: [''],
  allowedTables: ['products'],
};

// Main Logic for Handling the Request
export async function crud_edge_delete({
  body,
  siteInfo,
}: {
  body: Data;
  siteInfo: BrandType;
}): Promise<any> {
  const { table, id, data } = body as any;

  const missing = findMissingFields({ table, id });

  if (missing) return invalid_response(`${missing} are missing`, 409);

  const session = await getAuthSessionData();

  // Update Data
  if (CONFIG.allowedTables.includes(table)) {
    const result: any = await deleteDataWithConditions({
      collectionName: table,
      conditions: { id, userId: session.userId },
    });

    return result.status
      ? api_response({
          status: true,
          msg: 'Deleted successfully',
          data: {},
        })
      : invalid_response(result.msg || 'Failed to delete item', 500);
  }

  return invalid_response('Operation not allowed on this table', 403);
}
