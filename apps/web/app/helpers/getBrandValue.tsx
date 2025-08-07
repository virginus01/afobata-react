import { convertCurrency } from '@/app/helpers/convertCurrency';

export function getBrandValue({
  siteInfo,
  rates,
  currency,
  value,
}: {
  siteInfo: BrandType;
  rates: any;
  value: number;
  currency: CurrencyType;
}) {
  const pP = convertCurrency({
    amount: parseFloat(String(value || '0')),
    rates,
    fromCurrency: siteInfo?.ownerData?.defaultCurrency!,
    toCurrency: currency.currencyCode || 'NGN',
  });
  return pP;
}
