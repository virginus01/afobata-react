import {
  checkCBKBalance,
  initializeCBK,
  sendCBKReq,
} from '@/api/thirdparty/clubkonnect/clubkonnet';

export async function cbk_fulFill_tv_order(product: ProductTypes, order: OrderType) {
  const companyData: any = product.others.cbkProviderData;
  const productData: any = product.others.cbkProductData;

  const url = `${await initializeCBK({
    route: 'APIBuyCableTV.asp',
  })}&CableTV=${companyData.ID}&Package=${productData.PACKAGE_ID}&SmartCardNo=${order.customerId}`;

  const status = order.status;

  if (status !== 'paid' || order.fulfillId) {
    return { status: order.status };
  }

  const b = await checkCBKBalance();
  if (parseFloat(String(order.amount)) > b) {
    console.error('INSUFFICIENT CBK BALANCE');
    return { status };
  }

  try {
    return sendCBKReq({ url: url, order: order });
  } catch (error) {
    console.error(`Failed to fulfill ${order.type} order:`, error);
    return false;
  }
}
