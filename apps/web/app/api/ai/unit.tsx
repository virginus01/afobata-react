import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { isNull } from '@/app/helpers/isNull';
import { getBrandInfo } from '@/api/brand/brand';
import { fetchDataWithConditions, updateData } from '@/app/api/database/mongodb';
import BigNumber from 'bignumber.js';

export async function server_credit_and_debit_ai_units({ body }: { body?: any }) {
  try {
    if (isNull(body.type) || isNull(body.userId) || isNull(body.unit)) {
      return invalid_response('some data missing', 200);
    }
    let response: any = {};
    const res = await credit_and_debit_ai_units({
      type: body.type,
      userId: body.userId,
      value: body.unit,
    });

    if (res.status) {
      response.msg = res.msg;
      response.status = true;
      response.data = res.updatedValue;
    } else {
      response.msg = res.msg;
      response.status = false;
      response.data = res.updatedValue;
    }

    return api_response(response);
  } catch (error) {
    console.error(error);
    return invalid_response('error in unit operation');
  }
}

export async function credit_and_debit_ai_units({
  type,
  userId,
  value,
}: {
  type: 'credit' | 'debit';
  userId: string;
  value: number;
}) {
  if (!type || !userId || !value) {
    console.error('some data missing');
    return {
      msg: 'some data missing',
      status: false,
      updatedValue: 0,
    };
  }

  if (!['debit', 'credit'].includes(type)) {
    console.error('Invalid input parameters');
    return {
      msg: 'Invalid input parameters',
      status: false,
      updatedValue: 0,
    };
  }

  try {
    const siteInfo = await getBrandInfo();

    const [user]: UserTypes[] = await fetchDataWithConditions('users', { id: userId }, {}, true);

    if (!user) {
      console.error('user not found');
      return {
        msg: 'User not found',
        status: false,
        updatedValue: 0,
      };
    }

    const updateAmount = new BigNumber(value);
    const currentBalance = new BigNumber(user.ai_units || 0);

    if (updateAmount.isLessThanOrEqualTo(0)) {
      console.error('Invalid amount');
      return {
        msg: 'Invalid amount',
        status: false,
        updatedValue: 0,
      };
    }

    let updatedValue: BigNumber;

    if (type === 'credit') {
      // Credit calculation
      updatedValue = currentBalance.plus(updateAmount);
    } else {
      // Debit calculation
      if (updateAmount.isGreaterThan(currentBalance)) {
        return {
          msg: 'Insufficient Ai Unit',
          status: false,
          updatedValue: 0,
        };
      }
      updatedValue = currentBalance.minus(updateAmount);
    }

    const updatedWallet = {
      ai_units: updatedValue.toNumber(),
    };

    await updateData({ data: updatedWallet, table: 'users', id: userId ?? '', siteInfo });

    return {
      msg: 'unit debited',
      status: true,
      updatedValue: updatedValue.toNumber(),
    };
  } catch (error) {
    console.error(`Error in ${type} user unit:`, error);
    return {
      msg: 'Error, please contact us',
      status: false,
      updatedValue: 0,
    };
  }
}
