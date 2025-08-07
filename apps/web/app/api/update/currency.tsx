import { response } from '@/app/helpers/response';
import { getCountries } from '@/app/helpers/country_helper';
import { isNull } from '@/app/helpers/isNull';
import { lowercase } from '@/app/helpers/lowercase';
import { uppercase } from '@/app/helpers/uppercase';
import { Country } from '@/app/models/Country';
import { WorldCurrencies } from '@/app/data/currencies';
import { _bulkUpsert } from '@/api/tenant/node/_mongodb';

export async function processCurrencies(baseCurrency = 'USD') {
  const countries: Country[] = (await getCountries()) ?? ([] as any);

  const currencies: CurrencyType[] = [];

  const EXCHANGE_RATE_API = process.env.EXCHANGE_RATE_API;

  const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${EXCHANGE_RATE_API}`;

  const res = await fetch(url, {
    method: 'GET',
  });

  if (!res.ok) {
    console.error('not able to reach api.exchangeratesapi.io');
    return response({ data: [] });
  }

  const result = await res.json();
  const rates = result?.rates ?? {};

  // Check if we can convert to requested base currency
  const usdRate = rates?.USD;
  let actualBaseCurrency = baseCurrency;

  if (baseCurrency === 'USD' && !usdRate) {
    console.warn('USD rate not found, falling back to EUR base');
    actualBaseCurrency = 'EUR';
  }

  countries?.map((country) => {
    const cur = uppercase(country.currency);

    const eurRate = rates?.[cur];
    let exchangeRate: number | null = null;
    let wc: CurrencyType = WorldCurrencies.find((c: any) => c.currencyCode === cur) ?? {};

    if (actualBaseCurrency === 'USD' && usdRate) {
      // Convert from EUR base to USD base
      exchangeRate = eurRate ? eurRate / usdRate : null;
    } else {
      // Use EUR base (default from API)
      exchangeRate = eurRate;
    }

    if (isNull(exchangeRate)) {
      actualBaseCurrency = 'USD';
    }

    currencies.push({
      id: lowercase(cur),
      countryId: country.code,
      currencyCode: cur,
      exchangeRate: exchangeRate ?? '',
      baseCurrency: actualBaseCurrency,
      currencySymbol: wc?.currencySymbol ?? '',
      flag: wc?.flag || '',
    });
  });

  if (currencies.length > 0) {
    await _bulkUpsert(currencies, 'currencies', true, {});
  }

  return response({ data: currencies, msg: `${currencies.length} update` });
}
