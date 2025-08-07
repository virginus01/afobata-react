import { extractFields } from '@/app/helpers/extractFields';
import { get_form_data } from '@/app/helpers/get_form_data';
import { invalid_response } from '@/app/helpers/invalid_response';
import { response } from '@/app/helpers/response';
import { verifyAccessToken } from '@/app/helpers/verifyAccessToken';
import { api_response } from '@/app/helpers/api_response';
import { httpStatusCodes } from '@/app/helpers/status_codes';
import { NextRequest, NextResponse } from 'next/server';
import { authenticationIgnore, trustIgnore } from '@/app/src/constants';
import { isNull } from '@/app/helpers/isNull';

interface ParamsProps {
  endpoint: string;
  tenant?: string;
}

// Lazy imports - only import what's needed when needed
const apiModules = {
  aws: () => import('@/app/api/aws/aws_upload'),
  cron: () => import('@/app/api/node_lib/cron'),
  build: () => import('@/app/api/mobile/gen'),
};

const handleRequest = async (request: NextRequest, context: { params: Promise<ParamsProps> }) => {
  let params: any = await context.params;
  let body: any = {};
  let _files: any = null;

  const endpoint = params.endpoint;
  const tenantId = params.tenant;

  try {
    if (!endpoint) throw new Error('No endpoint received');

    params = await extractFields(request);

    if (request.method !== 'GET') {
      const { files, fields } = await get_form_data(request);
      body = fields;
      _files = files;
    }

    const siteApiSecret = request.headers.get('x-trust-code');
    if (process.env.NODE_ENV !== 'development' && !trustIgnore.includes(endpoint)) {
      if (isNull(siteApiSecret) || siteApiSecret !== process.env.NEXT_PUBLIC_TRUST_CODE) {
        return invalid_response('Not permitted to do this', 500);
      }
    }

    if (!authenticationIgnore.includes(endpoint) && process.env.NODE_ENV !== 'development') {
      const accessToken = await verifyAccessToken({ request });
      if (!accessToken.status) {
        return api_response({
          data: {},
          msg: accessToken.msg,
          status: false,
          code: 'not-authenticated',
        });
      }
    }

    switch (endpoint) {
      case 'api_trigger_build': {
        const { server_trigger_build } = await apiModules.build();
        return await server_trigger_build({ formData: body });
      }

      case 'api_upload_file': {
        const { uploadToAws } = await apiModules.aws();
        return await uploadToAws(body, _files, {});
      }

      case 'run_cron_job': {
        const { server_run_cron_job } = await apiModules.cron();
        return await server_run_cron_job(params.target!);
      }

      default:
        return response({
          msg: 'No valid route',
          statusCode: httpStatusCodes[200],
          data: {},
        });
    }
  } catch (err: any) {
    return invalid_response(err.message || 'Unknown server error', 500);
  }
};

// Route handlers
export async function GET(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: any) {
  return await handleRequest(request, context);
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

// case 'api_upload_fine_tune_ai_data': {
//   const { server_upload_fine_tune_ai_data } = await apiModules.ai();
//   return await server_upload_fine_tune_ai_data({ body });
// }

// case 'api_fine_tune': {
//   const { server_fine_tune } = await apiModules.ai();
//   return await server_fine_tune({ body });
// }
