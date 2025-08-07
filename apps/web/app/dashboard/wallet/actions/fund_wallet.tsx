import React, { useState, useEffect, useCallback } from 'react';
import PaymentOptions from '@/app/src/cart/payment_options';
import CustomCard from '@/app/widgets/custom_card';
import { api_query_payment, api_create_payment } from '@/app/routes/api_routes';
import { useRouter } from 'next/navigation';
import { modHeaders } from '@/app/helpers/modHeaders';
import { toast } from 'sonner';
import usePastack from '@/app/lib/payment_gateways/paystack';
import useFlutterwave from '@/app/lib/payment_gateways/flutterwave';
import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';
import { random_code } from '@/app/helpers/random_code';

import { useForm, FormProvider, useWatch } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '@/app/widgets/hook_form_input';
import { CustomButton } from '@/app/widgets/custom_button';
import { FaPaperPlane } from 'react-icons/fa';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

// Fixed validation schema - gateway is a string
const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .min(100, 'Amount must be at least 100')
    .max(50000, 'Amount must not exceed 50000'),
  walletId: Yup.string().required('Wallet is required'),
  gateway: Yup.string().required('Payment method is required'),
});

export default function FundWallet({
  user,
  wallets,
  siteInfo,
  params,
}: {
  user: UserTypes;
  wallets: WalletTypes[];
  siteInfo: BrandType;
  params: any;
}) {
  const { refreshPage } = useDynamicContext();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [responseData, setResponseData] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [amountValue, setAmountValue] = useState(0);
  const [charges, setCharges] = useState(0);
  const router = useRouter();
  const msgNoRef = React.useRef(0);
  const [paymentOption, setPaymentOption] = useState<PaymentOptionsType>({} as any);

  const methods = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      walletId: user?.wallet?.id,
      amount: 0,
      paymentMethod: '',
      gateway: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = methods;

  const amount = useWatch({ control: methods.control, name: 'amount' });

  useEffect(() => {
    setAmountValue(parseFloat(amount) || 0);
  }, [amount]);

  // Handle payment query without causing infinite renders
  const queryPayment = useCallback(async () => {
    if (!responseData) return;

    setResponseData(null);
    setPaymentData(null);

    const toastId = toast.loading('verifying payment');

    const url = await api_query_payment({ id: responseData.referenceId });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: await modHeaders('get'),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Error updating payment');
        return;
      }
      const res = await response.json();

      if (res.status) {
        msgNoRef.current++;
        refreshPage(['wallets', 'payments', 'user', 'users']);
        if (msgNoRef.current === 0) {
          toast.dismiss(toastId);
          toast.success(res.msg);
        }
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error('Update order error:', error);
    } finally {
      toast.dismiss(toastId);
    }
  }, [responseData, router]);

  // Use the callback in useEffect to prevent infinite loops
  useEffect(() => {
    queryPayment();
    return () => {
      msgNoRef.current = 0;
    };
  }, [queryPayment]);

  const handleOnCompleted = (response: any) => {
    setResponseData(response);
  };

  const handleOnClose = () => {
    setPaymentData(null);
    setSubmitted(false);
  };

  // Fixed onSubmit function to handle gateway as a string
  const onSubmit = async (values: any) => {
    if (isNull(user) || isNull(user.id)) {
      toast.error('User not initialized');
      return;
    }

    if (isNull(values.walletId)) {
      toast.error('Please Select A wallet');
      return;
    }

    if (isNull(values.gateway)) {
      toast.error('Please Select A payment method');
      return;
    }

    setSubmitting(true);

    try {
      const url = await api_create_payment({ subBase: siteInfo.slug });
      const referenceId = `${siteInfo.slug}-${random_code(10)}`;

      const formDataWith = {
        walletId: values.walletId,
        amount: values.amount,
        userId: user?.id!,
        email: user?.email,
        currency: user.defaultCurrency,
        name: `${user?.firstName} ${user?.lastName}`,
        type: 'none',
        trnxType: 'funding',
        gateway: paymentOption.sp,
        status: 'pending',
        referenceId,
        returnOnFail: true,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formDataWith),
      });

      if (!response.ok) {
        console.error('Network response was not ok');
        toast.error('Network error occurred');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setPaymentData(formDataWith);
        toast.success('Reference created');
        setSubmitted(true);
      } else {
        toast.error(data.msg || 'Failed to create payment reference');
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const paystackProps = usePastack({
    isOpen: paymentOption.sp === 'paystack' && submitted,
    channels: paymentOption.channels ?? ['bank_transfer'],
    data: { ...paymentData, subTotal: paymentData?.amount ?? 0 },
    onClose: handleOnClose,
    onCompleted: handleOnCompleted,
    siteInfo,
  });

  const flutterwaveProps = useFlutterwave({
    isOpen: paymentOption.sp === 'flutterwave' && submitted,
    data: { ...paymentData, subTotal: paymentData?.amount ?? 0 },
    onClose: handleOnClose,
    onCompleted: handleOnCompleted,
  });

  const handleProceedClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(onSubmit)();
    } else {
      toast.error('Please fill all required fields');
    }
  };

  let paymentOptions: PaymentOptionsType[] = [];

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-3/5">
              <CustomCard
                title="Fund Wallet"
                topRightWidget={
                  <>
                    <SearchableSelect
                      name="walletId"
                      onSelect={(e: any) => setValue('walletId', e)}
                      label={''}
                      id="walletId"
                      items={(wallets as any) || []}
                      defaultValues={[watch('walletId')]}
                    />
                  </>
                }
              >
                <PaymentOptions
                  setValue={setValue}
                  user={user}
                  cart={[]}
                  orderCurrencies={[
                    {
                      currency: user.currencyInfo?.currencyCode,
                      symbol: user.currencyInfo?.currencySymbol,
                    },
                  ]}
                  additionalOptions={paymentOptions}
                  subTotal={watch('amount')}
                  paymentOption={paymentOption}
                  setPaymentOption={(data) => {
                    setPaymentOption(data);
                  }}
                />

                {errors?.gateway?.message && (
                  <div className="text-red-700 text-xs pl-4 py-5">
                    {String(errors?.gateway?.message)}
                  </div>
                )}
              </CustomCard>
            </div>

            <div className="w-full sm:w-2/5">
              <CustomCard title="Action">
                <div className="flex flex-col space-y-4">
                  <FormInput name="amount" label="Amount" type="number" />

                  <div className="flex flex-row justify-between text-xs">
                    <div>Charges</div>
                    <div>{curFormat(charges, user?.currencyInfo?.currencySymbol)}</div>
                  </div>
                  <div className="flex flex-row justify-between text-xs">
                    <div>Amount To Receive</div>
                    <div>{curFormat(amountValue, user?.currencyInfo?.currencySymbol)}</div>
                  </div>
                  <CustomButton
                    onClick={() => handleProceedClick()}
                    submitting={submitting}
                    submitted={submitted}
                    submittingText="Submitting"
                    buttonText="Proceed"
                    iconPosition="after"
                    icon={<FaPaperPlane />}
                  />
                </div>
              </CustomCard>
            </div>
          </div>
        </form>
      </FormProvider>
      {submitted && paymentOption.sp === 'paystack' && paystackProps}
      {submitted && paymentOption.sp === 'flutterwave' && flutterwaveProps}
    </>
  );
}
