import { fetchDataWithConditions } from '@/app/api/database/mongodb';
import { invalid_response } from '@/app/helpers/invalid_response';

import { NextRequest, NextResponse } from 'next/server';

export async function withApiUserProtection(
  request: NextRequest,
  response: NextResponse,
  next: () => Promise<NextResponse>,
): Promise<any> {
  try {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');
    const apiSecret =
      request.headers.get('x-api-secret') || request.nextUrl.searchParams.get('api_secret');

    if (!apiKey || !apiSecret) {
      //  return invalid_response(`API key or secret missing`, 401);
    }

    const conditions = {
      api_key: apiKey,
      $or: [{ api_secret: apiSecret }, { api_secret: apiSecret }],
    };

    const response = await fetchDataWithConditions('users', conditions);
    const user = response[0];

    if (!user) {
      // return invalid_response(`Invalid Api Key`, 401);
    }

    return await next();
  } catch (error) {
    const fullUrl = request.url;

    return invalid_response(`Internal Server error`, 500);
  }
}
