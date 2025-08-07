import { Fragment, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { isNull } from '@/app/helpers/isNull';
import { toast } from 'sonner';
import { useCart } from '@/app/contexts/cart_context';
import { setCookie } from '@/app/actions';

export const CurSwitch: React.FC<{ siteInfo: BrandType }> = ({ siteInfo }) => {
  const { setCart, cart, currency, currencies, setCurrency } = useCart();

  let availableCurrencies = currencies.filter((c: CurrencyType) => c.availableForPurchase) ?? [];

  const handleSwitch = async (data: CurrencyType) => {
    if (cart && cart.length > 0) {
      setCart([]);
      toast.info('cart emptied');
    }
    setCart([]);
    setCookie(data, 'currency');
    setCurrency(data);
  };

  return (
    <Menu as="div" className="relative mx-1 text-xs">
      <div className="m-0">
        <MenuButton
          className="relative active:border active:border-none active:shadow-none active:bg-transparent focus:outline-none "
          onClick={() => {
            if (isNull(availableCurrencies)) {
              toast.warning('currencies still loading');
            }
          }}
        >
          <span className="absolute -inset-1.5" />
          <div className="flex items-center justify-between">
            <span>{currency.currencyCode || 'NGN'}</span>{' '}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </MenuButton>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {availableCurrencies &&
            availableCurrencies.map((cur, i) => {
              if (isNull(cur.currencyCode)) return;
              return (
                <MenuItem key={i}>
                  {({ active }) => (
                    <button
                      className="text-sm p-2 flex flex-col text-gray-600 dark:text-gray-50"
                      onClick={async () => {
                        await handleSwitch(cur);
                      }}
                    >
                      {cur.currencyCode} ({cur.currencySymbol})
                    </button>
                  )}
                </MenuItem>
              );
            })}
        </MenuItems>
      </Transition>
    </Menu>
  );
};
