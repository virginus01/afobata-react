'use client';
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

import { WorldCurrencies } from '@/app/data/currencies';
import { purchaseCur } from '@/src/constants';

// Define the CartContextType interface
interface CartContextType {
  cart: CartItem[];
  isCartSidebarOpen: boolean;
  isCheckOutOpen: boolean;
  exchangeRates: any | null;
  checkOutData: CheckOutDataType | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  setCartSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckOutOpen: (isCheckOutOpen: boolean) => void;
  setCheckOutData: React.Dispatch<React.SetStateAction<CheckOutDataType | null>>;
  toggleCartSidebar: () => void;
  toggleCheckOut: () => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  currency: CurrencyType;
  currencies: CurrencyType[];
  setCurrency: (currency: CurrencyType) => void;
  setCurrencies: (currencies: CurrencyType[]) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  getCurrencies: ({ type }: { type: string }) => void;
  completed: boolean;
  setCompleted: (completed: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartSidebarOpen, setCartSidebarOpen] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [isCheckOutOpen, setCheckOutOpen] = useState(false);
  const [checkOutData, setCheckOutData] = useState<CheckOutDataType | null>(null);
  const [exchangeRates, setRates] = useState<any | null>({});
  const [currency, setCurrency] = useState<CurrencyType>({
    currencyCode: 'NGN',
    currencySymbol: '₦',
    gateway: 'paystack',
  });
  const [currencies, setCurrencies] = useState<CurrencyType[]>([]);

  // Memoize state setter functions
  const handleSetCurrency = useCallback((newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
  }, []);

  const handleSetCurrencies = useCallback((newCurrencies: CurrencyType[]) => {
    setCurrencies(newCurrencies);
  }, []);

  const handleSetCheckOutOpen = useCallback((isOpen: boolean) => {
    setCheckOutOpen(isOpen);
  }, []);

  const handleIncreaseQuantity = useCallback((id: string) => {
    increaseQuantity(id);
  }, []);

  const handleDecreaseQuantity = useCallback((id: string) => {
    decreaseQuantity(id);
  }, []);

  useEffect(() => {
    try {
      getCurrencies({ type: 'purchase' });
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        setCart(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      setCompleted(false);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart, isCartSidebarOpen]);

  // Memoize cart functions
  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart;
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  }, []);

  const increaseQuantity = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    );
  };

  const decreaseQuantity = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
      ),
    );
  };

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
      try {
        const updatedCart = cart.filter((item) => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      } catch (error) {
        console.error('Error updating cart cookie:', error);
      }
    },
    [cart],
  );

  const toggleCartSidebar = useCallback(() => {
    setCartSidebarOpen((prevState) => !prevState);
  }, []);

  const toggleCheckOut = useCallback(() => {
    setCheckOutOpen((prevState) => !prevState);
  }, []);

  const getCurrencies = useCallback(({ type }: { type: string }) => {
    let currencies: CurrencyType[] = [];

    try {
      if (type === 'purchase') {
        const purchaseCodes = purchaseCur.map((c) => c.currencyCode);
        currencies = WorldCurrencies.filter((c) => purchaseCodes.includes(c.currencyCode));
      } else {
        currencies = WorldCurrencies;
      }
    } catch (error) {
      console.error(error);
      currencies = WorldCurrencies;
    }
    let exchangeRates = {};

    WorldCurrencies.map((rate) => {
      if (rate && rate?.currencyCode) {
        exchangeRates = {
          ...exchangeRates,
          [rate.currencyCode]: rate.exchangeRate ?? 0,
        };
      }
    });

    setRates(exchangeRates);
    setCurrencies(currencies);
    return currencies;
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cart,
      isCartSidebarOpen,
      isCheckOutOpen,
      checkOutData,
      exchangeRates,
      addToCart,
      removeFromCart,
      setCartSidebarOpen,
      setCheckOutOpen: handleSetCheckOutOpen,
      setCheckOutData,
      toggleCartSidebar,
      toggleCheckOut,
      setCart,
      completed,
      setCompleted,
      getCurrencies,
      currency: currency!,
      setCurrency: handleSetCurrency,
      currencies: currencies!,
      setCurrencies: handleSetCurrencies,
      decreaseQuantity: handleDecreaseQuantity,
      increaseQuantity: handleIncreaseQuantity,
    }),
    [
      cart,
      isCartSidebarOpen,
      isCheckOutOpen,
      checkOutData,
      exchangeRates,
      completed,
      setCompleted,
      addToCart,
      removeFromCart,
      setCartSidebarOpen,
      handleSetCheckOutOpen,
      setCheckOutData,
      toggleCartSidebar,
      toggleCheckOut,
      setCart,
      currency,
      getCurrencies,
      handleSetCurrency,
      currencies,
      handleSetCurrencies,
      handleDecreaseQuantity,
      handleIncreaseQuantity,
    ],
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
