export const initializeMBNIG = async ({ route }: { route: string }): Promise<string> => {
  const mbNig_userId = process.env.MBNIG_USERID || '';
  const mbNig_secret = process.env.MBNIG_SECRET || '';

  // Validate environment variables
  if (!mbNig_userId || !mbNig_secret) {
    console.error('Error: Missing MBNIG_USERID or MBNIG_SECRET');
    throw new Error('Invalid configuration: MBNIG_USERID and MBNIG_SECRET must be set.');
  }

  // Optional: if callback_url is meant to be used later
  // const callback_url = await baseUrl("api/a/get/callback");

  const baseCallbackUrl = `https://enterprise.mobilenig.com/api/v2/${route}`;
  const url = new URL(baseCallbackUrl);

  return url.toString();
};

export async function sendMBNIGReq({ url, body }: { url: string; body: any }): Promise<any> {
  const mbNig_userId = process.env.MBNIG_USERID || '';
  const mbNig_secret = process.env.MBNIG_SECRET || '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mbNig_secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('API error:', response.statusText);
      return {
        status: false,
        message: response.statusText,
      };
    }

    const res = await response.json();
    return res;
  } catch (error: any) {
    console.error('Network or parsing error:', error);
    return {
      status: false,
      message: error?.message || 'Unknown error',
    };
  }
}
