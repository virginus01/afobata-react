import { extractFields } from '@/app/helpers/extractFields';
import { get_form_data } from '@/app/helpers/get_form_data';
import { response } from '@/app/helpers/response';

import { isNull } from '@/app/helpers/isNull';
import { httpStatusCodes } from '@/app/helpers/status_codes';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface paramsProps {
  endpoint: string;
  cluster: string;
  table: string;
  conditions?: any;
  sortOptions?: any;
}

interface dependenciesProps {
  url: string;
  endpoint: string;
  body?: any;
}

const apiModules = {
  mongodb: () => import('@/app/api/[tenant]/node/_mongodb'),
};

const handleRequest = async (
  request?: NextRequest,
  context?: {
    params: Promise<paramsProps>;
  },
  dependencies?: dependenciesProps,
) => {
  let params = await context?.params!;
  let body: any = {};
  const resultPaths = extractPath(dependencies?.endpoint ?? '');

  let depData: Partial<paramsProps> = {
    endpoint: resultPaths?.endpoint ?? '',
    cluster: resultPaths?.cluster ?? '',
    table: resultPaths?.table ?? '',
  };

  if (isNull(dependencies)) {
    const siteSecret = request?.headers?.get('SITE-SECRET') || '';

    if (siteSecret !== process.env.SITE_SECRET) {
      return response({
        statusCode: httpStatusCodes[500],
        msg: 'not authenticated',
        status: false,
        data: {},
      });
    }
  }

  if (!isNull(dependencies?.body)) {
    body = dependencies?.body ?? {};
  } else if (request && request?.method !== 'GET') {
    const { files, fields } = await get_form_data(request ?? (null as any));
    body = fields;
  }

  const { conditions, sortOptions, tables, limit, page } = await extractFields(
    request ?? (null as any),
    (dependencies as any)?.url,
  );

  params = {
    ...params,
    ...(depData && { ...depData }),
    ...(conditions && { conditions: conditions ?? body.conditions ?? {} }),
    ...(sortOptions && { sortOptions: sortOptions ?? body.sortOptions ?? {} }),
  };

  let table = params.table;

  try {
    switch (params.endpoint) {
      case 'fetch':
        const fetchdb = await apiModules.mongodb();
        return await fetchdb._fetchDataWithConditions(
          params.table,
          params.conditions,
          params.sortOptions,
        );

      case 'fetch-multiple-paginated':
        const fetchdbM = await apiModules.mongodb();
        return await fetchdbM._fetchMultiplePaginatedData({
          collectionNames: tables as any,
          conditions,
          sortOptions,
          limit,
          page,
        });

      case 'fetch-paginated':
        const fetchpg = await apiModules.mongodb();
        return await fetchpg._fetchDataWithConditions(table, conditions, sortOptions);

      case 'update':
        const update = await apiModules.mongodb();
        return await update._updateDataWithConditions(
          table,
          body?.conditions,
          body?.data,
          body.personalize,
        );

      case 'remove-field':
        const removeF = await apiModules.mongodb();
        return await removeF._removeKey({ key: body.key, table });

      case 'delete':
        const deleteI = await apiModules.mongodb();
        return await deleteI._deleteDataWithConditions({
          collectionName: table,
          conditions: body.conditions,
        });

      case 'upsert':
        const upsert = await apiModules.mongodb();
        return await upsert._upsert(body.data, table, body.upsert, {});

      case 'bulk-upsert':
        const bulkUpsert = await apiModules.mongodb();
        return await bulkUpsert._bulkUpsert(body.data, table, body.upsert, {});

      default:
        return response({ msg: 'no valid route', statusCode: httpStatusCodes[404] });
    }
  } catch (error) {
    return response({
      statusCode: httpStatusCodes[500],
      msg: 'internal server error',
      status: false,
      data: {},
    });
  }
};

export async function handleInternalRequest(dependencies: dependenciesProps) {
  try {
    const data = await handleRequest(null as any, null as any, dependencies);
    return response({ msg: 'successful', status: true, ...data });
  } catch (error) {
    return response({
      statusCode: httpStatusCodes[500],
      msg: 'internal server error',
      status: false,
      data: {},
    });
  }
}

// Handlers
export async function GET(request: NextRequest, context: any) {
  try {
    const data = await handleRequest(request, context);
    return response({ msg: 'successful', status: true, ...data });
  } catch (error) {
    return response({
      statusCode: httpStatusCodes[500],
      msg: 'internal server error',
      status: false,
      data: {},
    });
  }
}

export async function POST(request: NextRequest, context: any) {
  try {
    const data = await handleRequest(request, context);
    return response({ msg: 'successful', status: true, ...data });
  } catch (error) {
    return response({
      statusCode: httpStatusCodes[500],
      msg: 'internal server error',
      status: false,
      data: {},
    });
  }
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const data = await handleRequest(request, context);
    return response({ msg: 'successful', status: true, ...data });
  } catch (error) {
    return response({
      statusCode: httpStatusCodes[500],
      msg: 'internal server error',
      status: false,
      data: {},
    });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    const data = await handleRequest(request, context);
    return response({ msg: 'successful', status: true, ...data });
  } catch (error) {
    return response({
      statusCode: httpStatusCodes[500],
      msg: 'internal server error',
      status: false,
      data: {},
    });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const data = await handleRequest(request, context);
    return response({ msg: 'successful', status: true, ...data });
  } catch (error) {
    return response({
      statusCode: httpStatusCodes[500],
      msg: 'internal server error',
      status: false,
      data: {},
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function extractPath(path: string): {
  endpoint: string;
  cluster: string;
  table: string;
  searchParams?: string;
} | null {
  const regex = /^\/([^/]+)\/([^/]+)\/([^?]+)(?:\?(.*))?$/;
  const match = path.match(regex);

  if (!match) return null;

  const [, endpoint, cluster, table, query] = match;

  return query ? { endpoint, cluster, table, searchParams: query } : { endpoint, cluster, table };
}
