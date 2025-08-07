import { convertCurrency } from '@/app/helpers/convertCurrency';
import { findMissingFields } from '@/app/helpers/findMissingFields';

export function getRewardMille({
  amount,
  rates,
  currency,
}: {
  amount: number;
  rates: any;
  currency: string;
}): number {
  const missing = findMissingFields({
    amount,
    fromCurrency: currency,
    toCurrency: 'NGN',
    rates,
  });

  if (missing) return 0;

  const convertedAmount = convertCurrency({
    amount,
    fromCurrency: currency,
    toCurrency: 'NGN',
    rates,
  });

  if (typeof convertedAmount !== 'number' || isNaN(convertedAmount) || convertedAmount < 50) {
    return 0;
  }

  if (convertedAmount > 20000) {
    return 400;
  }

  if (convertedAmount < 100) {
    return 1;
  }

  return Math.floor(convertedAmount / 150);
}
