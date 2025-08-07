import { modHeaders } from '@/app/helpers/modHeaders';
import { api_create_order } from '@/app/routes/api_routes';

export async function createOrder(
  checkOutData?: CheckOutDataType,
  siteInfo?: BrandType,
): Promise<boolean> {
  if (!checkOutData) {
    console.error('checkOutData is required');
    return false;
  }

  try {
    const url = await api_create_order({ subBase: siteInfo?.slug });

    const formData = {
      ...checkOutData,
      status: 'pending',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: await modHeaders('post'),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.error('Error posting order');
      return false;
    }

    const res = await response.json();

    return res;
  } catch (error) {
    console.error('Failed to create order:', error);
    return false;
  }
}
