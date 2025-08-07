import { NextRequest, NextResponse } from 'next/server';
import { api_response } from '@/app/helpers/api_response';
import { apiAuth } from '@/app/helpers/apiAuth';
import { extractFields } from '@/app/helpers/extractFields';
import { invalid_response } from '@/app/helpers/invalid_response';
import { isNull } from '@/app/helpers/isNull';
import { getBrandInfo } from '@/app/api/brand/brand';
import { fetchDataWithConditions, fetchPaginatedData } from '@/app/api/database/mongodb';
import { rateLimitMiddleware } from '@/middleware/rate_limit';

// Configurations
const CONFIG = {
  csrfIgnoredRoutes: ['users'],
  protectedTables: ['users'],
  allowedTables: ['users'],
};

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      tenant: string;
      table: string;
      id: string;
      action: string;
    }>;
  },
): Promise<any> {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    const nextResponse = NextResponse.next();
    const { csrfToken, apiKey, apiSecret } = await extractFields(request);
    const { table, id } = await context.params;
    const { conditions } = await extractFields(request);

    // Validate required parameters
    if (isNull(table)) return invalid_response('No table provided', 400);
    if (isNull(id) && isNull(conditions))
      return invalid_response('ID or Conditions must be provided', 400);

    // Site info validation
    const siteInfo = await getBrandInfo(context);
    if (isNull(siteInfo)) return invalid_response('Site not on our network', 404);

    // Handle CSRF or bypass for ignored routes
    const response = await handleRequest(request, await context.params, siteInfo);

    return response || invalid_response('Response not generated', 500);
  } catch (error) {
    console.error('Unexpected error in PUT handler:', error);
    return invalid_response('Internal Server Error', 500);
  }
}

// Main logic for handling the request
async function handleRequest(
  request: NextRequest,
  params: { table: string; tenant: string; id: string },
  siteInfo: BrandType,
): Promise<any> {
  const { table, id } = params;
  const { apiKey, apiSecret } = await extractFields(request);
  const { conditions } = await extractFields(request);

  // Authentication and authorization
  const auth = await apiAuth({ apiKey: apiKey!, apiSecret: apiSecret! });
  if (!auth.isAuthenticated && !auth.isAdmin && CONFIG.protectedTables.includes(table)) {
    return invalid_response('Authentication failed', 403);
  }

  let final_conditions = conditions;
  let result = null;

  if (!isNull(id)) {
    final_conditions = { $or: [{ id }, { slug: id }, { _id: id }] };
    [result] = await fetchDataWithConditions(table, final_conditions);
  } else {
    result = await fetchPaginatedData({
      collectionName: table,
      conditions: final_conditions,
    });
  }

  return api_response({
    status: !isNull(result),
    msg: 'fetched successfully',
    data: result,
  });
}
