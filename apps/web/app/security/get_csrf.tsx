import { NextResponse } from 'next/server';
//import csrf from "csrf";
import { random_code } from '@/app/helpers/random_code';

// const tokens = new csrf();
const secret = process.env.SITE_SECRET; // tokens.secretSync();

export default async function server_get_csrf() {
  const token = random_code(20);

  // Create a JSON response with the token in the body
  const response = NextResponse.json({ csrfToken: token });

  // Set the CSRF cookie to be accessible by JavaScript
  response.cookies.set('CSRF-Token', token, {
    httpOnly: false, // ✅ Allows JavaScript to access it via document.cookie
    secure: process.env.NODE_ENV === 'development' ? false : true, // ✅ HTTPS-only in production
    sameSite: 'strict', // ✅ Prevents cross-origin requests
    path: '/', // ✅ Cookie available throughout the site
    maxAge: 60 * 60, // ✅ Optional: expires in 1 hour
  });

  return response;
}
