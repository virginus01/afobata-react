import { invalid_response } from '@/app/helpers/invalid_response';
import { NextRequest, NextResponse } from 'next/server';

export async function withApiSiteProtection(
  request: NextRequest,
  response: NextResponse,
  next: () => Promise<NextResponse>,
): Promise<any> {
  try {
    const SITE_API_KEY = String(process.env.API_SECRET_KEY);
    const SITE_API_SECRET = String(process.env.API_SECRET);

    const apiKey =
      request.headers.get('site-api-key') || request.nextUrl.searchParams.get('site_api_key');
    const apiSecret =
      request.headers.get('site-api-secret') || request.nextUrl.searchParams.get('site_api_secret');

    const fullUrl = request.url;

    if (!apiKey || !apiSecret) {
      return invalid_response(`Site API key or secret missing at `, 401);
    }

    if (SITE_API_KEY !== apiKey && SITE_API_SECRET !== apiSecret) {
      return invalid_response(`Invalid Site Api Key at`, 401);
    }

    return await next();
  } catch (error) {
    const fullUrl = request.url;

    return invalid_response(`Internal Server error `, 500);
  }
}
