import { TextEncoder } from 'util';

export async function createJWT(
  payload: any,
  secret: string,
  expiresIn: string = '24h',
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // Convert expiration to seconds
  const expiration = expiresIn === '24h' ? 24 * 60 * 60 : parseInt(expiresIn);
  const now = Math.floor(Date.now() / 1000);

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiration,
  };

  // Base64url encode
  const base64UrlEncode = (obj: any) => {
    return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(jwtPayload);

  const data = `${encodedHeader}.${encodedPayload}`;

  // Create signature using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${data}.${encodedSignature}`;
}
