import { NextResponse } from 'next/server';
import { httpStatusCodes } from '@/app/helpers/status_codes';

export async function response({
  msg = 'Successful',
  statusCode = httpStatusCodes[200],
  status = true,
  data = {},
  error,
  code,
  meta,
  renderData,
  pageEssentials,
  cookie,
  cacheControl,
  skipCSRF = false,
  skipCookies = false,
}: {
  msg?: string;
  statusCode?: any;
  status?: boolean;
  data?: any;
  meta?: any;
  error?: any;
  code?: any;
  renderData?: any;
  pageEssentials?: any;
  cookie?: {
    name: string;
    value: string | object;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: string;
    maxAge?: number;
  };
  cacheControl?: string;
  skipCSRF?: boolean;
  skipCookies?: boolean;
}) {
  let res: NextResponse;
  let csrfToken: string | undefined;
  try {
    const { random_code } = await import('@/app/helpers/random_code');
    const shouldGenerateCSRF = !skipCSRF && !cacheControl;
    csrfToken = shouldGenerateCSRF ? random_code(20) : undefined;
    const responseBody = {
      success: status,
      status,
      data,
      meta,
      msg: msg || 'unknown error',
      statusCode: statusCode.code,
      statusDescription: statusCode.description,
      category: statusCode.category,
      code,
      renderData: renderData ?? {},
      pageEssentials: pageEssentials ?? {},
      ...(csrfToken && { csrfToken }),
    };
    if (!status || statusCode.code !== 200) {
      const { show_error } = await import('@/app/helpers/show_error');
      show_error(msg, msg);
    }
    res = NextResponse.json(responseBody, { status: statusCode.code });
    if (cacheControl && status && statusCode.code === 200) {
      res.headers.set('Cache-Control', cacheControl);
      res.headers.set('Vary', 'Accept-Encoding');
      if (data && Object.keys(data).length > 0) {
        const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`;
        res.headers.set('ETag', etag);
      }
    }
    if (!skipCookies && cookie) {
      const {
        name,
        value,
        path = '/',
        httpOnly = false,
        secure = false,
        sameSite = 'lax',
        maxAge,
      } = cookie;
      res.cookies.set(name, typeof value === 'object' ? JSON.stringify(value) : String(value), {
        httpOnly,
        secure,
        sameSite: (sameSite as string).toLowerCase() as 'lax' | 'strict' | 'none',
        maxAge,
        path,
      });
    }
    if (!skipCookies && csrfToken && !cacheControl) {
      res.cookies.set('CSRF-Token', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
      });
    }
  } catch (error) {
    throw error;
  }
  return res;
}
