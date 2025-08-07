import { NextRequest, NextResponse } from 'next/server';
import { cookieParser, csrfProtection } from '@/middleware/csrf';
import { isNull } from '@/app/helpers/isNull';
import { fetchDataWithConditions, upsert } from '@/app/api/database/mongodb';
import { get_form_data } from '@/app/helpers/get_form_data';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { getBrandInfo } from '@/app/api/brand/brand';
import { createAuth } from '@/app/api/auth/create';

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  try {
    const { params } = context;
    const nextResponse = NextResponse.next();
    const siteInfo: BrandType = await getBrandInfo(context);
    const action = (await context.params).action;

    if (isNull(siteInfo)) {
      return invalid_response('site not on our network');
    }

    const ignore = csrfIgnoredRotes.includes(action);

    if (ignore) {
      return await handleRequest(request, await params, siteInfo);
    } else {
      return await cookieParser(request, nextResponse, async () => {
        return await csrfProtection(request, nextResponse, async () => {
          return await handleRequest(request, await params, siteInfo);
        });
      });
    }
  } catch (error: any) {
    return await invalid_response(`Error: ${error.message}`, 500);
  }
}

async function handleRequest(
  request: NextRequest,
  { action }: { action: string },
  siteInfo: BrandType,
): Promise<any> {
  const { files, fields } = await get_form_data(request);
  if (!fields) return await invalid_response('Invalid content type');

  switch (action) {
    case 'signup':
      return await SignUp(fields, siteInfo);
    case 'logout':
      return await Logout(request);
    default:
      return await invalid_response('No action specified');
  }
}

export async function SignUp(formData: AuthModel, siteInfo: BrandType): Promise<any> {
  try {
    const [existingUser] = await fetchDataWithConditions('auth', { email: formData.email });
    if (!isNull(existingUser)) {
      return await api_response({
        msg: 'User already exists with this email',
        code: 'exist',
        success: false,
      });
    }

    const AuthData = await createAuth({ data: formData, siteInfo });

    return await api_response({
      msg: 'Account created successfully',
      code: 'success',
      success: true,
      data: AuthData,
    });
  } catch (error) {
    console.error(error);
    return invalid_response('Error creating account');
  }
}

async function Logout(request: NextRequest): Promise<any> {
  try {
    const session: any = {};

    session.auth = {};

    await session.save();

    // Destroy the session
    session.destroy();

    // Return a response using the api_response helper
    return await api_response({
      success: true,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return invalid_response('error destroying session');
  }
}

const csrfIgnoredRotes = ['logout'];
