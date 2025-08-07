import { fetchExchangeRates } from '@/app/helpers/fetchExchangeRates';

export const getCryptoRate = async ({
  subBase,
  currency,
  userCurrency,
}: {
  subBase: string;
  currency: string;
  userCurrency: string;
}): Promise<{ [key: string]: number | any }> => {
  const { isNull } = await import('@/app/helpers/isNull');
  if (!currency || !subBase || !userCurrency) return { btc: 0 };
  const { fetchDataWithConditions } = await import('@/database/mongodb');
  const [fiatCurrency]: CurrencyType[] = await fetchDataWithConditions('currencies', {
    id: userCurrency,
  });
  const [cur] = fiatCurrency.cryptos?.filter(
    (c: any) => `${c.id}`.toLowerCase() === currency.toLowerCase(),
  ) as CurrencyType[];
  let brand: BrandType = {};
  try {
    const { api_get_brand } = await import('@/app/routes/api_routes');
    let url = await api_get_brand({ subBase: subBase || 'crypto' });
    const { baseUrl } = await import('@/app/helpers/baseUrl');
    const finalUrl = await baseUrl(url);
    const response = await fetch(finalUrl, { method: 'GET', next: { revalidate: 3600 } });
    const res = await response.json();
    if (res.success && !isNull(res.data)) {
      brand = res.data;
    }
  } catch (error) {
    console.error('Error fetching brand info:', error);
  }

  const exchange_rates = await fetchExchangeRates();
  const { convertCur } = await import('@/app/helpers/convertCur');
  const masterRate = await convertCur({
    amount: parseFloat(String(brand?.masterBrandData?.crypto_rate || 0)),
    rates: exchange_rates,
    fromCurrency: 'ngn',
    toCurrency: userCurrency.toUpperCase(),
  });
  const parentRate = await convertCur({
    amount: parseFloat(String(brand?.parentBrandData?.crypto_rate || 0)),
    rates: exchange_rates,
    fromCurrency: brand.parentBrandData?.ownerData?.defaultCurrency!,
    toCurrency: userCurrency.toUpperCase(),
  });
  const brandRate = await convertCur({
    amount: parseFloat(String(brand?.crypto_rate || 0)),
    rates: exchange_rates,
    fromCurrency: brand.ownerData?.defaultCurrency!,
    toCurrency: userCurrency.toUpperCase(),
  });
  let allRates = masterRate;
  if (brand.parentBrandData?.id !== brand.masterBrandData?.id) {
    allRates += parentRate;
  }
  if (brand.id !== brand.parentBrandData?.id) {
    allRates += brandRate;
  }
  const finalBTCRate = (cur.exchangeRate || 0) - allRates;
  return { btc: Math.max(0, finalBTCRate) || 0, brand: brand };
};
