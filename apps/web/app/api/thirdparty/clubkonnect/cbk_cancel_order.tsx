import { Order } from '@/app/models/Order';
import { initializeCBK, sendCBKReq } from '@/api/thirdparty/clubkonnect/clubkonnet';

export async function cbk_cancel_order(order: Order) {
  const url = `${await initializeCBK({
    route: 'APICancelV1.asp',
  })}&OrderID=${order.fulfillId}`;

  try {
    return sendCBKReq({ url: url, order: order as any });
  } catch (error) {
    console.error(`Failed to cancel ${order.type} order:`, error);
    throw error;
  }
}
