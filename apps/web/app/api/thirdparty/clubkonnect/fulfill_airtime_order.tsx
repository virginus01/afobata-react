import {
  checkCBKBalance,
  initializeCBK,
  sendCBKReq,
} from '@/api/thirdparty/clubkonnect/clubkonnet';

export async function cbk_fulFill_airtime_order(product: ProductTypes, order: OrderType) {
  const companyData: any = product.others.cbkProviderData;

  const url = `${await initializeCBK({
    route: 'APIBuyAirTime.asp',
  })}&MobileNetwork=${companyData.ID}&Amount=${order.orderValue}&MobileNumber=${order.customerId}`;

  const status = order.status;

  if (status !== 'paid' || order.fulfillId) {
    return { status: order.status };
  }

  const b = await checkCBKBalance();

  if (parseFloat(String(order.amount)) > b) {
    console.error('INSUFFICIENT CBK BALANCE: ', b, '. Order: ', order.amount);
    return { status };
  }

  try {
    return sendCBKReq({ url: url, order: order });
  } catch (error) {
    console.error(`Failed to fulfill ${order.type} order:`, error);
    return false;
  }
}
