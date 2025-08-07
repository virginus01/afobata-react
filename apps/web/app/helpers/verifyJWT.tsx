'use server';

export async function verifyJWT(token: string): Promise<any> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!token || !secret) {
      console.error('Token or Secret not found');
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Base64url decode
    const base64UrlDecode = (str: string) => {
      // Add padding if needed
      const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
      // Replace URL-safe characters
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      return atob(base64);
    };

    const header = JSON.parse(base64UrlDecode(headerB64));
    const payload = JSON.parse(base64UrlDecode(payloadB64));

    // Verify signature
    const data = `${headerB64}.${payloadB64}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    // Convert base64url signature to ArrayBuffer
    const signatureBytes = Uint8Array.from(
      atob(
        signatureB64.replace(/-/g, '+').replace(/_/g, '/') +
          '='.repeat((4 - (signatureB64.length % 4)) % 4),
      ),
      (c) => c.charCodeAt(0),
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(data));

    if (!isValid) {
      console.error('Invalid signature');
      return null;
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      const error = new Error('Token expired');
      (error as any).name = 'TokenExpiredError';
      return null;
    }

    return payload;
  } catch (error) {
    throw error;
  }
}
