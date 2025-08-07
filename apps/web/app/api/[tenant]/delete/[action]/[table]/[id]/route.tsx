import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/middleware/csrf';
import { api_response } from '@/app/helpers/api_response';
import { extractFields } from '@/app/helpers/extractFields';
import { invalid_response } from '@/app/helpers/invalid_response';
import { verifyAccessToken } from '@/app/helpers/verifyAccessToken';

import { isNull } from '@/app/helpers/isNull';
import { getBrandInfo } from '@/app/api/brand/brand';
import { deleteData, fetchDataWithConditions } from '@/app/api/database/mongodb';
import { rateLimitMiddleware } from '@/middleware/rate_limit';

const authenticationIgnore = [''];

// Configurations
const CONFIG = {
  csrfIgnoredRoutes: [''],
  allowedTables: ['products'],
};

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ tenant: string; table: string; id: string }> },
): Promise<any> {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    const nextResponse = NextResponse.next();
    const { csrfToken, apiKey, apiSecret, siteApiSecret } = await extractFields(request);

    if (process.env.NODE_ENV !== 'development') {
      if (isNull(siteApiSecret) || siteApiSecret != process.env.NEXT_PUBLIC_TRUST_CODE) {
        return invalid_response('not permitted to do this', 500);
      }
    }

    // Await context.params to resolve the Promise before accessing
    const { table, id } = await context.params;

    const { csrfIgnoredRoutes, allowedTables } = CONFIG;

    // Validate Parameters
    if (isNull(table)) return invalid_response('No table provided', 400);
    if (isNull(id)) return invalid_response('No ID provided', 400);

    // CSRF Validation
    const isCsrfIgnored = csrfIgnoredRoutes.includes(table);
    if (!csrfToken && !isCsrfIgnored) return invalid_response('CSRF Token not found', 403);

    // Site Info Validation
    const siteInfo = await getBrandInfo(context);
    if (isNull(siteInfo)) return invalid_response('Site not on our network', 404);

    // Handle CSRF or Bypass
    const response = await (isCsrfIgnored
      ? handleRequest(request, await context.params, siteInfo, context)
      : csrfProtection(request, nextResponse, async () =>
          handleRequest(request, await context.params, siteInfo, context),
        ));

    return response || invalid_response('Response not generated', 500);
  } catch (error) {
    console.error('Unexpected error in DELETE handler:', error);
    return invalid_response('Internal Server Error', 500);
  }
}

// Main Logic for Handling the Request
async function handleRequest(
  request: NextRequest,
  params: { table: string; tenant: string; id: string },
  siteInfo: BrandType,
  context: any,
): Promise<any> {
  const { table, id } = params;
  const { apiKey, apiSecret, userId } = await extractFields(request);

  // Check for Existing Item
  const [existingItem] = await fetchDataWithConditions(table, {
    $and: [
      {
        $or: [{ id }, { slug: id }, { _id: id }],
      },
    ],
  });

  if (!existingItem) return invalid_response("Item doesn't exist", 409);

  if (!authenticationIgnore.includes(table)) {
  }

  // Update Data
  if (CONFIG.allowedTables.includes(table)) {
    const result = await deleteData(table, id);

    return result.status
      ? api_response({
          status: true,
          msg: 'Deleted successfully',
          data: { ...existingItem },
        })
      : invalid_response(result.msg || 'Failed to delete item', 500);
  }

  return invalid_response('Operation not allowed on this table', 403);
}
