'use server';

import { api_update_views } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';

export async function updateCashViews({
  siteInfo,
  data,
}: {
  siteInfo: BrandType;
  data: DataType;
}): Promise<boolean> {
  try {
    const ipInfo = '';
    const visitorInfo = JSON.parse(ipInfo || '{}');

    const url = await api_update_views({ subBase: siteInfo.slug! });

    const dataBody = {
      brandId: siteInfo.id,
      parentBrandId: data.parentBrandData?.id!,
      brandOwnerId: siteInfo?.ownerData?.id!,
      path: data.slug,
      type: data.dataType,
      ipInfo: visitorInfo,
    };

    const sendRequest = await fetch(url, {
      method: 'POST',
      headers: await modHeaders(),
      body: JSON.stringify(dataBody),
    });

    const response = await sendRequest.json();

    return true;
  } catch (error) {
    console.error('Error updating views:', error);
    return false;
  }
}
