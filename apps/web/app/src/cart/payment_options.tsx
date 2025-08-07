import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';
import { lowercase } from '@/app/helpers/lowercase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { paymentGts } from '@/src/constants';
import { CustomButton } from '@/app/widgets/custom_button';

const PaymentOptions = ({
  setValue,
  user,
  cart,
  orderCurrencies,
  subTotal,
  additionalOptions,
  mode = 'inward',
  auth,
  setPaymentOption,
  paymentOption,
}: {
  setValue: (name: string, value: any) => void;
  user: UserTypes;
  cart: CartItem[];
  orderCurrencies: any[];
  subTotal: number;
  additionalOptions?: PaymentOptionsType[];
  mode?: 'inward' | 'outward';
  auth?: AuthModel;
  setPaymentOption: (data: PaymentOptionsType) => void;
  paymentOption: PaymentOptionsType;
}) => {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptionsType[]>([]);
  const orderCurrency: { currency: string; symbol: string } = orderCurrencies[0] ?? {};

  const sortedOnce = useRef(false);

  const removeOption = useCallback(
    (name: string) => {
      setPaymentOptions((prev) => prev.filter((opt) => opt.name !== name || opt.sp !== name));
    },
    [subTotal],
  );

  // Wrap data processing in useMemo to prevent recreation on every render
  const { owners, managers, order_types } = useMemo(() => {
    const sellerMap = new Set();
    const managerSet = new Set();
    const typeSet = new Set();

    for (let c of cart) {
      sellerMap.add(c.sellerId);
      typeSet.add(c.type);

      if (Array.isArray(c.managers)) {
        c.managers.forEach((manager) => managerSet.add(manager));
      } else if (c.managers) {
        managerSet.add(c.managers);
      }
    }

    return {
      owners: Array.from(sellerMap) ?? [],
      managers: Array.from(managerSet) ?? [],
      order_types: Array.from(typeSet) ?? [],
    };
  }, [cart]);

  useEffect(() => {
    const newOptions: PaymentOptionsType[] = [];

    // Helper to avoid duplicates
    const addIfNotExists = (option: PaymentOptionsType) => {
      if (!newOptions.some((o) => o.name === option.name)) {
        newOptions.push(option);
      }
    };

    // Additional custom options
    if (!isNull(additionalOptions)) {
      additionalOptions?.forEach((p) =>
        addIfNotExists({
          name: p.name,
          label: p.label,
          desc: p.desc,
          disabled: p.disabled,
          sp: p.sp,
        }),
      );
    }

    // Cash option for staff
    if (
      owners.length === 1 &&
      managers.includes(user.id) &&
      order_types.length === 1 &&
      order_types.includes('physical')
    ) {
      addIfNotExists({
        name: 'cash',
        label: 'Cash',
        desc: 'Pay with Cash',
        sp: 'cash',
      });
    }

    // Wallet option
    if (lowercase(orderCurrency.currency) === lowercase(user?.defaultCurrency ?? '')) {
      addIfNotExists({
        name: 'wallet',
        label: `Wallet - (${curFormat(
          user.wallet?.value ?? 0,
          user?.currencyInfo?.currencySymbol ?? '',
        )})`,
        desc: 'Pay from account',
        disabled: (user.wallet?.value ?? 0) <= subTotal,
        channels: [],
        sp: 'wallet',
      });
    }

    // Paystack options (for NGN)
    if (['ngn'].includes(lowercase(orderCurrency?.currency)) && paymentGts.includes('paystack')) {
      [
        {
          name: 'paystack_bank_transfer',
          label: 'Paystack - Transfer',
          desc: 'Instant bank transfer',
          channels: ['bank_transfer'],
        },
        {
          name: 'paystack_card',
          label: 'Paystack - Card',
          desc: 'Pay with Debit or Credit Card',
          channels: ['card'],
        },
        {
          name: 'paystack_ussd',
          label: 'Paystack - USSD',
          desc: 'Pay using USSD code',
          channels: ['ussd'],
        },
        {
          name: 'paystack_bank',
          label: 'Paystack - Bank',
          desc: 'Pay using Internet or Mobile Banking',
          channels: ['bank'],
        },
        {
          name: 'paystack_qr',
          label: 'Paystack - QR',
          desc: 'Pay with QR Code',
          channels: ['qr'],
        },
      ].forEach((opt) =>
        addIfNotExists({
          ...opt,
          disabled: false,
          sp: 'paystack',
        } as any),
      );
    }

    // Flutterwave (for non-NGN)
    if (lowercase(orderCurrency?.currency) !== 'ngn' && paymentGts.includes('flutterwave')) {
      addIfNotExists({
        name: 'flutterwave',
        label: 'Flutterwave',
        desc: 'Debit Card, Mobile Money',
        sp: 'flutterwave',
        channels: [],
      });
    }

    // Final merged and set
    setPaymentOptions(newOptions);
    setPaymentOption(newOptions[0]);
  }, [
    cart,
    user,
    managers,
    orderCurrency.currency,
    order_types,
    owners.length,
    subTotal,
    additionalOptions,
  ]);

  const scrollContainerRef: any = useRef(null);

  const scroll = (direction: any) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250; // Adjust based on your card width
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (orderCurrencies.length > 1) {
    return (
      <div className="text-sm text-red-500 px-2">
        You cannot have a cart with more than one currency. Remove some items to proceed.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-center my-5 h-6 w-full">
        <div className="text-xs">Select a payment method</div>

        <div className="w-auto h-full">
          <CustomButton onClick={() => scroll('right')}>more</CustomButton>
        </div>
      </div>
      <div className="relative w-full flex items-center">
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden lg:block absolute left-0 z-10 rounded-full p-1 bg-gray-50 hover:bg-gray-200"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          className="flex flex-row space-x-2 overflow-x-auto scrollbar-hide mx-1 sm:mx-8"
          ref={scrollContainerRef}
        >
          {paymentOptions.map((paymenyGateway, i) => (
            <div
              className="w-64 rounded-lg border border-gray-200 bg-gray-50 p-2 ps-4 dark:border-gray-700 dark:bg-gray-800"
              key={i}
            >
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    disabled={paymenyGateway.disabled}
                    onChange={(e) => {
                      setPaymentOption(paymenyGateway);
                      setValue('gateway', e.target.value);
                    }}
                    checked={paymentOption.name === paymenyGateway.name}
                    id={paymenyGateway.name}
                    aria-describedby="credit-card-text"
                    type="radio"
                    name="payment-method"
                    value={paymenyGateway.name}
                    className="h-4 w-4 border-gray-300 bg-white text-primary-600 focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                  />
                </div>

                <div className="ms-4 text-xs">
                  <label
                    htmlFor={paymenyGateway.name}
                    className={`font-medium leading-none ${
                      paymenyGateway.disabled ? 'text-gray-400' : 'text-gray-900'
                    }  dark:text-white whitespace-nowrap`}
                  >
                    {paymenyGateway.label}
                  </label>
                  <p
                    id="credit-card-text"
                    className={`mt-1 text-xs font-normal ${
                      paymenyGateway.disabled ? 'text-gray-300' : 'text-gray-500'
                    }  dark:text-gray-400 whitespace-nowrap max-w-xs truncate`}
                  >
                    {paymenyGateway.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden lg:block md:block absolute right-0 z-10 rounded-full p-1 bg-gray-50 hover:bg-gray-200"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default PaymentOptions;
