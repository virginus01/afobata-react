import {
  checkCBKBalance,
  initializeCBK,
  sendCBKReq,
} from '@/api/thirdparty/clubkonnect/clubkonnet';

export async function cbk_fulFill_electric_order(product: ProductTypes, order: OrderType) {
  const cbk_userId = process.env.CLUBK_USERID;
  const cbk_secret = process.env.CLUBK_SECRET;

  if (!cbk_userId || !cbk_secret) {
    throw Error('CLUBK_USERID or CLUBK_SECRET environment variable is not set.');
  }

  const companyData: any = product.others.cbkProviderData;
  const productData: any = product.others.cbkProductData;

  const url = `${await initializeCBK({
    route: 'APIBuyElectricity.asp',
  })}&ElectricCompany=${companyData.ID}&MeterType=${productData.PRODUCT_ID}&MeterNo=${
    order.customerId
  }&Amount=${order.orderValue}`;

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
