import { invalid_response } from '@/app/helpers/invalid_response';
import { initializeCBK, sendCBKReq } from '@/api/thirdparty/clubkonnect/clubkonnet';

export async function cbk_query_order(order: OrderType) {
  const cbk_userId = process.env.CLUBK_USERID;
  const cbk_secret = process.env.CLUBK_SECRET;

  if (!cbk_userId || !cbk_secret) {
    return invalid_response('CLUBK_USERID or CLUBK_SECRET environment variable is not set.');
  }

  const url = `${await initializeCBK({
    route: 'APIQuery.asp',
  })}&OrderID=${order.fulfillId}`;

  try {
    return sendCBKReq({ url: url, order: order });
  } catch (error) {
    console.error('Failed to query order status:', error);
    return invalid_response('Error querying order status. Please try again later.');
  }
}
