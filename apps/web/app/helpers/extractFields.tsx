import { NextRequest } from 'next/server';

export async function extractFields(request: NextRequest, url?: string): Promise<ApiFields> {
  try {
    const { isNull } = await import('@/app/helpers/isNull');
    const { searchParams } = new URL(
      !isNull(request?.url) ? request?.url : (url ?? 'https://localhost:3000'),
    );

    const getParam = (key: string, fallback: string = '') => searchParams.get(key) ?? fallback;

    const data: ApiFields = {
      id: getParam('id'),
      uid: getParam('uid'),
      spId: getParam('spId'),
      slug: getParam('slug'),
      prompt: getParam('prompt'),
      branchId: getParam('branchId'),
      currency: getParam('currency'),
      table: getParam('table'),
      orderid: getParam('orderid'),
      parentId: getParam('parentId'),
      mbi: getParam('mbi'),
      duration: getParam('duration'),
      ignore_brand_add: getParam('ignore_brand_add'),
      user_id: getParam('user_id') || getParam('userId'),
      keyType: getParam('keyType'),
      type: getParam('type'),
      source: getParam('source'),
      tag: getParam('tag'),
      ref: getParam('ref'),
      target: getParam('target'),
      status: getParam('status'),
      crypto: getParam('crypto'),
      brandId: getParam('brandId'),
      dataType: getParam('dataType'),
      s: getParam('s'),
      page: getParam('page', '1'),
      limit: getParam('limit', '10'),
      address: getParam('wallet_address'),
      identifier: getParam('identifier', 'main'),
      isDefault: getParam('isDefault', 'false'),

      siteApiKey: request?.headers?.get('site-api-key') ?? undefined,
      siteApiSecret: request?.headers?.get('x-trust-code') ?? undefined,
      csrfToken: request?.headers?.get('csrf-token') ?? undefined,

      apiKey: request?.headers?.get('x-api-key') ?? getParam('api_key'),
      apiSecret: request?.headers?.get('x-api-secret') ?? getParam('api_secret'),
      fullUrl: request?.url,

      conditions: (() => {
        try {
          const raw = getParam('cds', '{}');

          return JSON.parse(decodeURIComponent(raw));
        } catch {
          return {};
        }
      })(),

      sortOptions: (() => {
        try {
          const raw = getParam('sort', '{}');

          return JSON.parse(decodeURIComponent(raw));
        } catch {
          return {};
        }
      })(),

      tables: (() => {
        const raw = getParam('tables');
        return raw ? raw.split(',') : [];
      })(),
    };

    return data;
  } catch (error) {
    console.error('extractFields error:', error);
    return {} as ApiFields;
  }
}
