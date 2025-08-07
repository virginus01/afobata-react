import { random_code } from '@/app/helpers/random_code';

export async function api_response(res: any, res_data = null, statusCode = 200) {
  try {
    const csrfToken = random_code(20);
    let dMsg = res.status ? 'success' : 'unknown error';
    const success = res.success || res.status || false;
    const status = res.status || res.success || false;
    const msg = res.msg || dMsg;
    const code = res.code || 'ok';
    const data = res_data || res.data || {};
    const meta = res.meta || {};
    const responseBody = {
      success,
      status,
      data,
      meta,
      msg,
      code,
      renderData: res.renderData ?? {},
      pageEssentials: res.pageEssentials ?? {},
      csrfToken,
    };
    if (!status || statusCode !== 200) {
      const { show_error } = await import('@/app/helpers/show_error');
      show_error(msg, msg);
    }
    const response = new Response(JSON.stringify(responseBody, null, 2), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `CSRF-Token=${csrfToken}; Path=/; SameSite=Strict; Secure=${process.env.NODE_ENV !== 'development'}; HttpOnly=false`,
      },
    });
    return response;
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, data: {}, msg: 'unknown error', code: 'error' }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
