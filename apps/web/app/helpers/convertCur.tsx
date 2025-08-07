export const convertCur = async ({
  amount,
  fromCurrency,
  toCurrency,
  rates,
}: {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rates: any;
}) => {
  const { getExchangeRates } = await import('@/api/currency/currency');
  const { isNull } = await import('@/app/helpers/isNull');
  const liveRates = await getExchangeRates();
  const finalRates: any = { ...liveRates, rates };
  if (isNull(finalRates) || !finalRates) {
    throw new Error(
      'Rates are missing or invalid for' + ` ${fromCurrency} to ${toCurrency} at convertCur`,
    );
  }
  if (!fromCurrency || !toCurrency) {
    throw new Error('Both fromCurrency and toCurrency must be provided');
  }
  const fromCurrencyUpper = fromCurrency.toUpperCase();
  const toCurrencyUpper = toCurrency.toUpperCase();
  if (!finalRates[fromCurrencyUpper]) {
    throw new Error(`Rate for currency ${fromCurrencyUpper} is missing`);
  }
  if (!finalRates[toCurrencyUpper]) {
    throw new Error(`Rate for currency ${toCurrencyUpper} is missing`);
  }
  if (fromCurrencyUpper === 'EUR') {
    return amount * finalRates[toCurrencyUpper];
  }
  if (toCurrencyUpper === 'EUR') {
    return amount / finalRates[fromCurrencyUpper];
  }
  const amountInEUR = amount / finalRates[fromCurrencyUpper];
  return amountInEUR * finalRates[toCurrencyUpper];
};
