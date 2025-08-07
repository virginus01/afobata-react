import { isNull } from '@/app/helpers/isNull';

export function validateCartCurrency(cart: CartItem[], defaultCurrency?: string): boolean {
  if (!defaultCurrency) {
    console.error('default currency is not set.');
    return false;
  }

  const currency = cart.filter((c: any) => c.currencyCode !== defaultCurrency?.toUpperCase());

  return isNull(currency) ? true : false;
}
