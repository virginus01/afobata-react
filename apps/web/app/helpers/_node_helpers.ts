'use server';
import { NextRequest } from 'next/server';
import CryptoJS from 'crypto-js';
import formidable, { File } from 'formidable';
import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import jwt from 'jsonwebtoken';
import { apiAuth } from '@/app/helpers/apiAuth';
import { extractFields } from '@/app/helpers/extractFields';
import { getAuthSessionData } from '@/app/controller/auth_controller';

export async function verifyAccessToken({
  userId,
  request,
}: {
  userId?: string;
  request: NextRequest;
}) {
  // Step 1: Try API Key Authentication

  let apiVerify: any = { status: false, user: {} };

  const { apiKey, apiSecret } = await extractFields(request);

  // Step 2: Fallback to JWT Authentication
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
    if (!secret) {
      console.error('❌ NEXTAUTH_SECRET is not set');
      return { status: false, msg: 'server error', data: {} };
    }

    const decoded: any = jwt.verify(token, secret);

    // Optionally: verify additional claims
    // if (decoded.iss !== 'your-app') return { status: false, msg: "invalid issuer", data: {} };

    if (userId && decoded.userId !== userId) {
      return { status: false, msg: 'user mismatch', data: {} };
    }

    // Optionally: verify against session if needed
    const session = await getAuthSessionData();
    if (session?.accessToken && session.accessToken !== token) {
      return { status: false, msg: 'incorrect token', data: {} };
    }

    return { status: true, msg: 'verified', data: decoded };
  } catch (err: any) {
    try {
      apiVerify = await apiAuth({
        apiKey: apiKey || '',
        apiSecret: apiSecret || '',
      });

      if (apiVerify?.status) {
        if (userId && userId !== apiVerify.user?.id) {
          return { status: false, msg: 'api user mismatch', data: {} };
        }
        return { status: true, msg: 'verified', data: apiVerify.user };
      }
    } catch (e: any) {
      console.warn('API auth check failed:', e.message);
    }

    const msg = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid token';

    console.error(`🔐 Auth error: ${msg}`, err?.message);
    return { status: false, msg, data: {}, code: 'session_expired' };
  }
}

export async function get_form_data(req: NextRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      allowEmptyFiles: false,
    });

    // Convert NextRequest's body into a readable stream for formidable
    const contentType = req.headers.get('content-type') || '';
    const contentLength = req.headers.get('content-length') || '';

    const body = req.body;

    if (!body) {
      reject({ fields: {}, files: {} });
      return;
    }

    const stream = Readable.from(body as any);

    const incoming = Object.assign(stream, {
      headers: {
        'content-type': contentType,
        'content-length': contentLength,
      },
      method: req.method,
      url: req.url,
    }) as IncomingMessage;

    form.parse(incoming, (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        reject({ fields: {}, files: {} });
      } else {
        // Check if files exists and has content
        if (!files || Object.keys(files).length === 0) {
          console.warn('No files found in request');
        }
        resolve({ fields, files });
      }
    });
  });
}

export async function decrypt(ciphertext: string) {
  if (!ciphertext || typeof ciphertext !== 'string') {
    // console.error("Invalid ciphertext");
    return ciphertext;
  }

  const SECRET_PASSPHRASE = process.env.SECRET_PASSPHRASE as string;

  try {
    // Expect format: iv:ciphertext
    const [ivHex, encryptedHex] = ciphertext.split(':');

    if (!ivHex || !encryptedHex) {
      console.error('Invalid format for encrypted text');
      return ciphertext;
    }

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);

    const encryptedBase64 = CryptoJS.enc.Base64.stringify(encrypted);

    const decrypted = CryptoJS.AES.decrypt(
      encryptedBase64,
      CryptoJS.enc.Utf8.parse(SECRET_PASSPHRASE),
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // If it's JSON, try to parse it
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (err) {
    console.error('Decryption failed:', err);
    return ciphertext; // fallback if decryption fails
  }
}
