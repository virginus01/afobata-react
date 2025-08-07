export const convertCurrency = ({
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
  const finalRates: any = rates;

  if (!finalRates) {
    throw new Error('Rates are missing or invalid at convertCurrency');
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

  // Convert fromCurrency to EUR, then from EUR to toCurrency
  const amountInEUR = amount / finalRates[fromCurrencyUpper];
  return amountInEUR * finalRates[toCurrencyUpper];
};
