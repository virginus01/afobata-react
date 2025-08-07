import { convertCurrency } from '@/app/helpers/convertCurrency';
import { curFormat } from '@/app/helpers/curFormat';

export const displayFormattedCurrency = ({
  price,
  rates,
  fromCurrency,
  toCurrency,
  symbol,
  locale = 'en-NG',
  minimumFractionDigits = 0,
}: {
  price: number | string;
  rates: { [key: string]: number } | null;
  fromCurrency: string;
  toCurrency: string;
  locale?: string;
  symbol: string;
  minimumFractionDigits?: number;
}): string => {
  if (!rates) return '0'; // Return "0" if rates are null or undefined

  const amount = parseInt(String(price || 0), 10); // Parse the price safely
  const convertedAmount = convertCurrency({
    amount,
    fromCurrency,
    toCurrency,
    rates,
  });

  // Format the convertedAmount with commas
  const formattedAmount = curFormat(convertedAmount, symbol);

  return formattedAmount;
};
