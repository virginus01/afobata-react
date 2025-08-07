import { api_response } from '@/helpers/api_response';
import { geolocation } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

export async function server_get_geo(request: NextRequest) {
  const geoData = await geo(request);
  return api_response({ data: geoData.data, status: true });
}

export async function geo(request: NextRequest) {
  const geo: any = geolocation(request) ?? {};

  const data = {
    ip: geo.geo || '127.0.0.1',
    city: geo.city || 'Lagos',
    region: geo.region || 'Lagos',
    country: geo.country || 'NG',
    loc: '',
    org: '',
    latitude: geo.latitude || '',
    longitude: geo.longitude || '',
    flag: geo.flag,
    timezone: 'Africa/Lagos',
    source: 'server',
  };

  return { data, status: true };
}
