import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import General from '@/dashboard/utility/general';
import { FaPaperPlane } from 'react-icons/fa';
import { CustomButton } from '@/app/widgets/custom_button';
import FormInput from '@/app/widgets/hook_form_input';
import CustomCard from '@/app/widgets/custom_card';
import { capitalize } from '@/app/helpers/capitalize';
import { convertCommaToArray } from '@/app/helpers/convertCommaToArray';
import { curFormat } from '@/app/helpers/curFormat';
import { extractAndFormatNumbers } from '@/app/helpers/extractAndFormatNumbers';
import { isNull } from '@/app/helpers/isNull';
import { flattenCondition } from '@/app/helpers/flattenCondition';
import { useCart } from '@/app/contexts/cart_context';
import { toast } from 'sonner';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { masterUserData } from '@/app/data/master';
import RewardMilleDisplay from '@/app/widgets/rewards';
import { Data } from '@/app/models/Data';
import { staticImage } from '@/app/utils/get_static_image';
import { useUserContext } from '@/app/contexts/user_context';

const validationSchema = Yup.object({
  spId: Yup.string().required('Please select a service provider'),
  productId: Yup.string().when('action', {
    is: (action: string) => action === 'data',
    then: (schema) => schema.required('Please select data plan'),
    otherwise: (schema) =>
      schema.when('action', {
        is: (action: string) => action === 'electric',
        then: (schema) => schema.required('Please choose meter type'),
        otherwise: (schema) =>
          schema.when('action', {
            is: (action: string) => action !== 'tv' && action !== 'betting',
            then: (schema) => schema.required('Please select a product'),
            otherwise: (schema) => schema.notRequired(),
          }),
      }),
  }),
  amount: Yup.mixed().when('action', (action: any, schema) => {
    if (action === 'electric') {
      return Yup.number()
        .typeError('Amount must be a number')
        .required('Amount is required')
        .min(1000, 'Amount must be at least 1000')
        .max(50000, 'Amount cannot exceed 50000');
    } else if (action === 'airtime') {
      return Yup.number()
        .typeError('Amount must be a number')
        .required('Amount is required')
        .min(50, 'Amount must be at least 50')
        .max(50000, 'Amount cannot exceed 50000');
    } else {
      return Yup.string();
    }
  }),

  customerIds: Yup.string()
    .when('action', {
      is: (action: string) => ['data', 'airtime'].includes(action),
      then: (schema) => schema.required('Please enter 11 digit mobile number or numbers'),
    })
    .when('action', {
      is: (action: string) => action === 'tv',
      then: (schema) => schema.required('Enter IUC number and validate it'),
    })
    .when('action', {
      is: (action: string) => action === 'electric',
      then: (schema) => schema.required('Enter meter number and validate it'),
    }),
});

export default function ServicesIndex({
  params,
  user,
  siteInfo,
  iniSps = [],
  wallets,
  iniParents,
  iniRates,
  auth,
}: {
  params: {
    action: string;
    base: string;
    seg1: string;
  };
  iniParents: ParentsInfo;
  iniRates: any;
  user: UserTypes;
  siteInfo: BrandType;
  iniSps: ServiceProviderTypes[];
  wallets: WalletTypes[];
  auth: AuthModel;
}) {
  const [isOkay, setIsOkay] = useState(true);
  const [error, setError] = useState('');
  const { essentialData } = useUserContext();
  const [formData, setFormData] = useState<OrderType>({});
  const { addToCart, setCartSidebarOpen, cart } = useCart();
  const [subTotal, setSubTotal] = useState(0);
  const methods = useForm<OrderType | any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      spId: '',
      productId: '',
      walletId: user?.wallet?.id ?? '',
      customerIds: ['data', 'aitrime'].includes(params.action)
        ? extractAndFormatNumbers(user?.phone || user?.auth?.phone || '')
        : '',
      customerId: user?.phone || user?.auth?.phone || '',
      subTotal: 0,
      price: 0,
      amount: 0,
      orderValue: 0,
      action: params.action,
    },
  } as any);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = methods;

  if (!isNull(errors)) {
    console.info(errors);
  }

  const amount = useWatch({ control: methods.control, name: 'amount' });
  const customerIds = useWatch({ control: methods.control, name: 'customerIds' });
  const spId = useWatch({ control: methods.control, name: 'spId' });
  const productId = useWatch({ control: methods.control, name: 'productId' });

  const convertedIds = convertCommaToArray(customerIds ?? ' ');
  const length = Math.max(convertedIds.length, 1);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Data[]>([]);
  const [sps, setSps] = useState<ServiceProviderTypes[]>([]);

  const rates = essentialData.rates ?? {};

  const { fetchData, refreshKey } = useDynamicContext();

  useLayoutEffect(() => {
    const getSpsData = async () => {
      try {
        let spsConditions = {};
        let sps_tag: string = ``;

        const result: any = await fetchData({
          table: 'service_providers',
          tag: sps_tag,
          conditions: spsConditions,
          limit: 1000,
          sortOptions: { index: -1 },
          brandSlug: siteInfo?.slug!,
        });

        if (!isNull(result)) {
          setSps(
            result.map((item: ServiceProviderTypes) => ({
              ...item,
              label: capitalize(item?.name!.replace(/_/g, ' ').replace(/-/g, ' ')),
              imagePath: staticImage(item?.id!) ?? '',
            })),
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const getProductsData = async () => {
      try {
        let productsConditions = { serviceType: 'utility' };
        let prds_tag: string = `${flattenCondition(productsConditions)}`;

        const result: any = await fetchData({
          table: 'products',
          tag: prds_tag,
          conditions: productsConditions,
          limit: 2000,
          sortOptions: {},
          brandSlug: siteInfo?.slug!,
        });

        if (!isNull(result)) {
          setProducts(
            result
              .filter((item: Data) => item.type === params.action && item.spId === spId)
              .map((item: Data) => ({
                ...item,
              })),
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getSpsData();
    getProductsData();
  }, [params.action, params.base, user.id, siteInfo.slug, spId, refreshKey]);

  const product: DataType = useMemo(() => {
    return products.find((p: Data) => p.id === productId) ?? {};
  }, [products, productId, params.action, params.base]);

  const orphanProduct: Data = useMemo(() => {
    if (products.length === 1) {
      return products[0];
    } else {
      return {} as Data;
    }
  }, [products]);

  const onSubmit = async (values: any) => {
    try {
      const ids = convertCommaToArray(
        customerIds ?? ' ',
        ['tv', 'electric'].includes(product?.type!) ? false : true,
      );

      let orderCurrencySymbol = '';
      let orderCurrency = '';
      let finalAmount = product.price ?? 0;

      if (product.priceMode === 'multiply') {
        finalAmount = (product.price ?? 0) * amount;
      }

      if (!isNull(user)) {
        orderCurrency = user?.currencyInfo?.currencyCode ?? '';
        orderCurrencySymbol = user?.currencyInfo?.currencySymbol ?? '';
      }

      const productCurrency = masterUserData?.defaultCurrency ?? '';

      if (isNull(ids)) {
        toast.error('No customer id found');
        return;
      }

      if (finalAmount < 30) {
        toast.error("amount can't be less than 30");
        return;
      }

      if (isNull(rates)) {
        toast.error('still loading rates try again');
        return;
      }

      ids.map((id, index) => {
        const orderId = `${Date.now()}-${index}`;
        const item: CartItem = {
          id: orderId,
          productId: values.productId,
          parentBrandId: product.parentBrandId,
          sellerId: siteInfo.id!,
          customerId: id,
          userId: auth.userId ?? '',
          title: `${product.title} for ${id}`,
          orderValue: amount,
          managers: [product?.userId ?? ''],
          amount: finalAmount,
          productPrice: product.price ?? values.amount,
          currency: productCurrency,
          orderCurrencySymbol,
          orderCurrency,
          symbol: masterUserData.defaultCurrencyCode ?? '',
          type: product.type!,
          slug: orderId,
          quantity: 1,
          others: {
            partner: product.partner,
          },
          planInfo: {},
          rates: {
            [orderCurrency.toUpperCase()]: rates[orderCurrency.toUpperCase()],
            [productCurrency.toUpperCase()]: rates[productCurrency.toUpperCase()],
          },
          sp: values.spId,
        };
        addToCart(item);
      });

      setCartSidebarOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('unable to place order, contact support');
    }
  };

  const handleProceedClick = async () => {
    const isValid = await trigger();

    if (isValid) {
      if (!isOkay) {
        toast.error('error occured try contacting us');
        console.error(error);
      } else {
        onSubmit(getValues());
      }
    } else {
      toast.error('some required data missing');
      console.info('some required data missing');
    }
  };

  useEffect(() => {
    const processValue = async () => {
      let userCurrencyInfo: any = user?.currencyInfo || {};
      const subtotal = parseFloat(String(product.price ?? 0)) * amount * length;

      if (product.priceMode === 'multiply') {
        handleChange('amount', amount);
      } else {
        handleChange('price', curFormat(subtotal, userCurrencyInfo?.currencySymbol));
        handleChange('amount', 1);
      }

      setSubTotal(subtotal);

      if (orphanProduct?.id && orphanProduct.available !== 0) {
        handleChange('productId', orphanProduct.id);
      }
    };

    processValue();
  }, [
    user,
    siteInfo,
    product,
    rates,
    spId,
    params,
    amount,
    customerIds,
    orphanProduct?.id,
    productId,
    length,
  ]);

  useEffect(() => {
    (Object.keys(formData) as (keyof OrderType)[]).forEach((key) => {
      setValue(key, formData[key]);
    });
  }, [formData, setValue]);

  const handleChange = (name: string, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-full py-2">
      <div className="m-1 h-full mb-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col sm:flex-row justify-betwee">
              <div className="w-full sm:w-2/3">
                <div className="flex flex-col space-y-4">
                  <General
                    siteInfo={siteInfo}
                    user={user}
                    products={products as any}
                    product={product as any}
                    sps={sps}
                    auth={auth}
                    wallets={wallets}
                    setValue={(name, value) => {
                      handleChange(name, value);
                      setValue(name, value);
                    }}
                    methods={methods}
                    params={params}
                    errors={errors}
                    setSubTotal={setSubTotal}
                  />
                </div>
              </div>
              <div className="w-full sm:w-2/6">
                <CustomCard title="Checkout">
                  <div className="flex flex-col space-y-5">
                    {['data', 'tv'].includes(params.action) ? (
                      <FormInput
                        labelClass="brand-bg"
                        onChange={() => {}}
                        showPrefix={false}
                        label={'Price'}
                        disabled={true}
                        id="price"
                        name="price"
                        type="text"
                      />
                    ) : (
                      <FormInput
                        controlled={false}
                        labelClass="brand-bg"
                        name="orderValue"
                        defaultValue="0"
                        onChange={() => {}}
                        onBlur={(e: any) => {
                          if (!isNull(e.target.value)) {
                            if (isNull(e.target.value) || Number(e.target.value) <= 0) {
                              handleChange('amount', 0);
                            } else {
                              handleChange('orderValue', Number(e.target.value));
                              handleChange('amount', Number(e.target.value));
                            }

                            const subtotal =
                              Number(e.target.value ?? 0) *
                              parseFloat(String(product.price ?? 1)) *
                              Math.max(length, 1);

                            handleChange('subTotal', subtotal);
                            setSubTotal(subtotal);
                          }
                        }}
                        label="amount"
                        id="orderValue"
                        type="number"
                        error={(errors as any).amount}
                      />
                    )}

                    <div className="flex flex-row justify-between h-10">
                      <div className="text-xs">Amount to pay</div>
                      <div>{curFormat(subTotal ?? 0, user.currencyInfo?.currencySymbol!)}</div>
                    </div>

                    <RewardMilleDisplay
                      siteInfo={siteInfo}
                      rates={rates}
                      subTotal={subTotal ?? 0}
                      auth={auth}
                      currency={user.defaultCurrency ?? 'NGN'}
                    />

                    <div className="h-full w-full sticky bottom-0">
                      <CustomButton
                        className="w-full"
                        onClick={() => {
                          handleProceedClick();
                        }}
                        submitting={false}
                        submitted={false}
                        submittingText="Submitting"
                        submittedText="processed"
                        iconPosition="after"
                        icon={<FaPaperPlane className="h-4 w-4" />}
                      >
                        Proceed
                      </CustomButton>
                    </div>
                  </div>
                </CustomCard>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
