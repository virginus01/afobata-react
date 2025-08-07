import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { fetchDataWithConditions, updateDataWithConditions } from '@/app/api/database/mongodb';
import { CRUD_CONFIG } from '@/app/src/constants';
import { clearCache } from '@/app/actions';
import { Data } from '@/app/models/Data';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { invalid_response } from '@/app/helpers/invalid_response';
import { api_response } from '@/app/helpers/api_response';
import { globalCacheDelete } from '@/app/helpers/cdn';

// Main Logic for Handling the Request
export async function crud_edge_patch({
  body,
  siteInfo,
}: {
  body: Data;
  siteInfo: BrandType;
}): Promise<any> {
  const { table, id, data } = body as any;

  const missing = findMissingFields({ table, id, data });

  if (missing) return invalid_response(`${missing} are missing`, 409);

  // Update Data
  if (CRUD_CONFIG.allowedTables.includes(table)) {
    const semiFinalData = beforeUpdate(data);

    const { wallet, subscription, password, api_secret, ...finalData } = semiFinalData;

    const session = await getAuthSessionData();

    const result: any = await updateDataWithConditions({
      collectionName: table,
      conditions: { id, userId: session.userId },
      updateFields: finalData,
      siteInfo,
      personalize: true,
    });

    if (result.status) {
      clearCache(table);
      revalidatePath('/');

      const [userBrand] = await fetchDataWithConditions('brands', { userId: session.userId });

      const domain = slugify(
        process.env.NODE_ENV === 'production' ? userBrand?.domain : 'localhost',
        {
          lower: true,
          strict: true,
        },
      );
      const stripedSlug = `${finalData.canonicalSlug || finalData.slug}`;

      let slugs: string[] = [`${userBrand.slug}-${stripedSlug}`, `${userBrand.slug}-home`];

      if (domain) {
        slugs.push(`${domain}-${stripedSlug}`);
        slugs.push(`${domain}-home`);
      }

      globalCacheDelete({ slugs });

      return api_response({
        status: true,
        msg: 'Updated successfully',
        data: { ...finalData },
      });
    }

    return invalid_response(result.msg || 'Failed to update item', 500);
  }

  return invalid_response('Operation not allowed on this table', 403);
}
