export async function getSiteKeys() {
  const SITE_API_KEY = String(process.env.API_SECRET_KEY);
  const SITE_API_SECRET = String(process.env.API_SECRET);
  const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
  const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;
  const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
  const data = {
    site_api_key: SITE_API_KEY,
    site_api_secret: SITE_API_SECRET,
    paystack: PAYSTACK_PUBLIC_KEY,
    paystackSecret: PAYSTACK_SECRET_KEY,
    flutterwavePublic: FLUTTERWAVE_PUBLIC_KEY,
    flutterwaveSecret: FLUTTERWAVE_SECRET_KEY,
    vercelToken: VERCEL_TOKEN,
    amplifyAppId: '',
    awsToken: '',
  };
  return data;
}
