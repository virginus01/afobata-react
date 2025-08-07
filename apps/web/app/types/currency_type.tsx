interface CurrencyType {
  id?: string;
  countryId?: string;
  currencyCode?: string;
  currencyName?: string;
  currencySymbol?: string;
  exchangeRate?: number | any;
  availableForPayout?: boolean;
  availableForPurchase?: boolean;
  gateway?: 'paystack' | 'flutterwave';
  type?: 'crypto' | 'fiat';
  baseCurrency?: string;
  fiatValue?: number;
  baseValue?: number;
  network?: string;
  cryptos?: any[];
  charge?: number;
  flag?: string;
}
