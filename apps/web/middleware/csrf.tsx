import { invalid_response } from '@/app/helpers/invalid_response';
import { NextRequest, NextResponse } from 'next/server';
import csrf from 'csrf';

const tokens = new csrf();
const secret = process.env.SITE_SECRET || tokens.secretSync();

export async function cookieParser(
  request: NextRequest,
  response: NextResponse,
  next: () => Promise<NextResponse>,
): Promise<NextResponse> {
  return next();
}

export async function csrfProtection(
  request: NextRequest,
  response: NextResponse,
  next: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const csrfToken = request.cookies.get('CSRF-Token')?.value;
  const requestCsrfToken = request.headers.get('CSRF-Token');

  if (!tokens.verify(secret, requestCsrfToken ?? '')) {
    console.info(`${csrfToken}  ==== ${requestCsrfToken}`);
    return invalid_response('CSRF token not valid try again', 500) as any;
  }

  return next();
}
