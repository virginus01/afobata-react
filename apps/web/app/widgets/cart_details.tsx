import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useCart } from '@/app/contexts/cart_context';
import { CustomButton } from '@/app/widgets/widgets';
import { api_create_order } from '@/app/src/constants';
import CheckoutDetailsInfo from '@/app/src/checkout_details_info';
import Checkout from '@/app/widgets/checkout';
import { toast } from 'sonner';
import Link from 'next/link';
import { useBaseContext } from '@/app/contexts/base_context';
import CustomCard from '@/app/widgets/custom_card';
import { CreditCard, PackageCheck, Receipt, Zap } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import PaymentOptions from '@/src/cart/payment_options';
import CustomDrawer from '@/src/custom_drawer';
import Invoice from '@/app/receipt/page';
import RewardMilleDisplay from '@/app/widgets/rewards';
import { clearCache } from '@/app/actions';
import { dummydata } from '@/app/dashboard/ttx';
import { isNull } from '@/helpers/isNull';
import { modHeaders } from '@/helpers/modHeaders';
import { curFormat } from '@/helpers/curFormat';
import { getParents } from '@/helpers/getParents';
import { random_code } from '@/helpers/random_code';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().required('Email is required'),
});

const CartDetails: React.FC<{
  user?: UserTypes;
  siteInfo: BrandType;
  rates: any;
  auth: AuthModel;
}> = ({ user = {}, auth = {}, siteInfo, rates }) => {
  const [subTotal, setSubTotal] = useState<number>(0);
  const { removeRouteData } = useBaseContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    referenceId: string;
    invoice: CheckOutDataType;
    orders: OrderType;
    siteInfo: BrandType;
    defaultView: 'receipt' | 'products';
  }>({} as any);

  const [referenceId, setReferenceId] = useState(`${random_code(10)}`);
  const [userData, setUserData] = useState<UserTypes>(user);
  const {
    cart,
    removeFromCart,
    isCheckOutOpen,
    checkOutData,
    setCheckOutOpen,
    setCheckOutData,
    increaseQuantity,
    decreaseQuantity,
    setCart,
    setCompleted,
  } = useCart();
  const [paymentOption, setPaymentOption] = useState<PaymentOptionsType>({} as any);
  const { refreshPage } = useDynamicContext();

  let info: any[] = [];
  const name = `${auth?.firstName ?? ''} ${auth?.lastName ?? ''}` || '';

  const handleRefresh = useCallback(() => {
    refreshPage(['user', 'users', 'brand', 'brands'], true);
    toast.success('Page refreshed successfully');
  }, [refreshPage]);

  const handleOpenReceipt = (defaultView: 'receipt' | 'products') => {
    setReceiptData({ ...receiptData, defaultView });
    setOpenReceipt(true);
  };

  const [trnxRates, setTrnxRates] = useState<any>({} as any);
  const methods = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name,
      email: auth?.email || '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
  } = methods;

  useEffect(() => {
    const prev = dummydata;
    // setReceiptData(prev as any);
  }, []);

  useEffect(() => {
    const updateCart = async () => {
      if (cart.length === 0) return;

      let products: string[] = [];
      const updatedRates: any = {};

      const extractCurrency = (data: any) =>
        data?.ownerData?.currencyInfo?.currencyCode?.toUpperCase();

      // Fetch global parent and master
      const { parent, master } = await getParents({ subBase: siteInfo.slug });

      if (isNull(parent) || isNull(master)) {
        throw Error('An error occurred getting global parents');
      }

      // Add site owner's currency
      const ownerCurrency = siteInfo?.ownerData?.currencyInfo?.currencyCode;
      if (ownerCurrency) {
        updatedRates[ownerCurrency] = rates[ownerCurrency];
      }

      // Add global master and parent currencies
      const masterCurrency = extractCurrency(master);
      const parentCurrency = extractCurrency(parent);

      if (masterCurrency) updatedRates[masterCurrency] = rates[masterCurrency];
      if (parentCurrency) updatedRates[parentCurrency] = rates[parentCurrency];

      // Process cart items asynchronously
      const parentPromises = cart.map(async (c) => {
        products.push(c.id);

        if (c.currency) updatedRates[c.currency] = rates[c.currency];

        try {
          const { parent, master } = await getParents({ subBase: c.parentBrandId });

          if (isNull(parent) || isNull(master)) {
            throw Error(`An error occurred getting parents for ${c.id}`);
          }

          const masterCurrency = extractCurrency(master);
          const parentCurrency = extractCurrency(parent);

          if (masterCurrency) updatedRates[masterCurrency] = rates[masterCurrency];
          if (parentCurrency) updatedRates[parentCurrency] = rates[parentCurrency];
        } catch (error) {
          console.error(`Error fetching parents for ${c.id}:`, error);
          throw Error(`Error fetching parents for ${c.id}`);
        }
      });

      await Promise.all(parentPromises);
      // Update state once
      setTrnxRates((prev: any) => ({ ...prev, ...updatedRates }));
    };

    updateCart();
  }, [cart, rates, siteInfo]);

  const currencyMap = new Map<string, string>();

  for (let c of cart) {
    currencyMap.set(c.orderCurrency.toLowerCase(), c.orderCurrencySymbol);
  }

  const orderCurrencies =
    Array.from(currencyMap, ([currency, symbol]) => ({
      currency,
      symbol,
    })) ?? [];

  const orderCurrency = orderCurrencies![0] ?? {};

  const onSubmit = async (values: any) => {
    const isOnline = navigator.onLine;

    try {
      const orderData: CheckOutDataType = {
        userId: auth?.userId,
        email: values.email ?? auth.email ?? '',
        name: values?.name ?? auth?.firstName ?? '',
        walletId: '',
        cart: cart,
        subTotal: subTotal ?? 0,
        referenceId,
        gateway: paymentOption?.sp,
        currency: orderCurrency.currency,
        symbol: orderCurrency.symbol,
        rates: trnxRates,
      };

      if (isNull(paymentOption.sp)) {
        toast.error('select payment method');
        return;
      }

      setIsProcessing(true);

      if (!isOnline || paymentOption.sp === 'cash') {
        if (paymentOption.sp === 'cash') {
          toast.success('payment successfull via cash');
          setReceiptData({
            siteInfo,
            invoice: orderData,
            orders: cart as OrderType,
            referenceId,
            defaultView: 'receipt',
          });
          setOpenReceipt(true);
          return;
        } else {
          toast.error("You're not online");
          return;
        }
      }

      const url = await api_create_order({ subBase: siteInfo?.slug });

      const formData = {
        ...orderData,
        status: 'pending',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.error('Error posting order');
        return;
      }

      const { data, msg, status, code } = await response.json();

      if (status) {
        if (code === 'paid') {
          const orderData = data;
          toast.success(msg);
          setReceiptData({
            referenceId: orderData.invoice.referenceId,
            invoice: orderData.invoice,
            orders: orderData.orders,
            siteInfo,
            defaultView: 'receipt',
          });

          setOpenReceipt(true);
          setCompleted(true);
          return;
        } else if (paymentOption.sp === 'wallet') {
          toast.error('insufficient balance');
          return;
        } else {
          orderData;
          toast.warning(msg);
          setCheckOutData({
            ...orderData,
            ...values,
            subTotal: data.subTotal,
          });
          setCheckOutOpen(true);
        }
      } else {
        toast.error(msg);
        return;
      }
    } catch (error) {
      console.error('error creating order', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const calculateSubtotal = () => {
      const total = cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      setSubTotal(total);
    };

    calculateSubtotal();
  }, [cart]);

  if (isNull(name)) {
    info.push({ name: 'name', label: 'Name', type: 'text' });
  }

  if (isNull(auth.email)) {
    info.push({ name: 'email', label: 'Email', type: 'email' });
  }

  const handleProceedClick = async () => {
    const isValid = await trigger();

    if (isValid) {
      onSubmit(getValues());
    } else {
      console.error(errors);
    }
  };

  return (
    <>
      <div className="w-full">
        {cart.length === 0 ? (
          <p className="flex font-bold justify-center my-20">Your cart is empty</p>
        ) : isNull(siteInfo) ? (
          <p className="flex font-bold justify-center my-20">Brand is empty</p>
        ) : (
          <div className="flex flex-col h-full w-full">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col sm:flex-row  space-y-4 sm:space-y-0 justify-center">
                  {/* Products Section */}
                  <div className="w-full sm:w-2/3">
                    <CustomCard title="Products">
                      <div className="space-y-4">
                        {cart.map((item: CartItem) => (
                          <div
                            key={item.id}
                            className="border-b border-gray-300 flex flex-col space-y-4 p-2"
                          >
                            <div className="text-xs font-semibold whitespace-nowrap truncate">
                              <Link href={item.slug || '#'}>{item.title}</Link>
                            </div>
                            <div className="flex flex-row w-full justify-between py-2">
                              <p className="font-normal">
                                {item.amount === 0
                                  ? 'Free'
                                  : curFormat(item.amount, item.orderCurrencySymbol)}
                              </p>
                              <div className="flex items-center space-x-4">
                                <CustomButton
                                  className="w-6 h-6"
                                  disabled={item.quantity === 1 || item.type !== 'physical'}
                                  onClick={() => decreaseQuantity(item.id!)}
                                >
                                  -
                                </CustomButton>
                                <span className="mx-2">{item.quantity}</span>
                                <CustomButton
                                  className="w-6 h-6"
                                  onClick={() => increaseQuantity(item.id!)}
                                  disabled={item.type !== 'physical'}
                                >
                                  +
                                </CustomButton>

                                <CustomButton
                                  className="bg-red-500 w-6 h-6"
                                  onClick={() => removeFromCart(item.id!)}
                                >
                                  x
                                </CustomButton>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CustomCard>

                    <CheckoutDetailsInfo
                      setValue={(name: string, value: any) => {
                        setValue(name, value);
                      }}
                      info={info}
                      user={auth}
                    />

                    <CustomCard title="Payment Option">
                      <PaymentOptions
                        paymentOption={paymentOption}
                        setPaymentOption={(data) => {
                          setPaymentOption(data);
                        }}
                        setValue={setValue}
                        user={userData}
                        auth={auth}
                        cart={cart}
                        orderCurrencies={orderCurrencies}
                        subTotal={subTotal}
                      />
                    </CustomCard>
                  </div>

                  {/* Checkout Section */}
                  <div className="w-full sm:w-1/3">
                    <CustomCard title="Checkout">
                      {orderCurrencies.length > 1 ? (
                        <div className="text-sm text-red-500 px-2">
                          You cannot have a cart with more than one currency. Remove some items to
                          proceed.
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-4">
                          <div className="flex justify-between items-center mb-5">
                            <div className="font-medium text-xs">Subtotal</div>
                            <div className="text-right">
                              {curFormat(subTotal, orderCurrency.symbol)}
                            </div>
                          </div>

                          <RewardMilleDisplay
                            siteInfo={siteInfo}
                            rates={rates}
                            subTotal={subTotal ?? 0}
                            auth={auth}
                            currency={auth.defaultCurrency ?? 'NGN'}
                          />

                          {!isNull(receiptData) ? (
                            <div className="flex flex-col space-y-4">
                              {(receiptData?.orders && (receiptData?.orders as any[])).some(
                                (order) => order.type === 'electric',
                              ) && (
                                <CustomButton
                                  submitting={isProcessing}
                                  submittingText=""
                                  icon={<Zap className="w-5 h-5 mr-2" />}
                                  iconPosition="before"
                                  onClick={() => handleOpenReceipt('products')}
                                >
                                  Get Tokens
                                </CustomButton>
                              )}

                              {receiptData?.orders &&
                                (receiptData?.orders as any[]).some(
                                  (order) => order.type === 'digital',
                                ) && (
                                  <CustomButton
                                    submitting={isProcessing}
                                    submittingText=""
                                    icon={<PackageCheck className="w-5 h-5 mr-2" />}
                                    iconPosition="before"
                                    onClick={() => handleOpenReceipt('products')}
                                  >
                                    Access Product
                                  </CustomButton>
                                )}

                              <CustomButton
                                submitting={isProcessing}
                                submittingText=""
                                icon={<Receipt className="w-5 h-5 mr-2" />}
                                iconPosition="before"
                                onClick={() => handleOpenReceipt('receipt')}
                              >
                                View Receipt
                              </CustomButton>
                            </div>
                          ) : (
                            <div className="sticky bottom-0 w-full">
                              <CustomButton
                                className="w-full"
                                submitting={isProcessing}
                                submittingText="Placing Order"
                                icon={<CreditCard className="w-5 h-5 mr-2" />}
                                iconPosition="before"
                                onClick={() => handleProceedClick()}
                              >
                                {subTotal === 0 ? 'Continue For Free' : 'Pay Now'}
                              </CustomButton>
                            </div>
                          )}
                        </div>
                      )}
                    </CustomCard>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        )}

        {openReceipt && !isNull(receiptData) && (
          <CustomDrawer
            isOpen={openReceipt}
            onClose={() => {
              setOpenReceipt(false);
            }}
            header={'Receipt'}
            isHeightFull={true}
            isWidthFull={true}
          >
            <Invoice
              siteInfo={siteInfo as any}
              referenceId={referenceId}
              iniInvoice={receiptData.invoice as any}
              iniOrders={receiptData.orders as any}
              defaultView={receiptData.defaultView as any}
              user={userData}
            />
          </CustomDrawer>
        )}
        {checkOutData && isCheckOutOpen && (
          <Checkout
            siteInfo={siteInfo}
            gateway={paymentOption}
            onClose={() => {
              setCheckOutOpen(false);
              setCheckOutData(null);
            }}
            onCompleted={(data: any) => {
              setCheckOutData(null);
              setCompleted(true);
              handleRefresh();
              removeRouteData();
              setReceiptData(data);
              setOpenReceipt(true);
              toast.success('Order received');
            }}
          />
        )}
      </div>
    </>
  );
};

export default CartDetails;
