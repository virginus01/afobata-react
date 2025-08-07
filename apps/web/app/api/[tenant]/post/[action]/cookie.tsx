import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { NextResponse } from 'next/server';

export async function server_set_cookie({ formData }: { formData: any }) {
  // Validate input
  if (!formData || !formData.key || !formData.data) {
    return invalid_response('Some field missing during set cookie');
  }

  try {
    const cookieValue = formData.data;

    const response = NextResponse.json(
      { success: true, message: 'Cookie set successfully' },
      { status: 200 },
    );

    response.cookies.set(formData.key, cookieValue, {
      maxAge: formData.age || 3600,
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
    });

    return api_response({
      data: formData.data,
      status: true,
      message: 'Cookie set successfully',
    });
  } catch (error: any) {
    console.error('Error during set cookie on server:', error);
    return invalid_response('Failed to set cookie', error);
  }
}
