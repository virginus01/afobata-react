import { NextRequest } from 'next/server';
import { verifyJWT } from '@/app/helpers/verifyJWT';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { show_error } from '@/app/helpers/show_error';
import { isNull } from '@/app/helpers/isNull';

export async function verifyAccessToken({ request }: { request: NextRequest }) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return { status: false, msg: 'no valid authorization provided', data: {} };
    }
    const token = authHeader.substring(7).trim();
    if (!token || token.split('.').length !== 3) {
      return { status: false, msg: 'malformed token', data: {} };
    }
    const secret = process.env.NEXTAUTH_SECRET;

    if (isNull(secret)) {
      console.error('❌ NEXTAUTH_SECRET is not set');
      return { status: false, msg: 'server error', data: {} };
    }

    const decoded: any = await verifyJWT(token);
    const session = await getAuthSessionData();

    if (isNull(decoded) || isNull(session)) {
      return { status: false, msg: 'token or session not found', data: {} };
    }

    if (decoded.userId !== session.userId) {
      return { status: false, msg: 'user mismatch', data: {} };
    }

    if (isNull(session?.accessToken)) {
      return { status: false, msg: 'no session found', data: {} };
    } else if (session.accessToken !== token) {
      return { status: false, msg: 'incorrect token', data: {} };
    }

    return { status: true, msg: 'verified', data: session };
  } catch (err: any) {
    show_error('error at verify accessToken', err);
    return { status: false, msg: 'error at verify accessToken', data: {} };
  }
}
