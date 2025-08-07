'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { api_get_banks } from '@/app/routes/api_routes';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { isNull } from '@/app/helpers/isNull';
import { lowercase } from '@/app/helpers/lowercase';
import { useBaseContext } from '@/app/contexts/base_context';
import { api_get_payments } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useRouter } from 'next/navigation';
import { WalletHistory } from '@/dashboard/wallet/wallet_history';
import FundWallet from '@/dashboard/wallet/actions/fund_wallet';
import WithdrawFund from '@/dashboard/wallet/actions/withdraw_fund';
import BankDetails from '@/dashboard/wallet/actions/bank_details';
import TransferFund from '@/dashboard/wallet/actions/transfer_fund';

const validationSchema = Yup.object({
  amount: Yup.number().when('action', {
    is: (action: string) => action === 'fund-wallet',
    then: (schema) =>
      schema
        .required('amount is required')
        .min(100, 'Amount must be at least 100')
        .max(5000, 'Amount must not exceed 5000'),
    otherwise: (schema) =>
      schema.when('action', {
        is: (action: string) => action === 'withdraw-fund',
        then: (schema) =>
          schema
            .required('amount is required')
            .min(100, 'Amount must be at least 100')
            .max(20000, 'Amount must not exceed 20000'),
      }),
  }),

  wallet: Yup.string().when('action', {
    is: (action: string) => action === 'fund-wallet' || action === 'withdraw-fund',
    then: (schema) => schema.required('Wallet is required is required'),
  }),

  paymentMethod: Yup.string().when('action', {
    is: (action: string) => action === 'fund-wallet',
    then: (schema) => schema.required('Payment method is required'),
  }),

  accountNumber: Yup.string().when('action', {
    is: (action: string) => action === 'add-bank',
    then: (schema) => schema.required('Please enter 10 digit account numbers'),
  }),

  bankCode: Yup.string().when('action', {
    is: (action: string) => action === 'add-bank',
    then: (schema) => schema.required('please select bank'),
  }),

  transferType: Yup.string().when('action', {
    is: (action: string) => action === 'transfer-fund',
    then: (schema) => schema.required('Please select a transfer type'),
  }),

  walletFrom: Yup.string().when('action', {
    is: (action: string) => action === 'transfer-fund',
    then: (schema) => schema.required('Please select a wallet to transfer from'),
  }),

  walletTo: Yup.string().when('action', {
    is: (action: string) => action === 'transfer-fund',
    then: (schema) => schema.required('Please select a wallet to transfer to'),
  }),
});

export default function WalletIndex({
  params,
  siteInfo,
  user,
  wallets,
}: {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
  wallets: WalletTypes[];
}): React.ReactElement | null {
  const [submitted, setSubmitted] = useState(false);
  const [initialRows, setInitialRows] = useState<any[]>([]);
  const [actionTitle, setActionTitle] = useState('Dashboard');
  const [action, setAction] = useState(params.action);
  const [banks, setBanks] = useState<any[] | null>(null);
  const [formData, setFormData] = useState<walletPageTypes>({});
  const [customerNameValidated, setCustomerNameValidated] = useState(false);

  const methods = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      amount: 0,
      accountNumber: user.accountNumber,
      bankCode: user.bankCode,
      paymentMethod: 'paystack',
      customerName: user.accountName,
      bvn: '****',
      action: action,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = methods;

  const columns: string[] = ['ID', 'Type', 'Amount', 'Status', 'Date'];

  useEffect(() => {
    async function getPayments() {
      try {
        const url = await api_get_payments({
          userId: user?.id!,
          subBase: siteInfo.slug,
          orderStatus: '',
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('post'),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const res = await response.json();

        if (res.status) {
          const newRows = res.data.map((item: any) => {
            let pType = '';

            switch (item.type) {
              case 'withdrawal':
                pType = `withdrawal (${item.trnxType})`;
                break;

              default:
                pType = `${item.type} (${item.trnxType})`;
                break;
            }

            const amount = formatCurrency(item.amount, 'NGN', 0, 'en-NG');

            return [item.id, pType, amount, item.status, item.createdAt];
          });
          setInitialRows(newRows);
        } else {
          setInitialRows([]);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    }

    if (action === 'history' && !isNull(user)) {
      getPayments();
    }
  }, [user, action, siteInfo.slug]);

  useEffect(() => {
    switch (action) {
      case 'fund-wallet':
        setActionTitle('Fund Wallet');
        break;
      case 'add-bank':
        setActionTitle('Add Bank Details');
        break;
      case 'withdraw-fund':
        setActionTitle('Withdraw Funds');
        break;
      case 'history':
        setActionTitle('Payment Transaction History');
        break;
      case 'transfer-fund':
        setActionTitle('Fund Transfer');
        break;
      default:
        break;
    }
  }, [action]);

  useEffect(() => {
    setAction(params.action);
  }, [params.action]);

  useEffect(() => {
    (Object.keys(formData) as (keyof walletPageTypes)[]).forEach((key) => {
      setValue(key, formData[key]);
    });
  }, [formData, setValue]);

  useEffect(() => {
    if (user) {
      handleSelectChange({
        target: { name: 'customerName', value: user.accountName },
      } as React.ChangeEvent<HTMLSelectElement>);
    }
  }, [user, wallets, setValue]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubmitted(false);
    setCustomerNameValidated(false);
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const getBanks = async () => {
      try {
        const url = await api_get_banks({});

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(response.statusText);
          toast.error('error getting banks');
          return;
        }

        const res = await response.json();

        if (res.status && !isNull(res.data)) {
          setBanks(res.data);
        }
      } catch (error) {
        console.error(error as string);
      }
    };

    getBanks();
  }, [siteInfo.id]);

  let bank_options: any[] = [];

  if (banks) {
    banks.forEach((item: any) => {
      bank_options.push({
        value: item.code,
        label: item.name,
      });
    });
  }

  let paymentOptions: PaymentOptionsType[] = [];

  if (lowercase(user.defaultCurrency ?? '') === 'ngn') {
    paymentOptions.push({
      name: 'va',
      label: 'Virtual Account',
      desc: 'Transfer only',
      disabled: false,
      sp: 'wallet',
    });
  }

  return (
    <>
      <div className="">
        {action === 'history' ? (
          <WalletHistory
            product_type={action}
            actionTitle={actionTitle}
            initialRows={[]}
            columns={[]}
          />
        ) : (
          <>
            {action === 'fund-wallet' && (
              <FundWallet user={user} wallets={wallets} siteInfo={siteInfo} params={params} />
            )}
            {action === 'withdraw-fund' && (
              <WithdrawFund user={user} wallets={wallets} siteInfo={siteInfo} />
            )}
            {action === 'bank-details' && (
              <BankDetails user={user} siteInfo={siteInfo} banks={banks ?? []} />
            )}
            {action === 'transfer-fund' && <TransferFund user={user} wallets={wallets} />}
          </>
        )}
      </div>
    </>
  );
}
