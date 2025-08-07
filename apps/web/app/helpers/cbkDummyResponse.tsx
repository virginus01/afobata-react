import { randomNumber } from '@/app/helpers/randomNumber';

export const cbkDummyResponse = (status: any) => {
  let finalStatus = 'ORDER_COMPLETED';
  if (status === 'ORDER_RECEIVED') {
    finalStatus = 'ORDER_RECEIVED';
  }
  return {
    date: '18th-Oct-2016',
    orderid: randomNumber(10),
    statuscode: '300',
    status: finalStatus,
    balance: 300000,
    meterToken: '8577575757',
    remark: 'Success',
    amount: '950',
  };
};
