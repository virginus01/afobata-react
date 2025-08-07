import { isNull } from '@/app/helpers/isNull';

export function extractRates({ currencies }: { currencies: CurrencyType[] }) {
  let rates: { [key: string]: number } = {};

  if (currencies) {
    for (let rate of currencies) {
      if (!isNull(rate?.currencyCode) && rate?.currencyCode) {
        if (typeof rate.exchangeRate === 'number') {
          rates[rate?.currencyCode.toUpperCase()] = rate.exchangeRate;
        }
      }
    }
  }
  return rates;
}
