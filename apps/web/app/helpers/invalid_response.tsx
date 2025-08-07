'use server';
import { headers } from 'next/headers';
import { random_code } from '@/app/helpers/random_code';
import { show_error } from '@/app/helpers/show_error';

export async function invalid_response(
  msg?: string,
  status = 400,
  statusCode = {},
): Promise<Response> {
  const headersList = await headers();
  const requestUrl = headersList.get('x-url') || '';

  if (status === 400) {
    console.error('\x1b[31m%s\x1b[0m', `${msg} at ${requestUrl}` || 'unknown error');
    throw new Error(msg || 'unknown error');
  } else if (!status || statusCode !== 200) {
    show_error(msg ?? '', msg);
  }

  try {
    const token = random_code(20);

    const response = new Response(
      JSON.stringify({
        success: false,
        status: false,
        msg: msg || 'unknown error',
        csrfToken: token, // Optional: send it in body too
      }),
      {
        status,
        headers: {
          'Set-Cookie': `CSRF-Token=${token}; Path=/; SameSite=Strict; Secure=${process.env.NODE_ENV !== 'development'}; HttpOnly=false; Max-Age=3600`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response;
  } catch (error) {
    console.error('Failed to generate invalid response:', error);
    return new Response(
      JSON.stringify({
        success: false,
        status: false,
        msg: 'internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
