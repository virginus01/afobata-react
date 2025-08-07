import { WorldCurrencies } from '@/app/data/currencies';
import { lowercase } from '@/app/helpers/lowercase';

export function calculateWithdrawalCharges({
  amount,
  gateway = 'paystack',
  currency,
}: {
  amount: number;
  gateway: 'paystack' | 'flutterwave';
  currency: string;
}) {
  let fee = 0;

  const thisCurrency = WorldCurrencies.find(
    (cur) => lowercase(cur?.currencyCode ?? '') === lowercase(currency),
  );
  switch (gateway) {
    case 'paystack':
      fee = thisCurrency?.charge ?? 0;
      break;
  }

  return fee;
}
