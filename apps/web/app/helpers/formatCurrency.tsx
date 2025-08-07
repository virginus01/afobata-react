export function formatCurrency(
  amount: number = 0,
  currency: string = 'NGN',
  fractionDigits: number = 0,
  locale: string = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(parseInt(String(amount) || '0'));
}
