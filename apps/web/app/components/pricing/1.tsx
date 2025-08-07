'use client';
import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
// From async_helper
import { getUserEssentials } from '@/app/helpers/getUserEssentials';
import { show_error } from '@/app/helpers/show_error';

// From custom_helper
import { convertCurrency } from '@/app/helpers/convertCurrency';
import { curFormat } from '@/app/helpers/curFormat';
import { getPackagePrice } from '@/app/helpers/getPackagePrice';
import { isNull } from '@/app/helpers/isNull';
import { toast } from 'sonner';
import { ConfirmModal } from '@/app/widgets/confirm';
import { useCart } from '@/app/contexts/cart_context';
import ToggleRowSelect from '@/app/widgets/select_toggle';
import { CurSwitch } from '@/app/components/currency_switch';
import { constantAddons } from '@/app/package_tags';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomButton } from '@/app/widgets/custom_button';
import { subDuration } from '@/app/data/subscriptions';
import CustomDrawer from '@/app/src/custom_drawer';
import ClientView from '@/app/views/client_view';
import { masterBrandData, masterUserData } from '@/app/data/master';
import RewardMilleDisplay from '@/app/widgets/rewards';

const PricingPage: React.FC<any> = ({
  siteInfo,
  user,
  auth,
  pageEssentials,
  parents,
  rates,
  onCallback,
}: {
  siteInfo: BrandType;
  user: UserTypes;
  parents: ParentsInfo;
  pageEssentials?: any;
  auth: AuthModel;
  rates: any;
  onCallback: (data: any) => void;
}) => {
  // State
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [plan, setPlan] = useState<DataType | null>(null);
  const [packPrice, setPackPrice] = useState<number>(0);
  const [duration, setDuration] = useState<PlanDuration>(
    subDuration.find((d) => d.name === 'yearly') as PlanDuration,
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [userData, setUserData] = useState(user);
  const { addToCart, setCartSidebarOpen, exchangeRates, currency, cart } = useCart();

  const finalRates = { ...exchangeRates, rates };

  // Ref for touch timeout
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Memoized options
  const options = useMemo(() => subDuration, []);

  // Handle touch event
  const handleTouch = useCallback(() => {
    setShowScroll(true);
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => setShowScroll(false), 2000);
  }, []);

  // Handle scroll
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const scrollAmount = clientWidth * 0.8;
    scrollContainerRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Form submission
  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (isNull(auth)) {
        toast.error('not logged. you need to login');
        return;
      }

      if (auth.packageId === values.id) {
        toast.error('you are already on this package');
        return;
      }

      let orderCurrencySymbol = '';
      let orderCurrency = '';
      let orderValue = values?.price;

      orderCurrency = currency.currencyCode ?? '';
      orderCurrencySymbol = currency.currencySymbol ?? '';

      const productCurrency = masterUserData.defaultCurrency ?? '';

      const orderId = Date.now().toString();
      const item: CartItem = {
        id: orderId,
        productId: values.id,
        sellerId: siteInfo.id!,
        customerId: auth.userId ?? '',
        userId: auth.userId ?? '',
        title: `${values.title} ${values.isFree ? 'Life Time' : duration?.title} Subscription`,
        orderValue: orderValue ?? 0,
        managers: [values?.userId ?? ''],
        amount: parseFloat(values?.price),
        productPrice: values?.price,
        currency: productCurrency,
        orderCurrencySymbol,
        orderCurrency,
        duration,
        symbol: masterUserData.defaultCurrencyCode ?? '',
        type: 'package',
        slug: orderId,
        quantity: 1,
        parentBrandId: values.parentBrandId,
        others: {
          partner: values?.partner,
        },
        rates: {
          [orderCurrency.toUpperCase()]: finalRates[orderCurrency.toUpperCase()],
          [productCurrency.toUpperCase()]: finalRates[productCurrency.toUpperCase()],
        },
        sp: masterBrandData.name,
      };

      addToCart(item);
      setCartSidebarOpen(true);
    } catch (error: any) {
      toast.error('An error occurred while submitting the form');
      show_error('Error submitting form', error.toString(), true);
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const packages = pageEssentials.packages;

  interface AddonListProps {
    addons: AddonType[];
    siteAddons?: AddonType[];
    mode: 'title' | 'details';
  }

  const AddonList: React.FC<AddonListProps> = ({ addons, siteAddons = [], mode = 'title' }) => {
    return (
      <>
        {addons
          .sort((a: any, b: any) => a.id.localeCompare(b.id))
          .map((addon, i) => {
            const isOdd = i % 2 !== 0;
            const bgClass = isOdd ? 'bg-gray-100' : '';
            const pc = siteAddons.find((p) => p.id === addon.id) ?? {};

            if (mode === 'title') {
              return (
                <div
                  key={addon.id}
                  className={`${bgClass} text-gray-900 h-12 text-center px-4 flex items-center justify-start text-xs w-full`}
                >
                  {addon.title}
                </div>
              );
            }

            return (
              <div
                key={addon.id}
                className={`${bgClass} text-gray-900 h-12 text-center px-4 flex items-center justify-start text-xs w-full`}
              >
                {pc.available ? (
                  pc.hasValue ? (
                    // Available addon with value
                    <>
                      <span className="hidden sm:inline">{pc.short_desc}</span>
                      <span className="flex sm:hidden">
                        <CheckIcon />
                        <span className="ml-2">{pc.long_desc}</span>
                      </span>
                    </>
                  ) : (
                    // Available addon without value
                    <>
                      <CheckIcon />
                      <span className="ml-2 sm:hidden">{addon.title}</span>
                    </>
                  )
                ) : (
                  // Unavailable addon
                  <>
                    <CloseIcon />
                    <span className="ml-2 sm:hidden">{addon.title}</span>
                  </>
                )}
              </div>
            );
          })}
      </>
    );
  };

  // Check Icon Component
  const CheckIcon = () => (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      className="w-4 h-4 text-green-700"
      viewBox="0 0 24 24"
    >
      <path d="M20 6L9 17l-5-5"></path>
    </svg>
  );

  // Close Icon Component
  const CloseIcon = () => (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      className="w-4 h-4 text-gray-500"
      viewBox="0 0 24 24"
    >
      <path d="M18 6L6 18M6 6l12 12"></path>
    </svg>
  );

  return (
    <div className="mb-20">
      <div className="mt-10 w-full">
        <div className="flex flex-col justify-center items-center space-y-5">
          <div className="text-xl font-bold">Pick the right plan for you</div>
          <div>
            {' '}
            It’s completely free to get started. We only charge a small transaction fee for every
            sale you make on any of our plans.
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-5">
          <CurSwitch siteInfo={siteInfo} />
          <ToggleRowSelect
            selected={duration!}
            options={options}
            onSelectionChange={(e: any) => {
              setDuration(e);
            }}
          />
        </div>
        <div className="flex justify-center items-center text-center text-red-500 font-bold text-sm">
          {duration?.discount}% extra discount
        </div>
      </div>
      <div className="w-full px-5 py-24 flex flex-wrap">
        {/* Addons - fixed column.. */}
        <div className="lg:w-1/4 mt-48 hidden lg:block">
          <div className="mt-px border-t border-gray-300 border-b border-l rounded-tl-lg rounded-bl-lg overflow-hidden">
            <AddonList addons={constantAddons} mode="title" />
          </div>
        </div>

        <div
          className="lg:w-3/4 w-full relative"
          onMouseEnter={() => setShowScroll(true)}
          onMouseLeave={() => setShowScroll(false)}
          onTouchStart={handleTouch} // Show buttons on touch (mobile)
        >
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 bg-gray-50 hover:bg-gray-200 shadow-md md:block transition-opacity duration-300 ${
              showScroll ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Package Container */}
          <div
            className="flex flex-nowrap overflow-x-auto scrollbar-hide "
            ref={scrollContainerRef}
            style={{ overflowY: 'hidden' }}
          >
            {packages &&
              packages
                .sort((a: any, b: any) => (a.price || 0) - (b.price || 0))
                .map((plan: DataType, i: any) => {
                  if (isNull(finalRates)) {
                    return;
                  }
                  const paa = plan.addons || [];
                  const isFirstPackage = i === 0;
                  const isLastPackage = i === packages.length - 1;
                  let price = plan.price ?? 0;

                  let id = plan.id;

                  let discounted = getPackagePrice({ discount: 0, duration, price });

                  let discountedPrice = discounted.price;

                  if (!isNull(rates)) {
                    discountedPrice = convertCurrency({
                      amount: parseFloat(String(discountedPrice || '0')),
                      rates,
                      fromCurrency: masterUserData?.defaultCurrency!,
                      toCurrency: currency?.currencyCode!,
                    });
                  }

                  const vc = cart.find((c) => plan.id === c?.productId);

                  return (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-[200px] sm:w-1/5 rounded-lg border border-gray-300 mx-2 sm:mx-0 ${
                        isLastPackage ? 'sm:rounded-r-lg sm:rounded-l-none' : 'sm:rounded-none'
                      } ${
                        isFirstPackage ? 'sm:rounded-l-lg sm:rounded-r-none' : 'sm:rounded-none'
                      } `}
                    >
                      <div className="flex flex-col h-full relative">
                        {/* "POPULAR" label should appear on the third item (index 2) */}
                        <span
                          className={`${
                            i === 2 ? 'block' : 'hidden'
                          } bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl`}
                        >
                          POPULAR
                        </span>

                        <div className="px-2 text-center h-48 flex flex-col items-center justify-center">
                          <div className="tracking-widest">{plan.title?.toUpperCase()}</div>
                          <div className="text-xl text-gray-900 font-bold leading-none mb-4 mt-2">
                            {plan.price || 0 > 0
                              ? curFormat(discountedPrice, currency.currencySymbol)
                              : ''}
                          </div>
                          <span className="text-xs text-red-600">
                            {price > 0 ? `For the next ${duration?.title}` : 'Free Forever'}
                          </span>
                        </div>

                        <div className="border-t border-gray-300 w-full">
                          <AddonList
                            addons={constantAddons}
                            siteAddons={plan.addons}
                            mode="details"
                          />
                        </div>
                        <div className="h-20 border-t border-gray-300 flex justify-center items-center px-2  flex-col space-y-4">
                          <div className="text-xs">
                            <RewardMilleDisplay
                              siteInfo={siteInfo}
                              auth={auth}
                              subTotal={discountedPrice}
                              rates={finalRates}
                              currency={currency.currencyCode ?? ''}
                            />
                          </div>
                          <div className="h-8 w-full">
                            <CustomButton
                              submitting={submitting && plan.id === id}
                              submittingText="Processing"
                              onClick={() => {
                                if (isNull(auth)) {
                                  toast.error('you must login first');
                                  setIsLoginOpen(true);
                                } else if (isNull(rates)) {
                                  toast.error('rates not yet loaded');
                                } else {
                                  if (vc) {
                                    setCartSidebarOpen(true);
                                  } else {
                                    setPlan(plan as any);
                                    onSubmit({ ...plan, price: discountedPrice });
                                  }
                                }
                              }}
                            >
                              {vc ? 'View Cart' : 'Subscribe'}
                            </CustomButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 bg-gray-50 hover:bg-gray-200 shadow-md md:block transition-opacity duration-300 ${
              showScroll ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {isModalVisible && (
        <ConfirmModal
          info="Are you sure you want to place this order?"
          onContinue={() => {
            setModalVisible(false);
            onSubmit(plan);
          }}
          onCancel={() => {
            setModalVisible(false);
          }}
          url=""
          headerText="Confirm Order"
        />
      )}

      {isLoginOpen && (
        <CustomDrawer
          direction="right"
          isWidthFull={true}
          isHeightFull={true}
          showHeader={true}
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          header="Login Page"
        >
          <ClientView
            params={['login']}
            paramSource={1}
            siteInfo={siteInfo}
            auth={auth}
            onCallback={(data: any) => {
              setUserData(data);
              setIsLoginOpen(false);
            }}
            table={'pages'}
            rates={finalRates}
          />
        </CustomDrawer>
      )}
    </div>
  );
};

export default memo(PricingPage);
