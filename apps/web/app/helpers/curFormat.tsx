export const curFormat = (
  amount: any = 0,
  symbol?: string,
  currency?: string,
  decimal = 0,
  locale = 'en-US',
) => {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;

  let formattedAmount = validAmount.toFixed(decimal);

  if (symbol) {
    const sMoney = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    }).format(validAmount);

    formattedAmount = `${symbol}${sMoney}`;
  }

  if (currency) {
    formattedAmount = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    }).format(validAmount);
  }

  return formattedAmount;
};
