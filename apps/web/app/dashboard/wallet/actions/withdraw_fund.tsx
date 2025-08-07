import React, { useEffect, useState } from 'react';
import CustomCard from '@/app/widgets/custom_card';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import FundSourcesWidget from '@/app/widgets/fund_source';
import FormInput from '@/app/widgets/hook_form_input';
import { calculateWithdrawalCharges } from '@/app/helpers/calculateWithdrawalCharges';
import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';
import { random_code } from '@/app/helpers/random_code';

import { CustomButton } from '@/app/widgets/custom_button';
import { FaPaperPlane } from 'react-icons/fa';
import { toast } from 'sonner';
import { modHeaders } from '@/app/helpers/modHeaders';
import { api_create_payment } from '@/app/routes/api_routes';
import { useRouter } from 'next/navigation';
import { activeSps } from '@/app/src/constants';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

export default function WithdrawFund({
  user,
  wallets,
  siteInfo,
}: {
  user: UserTypes;
  wallets: WalletTypes[];
  siteInfo: BrandType;
}) {
  const [data, setData] = useState<any>({ walletId: user?.wallet?.id });
  const [charges, setCharges] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [amountValue, setAmountValue] = useState(0);
  const [source, setSource] = useState<_FundSouces>();
  const [sources, setSources] = useState<_FundSouces[]>([]);
  const { refreshPage } = useDynamicContext();
  const router = useRouter();

  useEffect(() => {
    let sss: _FundSouces[] = [];
    if (!isNull(user?.fundSources) && user?.fundSources) {
      const ss = user?.fundSources?.filter((source) => source.type === 'bank_account');
      sss = ss;
      setSources(ss);
    }

    if (!isNull(sss) && sss) {
      let acc = sss.find((a) => a.accountNumber === user?.accountNumber);
      setSource(acc);
    }
  }, [user?.fundSources, user?.accountNumber]);

  const onSubmit = async (values: any) => {
    if (isNull(user) || isNull(user.id)) {
      toast.error('User not initialized');
      return;
    }

    if (!values.walletId || !values.amount || values.amount <= 0) {
      toast.error('Please provide a valid wallet and amount');
      return;
    }

    setSubmitting(true);

    try {
      const url = await api_create_payment({ subBase: siteInfo.slug });
      const referenceId = `${siteInfo.slug}-${random_code(10)}`;
      const charges = calculateWithdrawalCharges(values.amount);
      const amountToReceive = values.amount - charges;

      const formDataWith = {
        walletId: values.walletId,
        amount: values.amount,
        userId: user?.id!,
        email: user?.email,
        currency: user.defaultCurrency,
        name: `${user?.firstName} ${user?.lastName}`,
        type: 'debit',
        trnxType: 'withdrawal',
        gateway: 'wallet',
        status: 'pending',
        bankPaymentInfo: {
          accountName: source?.accountName ?? '',
          accountNumber: source?.accountNumber ?? '',
          bank: source?.bankCode,
        },
        referenceId,
        charges,
        amountToReceive,
        returnOnFail: true,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formDataWith),
      });

      if (!response.ok) {
        console.error('Network response was not ok');
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.msg);
        refreshPage(['payments', 'wallet', 'user', 'users']);
        setSubmitted(true);
      } else {
        toast.error(data.msg);
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

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="w-full sm:w-3/5">
        <CustomCard
          title="Withdraw Funds"
          topRightWidget={
            <SearchableSelect
              showSearch={false}
              name="wallet"
              label="Select Wallet"
              items={(wallets as any) ?? []}
              onSelect={(v: any) => {
                setData({ ...data, walletId: v });
              }}
              defaultValues={[user?.wallet?.id ?? '']}
            />
          }
        >
          <FundSourcesWidget
            user={user}
            sources={sources}
            setValue={(name, value) => {
              let acc = sources.find((a) => a.id === value || a.accountNumber === value);
              setSource(acc);
              setData({ ...data, [name]: value });
            }}
          />
        </CustomCard>
      </div>
      <div className="w-full sm:w-2/5">
        <CustomCard title="Action">
          <div className="flex flex-col space-y-4">
            <FormInput
              name="amount"
              label="Amount"
              type="number"
              controlled={false}
              onChange={(e) => {
                const amount = parseFloat(e.target.value) || 0;
                const aSps: any = activeSps;
                const charges = calculateWithdrawalCharges({
                  amount,
                  gateway: aSps?.payout,
                  currency: user?.currencyInfo?.id ?? '',
                });
                setCharges(charges);
                setAmountValue(amount);
                setData({ ...data, amount });
              }}
            />

            <div className="flex flex-row justify-between text-xs">
              <div>Charges</div>
              <div>{curFormat(charges, user?.currencyInfo?.currencySymbol)}</div>
            </div>
            <div className="flex flex-row justify-between text-xs">
              <div>Amount To Receive</div>
              <div>{curFormat(amountValue, user?.currencyInfo?.currencySymbol)}</div>
            </div>
            <CustomButton
              onClick={() => onSubmit(data)}
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
  );
}
