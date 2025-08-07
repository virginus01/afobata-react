import { fetchData, upsert } from '@/app/api/database/mongodb';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

export async function get_info() {
  try {
    const res: any = [];
    return api_response(res, res[0]);
  } catch (error) {
    return api_response({});
  }
}

export async function update_info(formData: any) {
  try {
    const data: any = {
      id: formData.id,
      name: formData.name,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      logo: String(formData.logo),
      footer_code: formData.footer_code,
      header_code: formData.header_code,
    };

    const response = await upsert(data, 'info', true, {});

    return api_response(response);
  } catch (error) {
    return api_response({});
  }
}

export async function get_keys(keyType: string) {
  try {
    let res: any = {};

    if (keyType == 'paystack') {
      const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

      res.status = true;
      res.success = true;
      res.msg = 'secure';
      res.data = {
        apiKey: PAYSTACK_PUBLIC_KEY,
        apiSkey: PAYSTACK_SECRET_KEY,
      };
    }

    if (keyType == 'site') {
      const SITE_API_KEY = String(process.env.API_SECRET_KEY);
      const SITE_API_SECRET = String(process.env.API_SECRET);

      const encryptedData: any = '';

      const data = await encryptedData.json();

      res.status = true;
      res.success = true;
      res.msg = 'encrypted site keys';
      res.code = 'ok';
      res.data = data.data;
    }

    return api_response(res);
  } catch (error) {
    console.error(`error geting keys ${error}`);
    return api_response({ msg: error });
  }
}

export async function server_get_ip_info(ip: string) {
  try {
    const IPINFO_TOKEN = String(process.env.IPINFO_TOKEN) || '';

    const url = `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      return invalid_response('network not okay on ip fetch', 200);
    }

    const res = await response.json();

    if (res.ip) {
      return api_response({ data: res, status: true, success: true });
    } else {
      return invalid_response('no ip data fectched', 200);
    }
  } catch (error) {
    console.error(`error geting ip ${error}`);
    return invalid_response('error geting ip', 200);
  }
}
