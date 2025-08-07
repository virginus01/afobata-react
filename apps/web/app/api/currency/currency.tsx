import { fetchDataWithConditions, fetchPaginatedData } from '@/app/api/database/mongodb';
import { api_response } from '@/app/helpers/api_response';
import { globalCacheSave } from '@/app/helpers/cdn';
import { invalid_response } from '@/app/helpers/invalid_response';

import { isNull } from '@/app/helpers/isNull';

export async function server_get_currencies({
  conditions,
  limit = '50',
  page = '1',
}: {
  conditions?: any;
  limit?: string;
  page?: string;
}) {
  try {
    if (isNull(conditions)) {
      return invalid_response('no condition specidied');
    }

    let res = await fetchPaginatedData({
      collectionName: 'currencies',
      conditions,
      limit: limit,
      page: page!,
    });

    let response: any = {};

    if (res.data && res.data.length > 0) {
      response.msg = 'currencies fetched';
      response.code = 'success';
      response.success = true;
      response.meta = res.meta;
      response.data = res.data;
    } else {
      response.msg = 'no currency fetched';
      response.code = 'error';
      response.success = false;
      response.meta = {};
      response.data = [];
    }

    return api_response(response);
  } catch (error) {
    console.error('error fetching currencies', error);
    return invalid_response('error fetching currencies');
  }
}

export async function server_get_exchange_rates() {
  try {
    let rates = await getExchangeRates();

    let response: any = {};
    if (rates) {
      response.msg = 'x rate fetched';
      response.code = 'success';
      response.success = true;
      response.meta = {};
      response.data = rates;
    } else {
      response.msg = 'no exchange rate fetched';
      response.code = 'error';
      response.success = false;
      response.meta = {};
      response.data = [];
    }

    return api_response(response);
  } catch (error) {
    console.error('error fetching x rate', error);
    return invalid_response('error fetching x rate');
  }
}

export async function getExchangeRates() {
  let response: any = {};

  try {
    let res = await fetchDataWithConditions('currencies', {});

    let rates: { [key: string]: number } = {};

    if (res) {
      for (let rate of res) {
        if (!isNull(rate?.currencyCode)) {
          rates[rate?.currencyCode.toUpperCase()] = rate.exchangeRate;
        }
      }
    }

    if (!isNull(rates)) {
      globalCacheSave({ data: rates, slug: 'rates', cacheDuration: 8600 });
    }

    return rates;
  } catch (error) {
    console.error('error getting x rate', error);
    return response;
  }
}
