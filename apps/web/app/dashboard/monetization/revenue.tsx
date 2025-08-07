'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api_withdraw_revenue } from '@/app/src/constants';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { modHeaders } from '@/app/helpers/modHeaders';
import { convertCurrency } from '@/app/helpers/convertCurrency';
import { curFormat } from '@/app/helpers/curFormat';
import { nearestMille } from '@/app/helpers/nearestMille';
import { nearestThousandBelow } from '@/app/helpers/nearestMille';
import HeaderColorCard from '@/app/src/color_card';
import { useCart } from '@/app/contexts/cart_context';
import { FaRotate } from 'react-icons/fa6';
import { ConfirmModal } from '@/app/widgets/confirm';
import { clearCache } from '@/app/actions';
import { CustomButton } from '@/app/widgets/custom_button';

export default function Monetization({
  params,
  user,
  siteInfo,
}: {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
}) {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [actionTitle, setActionTitle] = useState('Dashboard');

  const action = params.action;
  const base = params.base;

  useEffect(() => {
    if (action === 'withdraw') {
      setActionTitle('Withdraw Revenue');
    }
  }, [searchParams, action]);

  switch (action) {
    case 'withdraw':
      return <ConvertViews action={action} base={params.base} user={user} siteInfo={siteInfo} />;

    default:
      notFound();
  }
}

export function ConvertViews({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes;
  base: string;
  action: string;
}) {
  const [submitted, setSubmitted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [banks, setBanks] = useState<any[] | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const rates = {};
  const router = useRouter();
  const [info, setInfo] = useState<{
    earningPerMile: number;
    totalEarnings: number;
    finalEarnings: number;
  }>({
    earningPerMile: 0,
    totalEarnings: 0,
    finalEarnings: 0,
  });

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    const toastId = toast.loading('converting mille to cash');
    try {
      const formDataWithMultiple = {
        userId: user?.id!,
        brandId: siteInfo.id,
        userBrandId: user?.brand?.id,
        walletId: user?.wallet?.id!,
        canMonetize: user?.subscription?.canMonetize,
      };

      const url = await api_withdraw_revenue({
        subBase: siteInfo.slug!,
      });
      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formDataWithMultiple),
      });

      if (!response.ok) {
        console.error('Network response was not ok', response.statusText);
      }

      const res = await response.json();

      if (res.success) {
        await clearCache('user');
        await clearCache('brand');
        router.refresh();
        setSubmitted(true);
        toast.dismiss(toastId);
        toast.success(res.msg);
      } else {
        toast.dismiss(toastId);
        toast.error(res.msg);
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
      setSubmitted(false);
    } finally {
      setSubmitting(false);
      toast.dismiss(toastId);
    }
  };

  let bank_options: any[] = [];

  if (banks) {
    banks.forEach((item: any) => {
      bank_options.push({
        value: item.code,
        label: item.name,
      });
    });
  }

  const handleViewsRefresh = async () => {
    const toastId = toast.loading('refreshing');
    try {
      await clearCache('brand');
      await clearCache('user');
      router.refresh();
    } catch (error) {
    } finally {
      toast.dismiss(toastId);
    }
  };
  useEffect(() => {
    const process = () => {
      if (!rates || !user.defaultCurrency || !siteInfo.ownerData?.defaultCurrency) return;

      const earningPerMile = convertCurrency({
        amount: parseFloat(String(siteInfo.costPerMille || '0')),
        rates,
        fromCurrency: siteInfo.ownerData?.defaultCurrency!,
        toCurrency: user?.defaultCurrency!,
      });

      const totalEarnings = convertCurrency({
        amount: parseFloat(String((siteInfo.costPerUnit || 0) * (user.mille || 0) || '0')),
        rates,
        fromCurrency: siteInfo.ownerData?.defaultCurrency!,
        toCurrency: user?.defaultCurrency!,
      });

      const finalEarnings = convertCurrency({
        amount: parseFloat(
          String((siteInfo.costPerUnit ?? 0) * nearestThousandBelow(user.mille || 0) || '0'),
        ),
        rates,
        fromCurrency: siteInfo.ownerData?.defaultCurrency!,
        toCurrency: user?.defaultCurrency!,
      });

      setInfo({ earningPerMile, finalEarnings, totalEarnings });
    };

    process();
  }, [rates, siteInfo.id, user.id]);

  return (
    <>
      <div className="min-h-[120vh]">
        <div className="mt-10 m-2">
          <div className="m-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <HeaderColorCard
                title={`Current CPM`}
                className="h-full"
                footerText="changes periodically"
              >
                {curFormat(info.earningPerMile, user.currencyInfo?.currencySymbol)}
              </HeaderColorCard>
              <HeaderColorCard title={`Total Units`} className="h-full" footerText="all units">
                <div className="flex flex-row justify-between items-center w-full h-full">
                  <div>{(user.mille ?? 0).toFixed(0)}</div>

                  <CustomButton className="h-4 w-4" onClick={handleViewsRefresh}>
                    <FaRotate className="h-3 w-3" />
                  </CustomButton>
                </div>
              </HeaderColorCard>
              <HeaderColorCard
                title={`Total Earnings`}
                className="h-full"
                footerText="changes with CPM"
              >
                {curFormat(info.totalEarnings, user.currencyInfo?.currencySymbol)}
              </HeaderColorCard>
              <HeaderColorCard
                title={`Finalized Earnings`}
                className="h-full"
                footerText="changes with CPM"
              >
                <div className="flex flex-row justify-between items-center">
                  <div>{curFormat(info.finalEarnings, user.currencyInfo?.currencySymbol)}</div>
                  <div className="text-xs"> ({nearestMille(user.mille || 0)} mille)</div>
                </div>
              </HeaderColorCard>
            </div>

            <div className="flex justify-end mt-10 w-full">
              <div className="w-full sm:w-auto">
                <CustomButton onClick={() => setModalVisible(true)}>
                  Convert Mille To Cash
                </CustomButton>
              </div>
            </div>
          </div>
          {isModalVisible && (
            <ConfirmModal
              info={`convert ${nearestMille(
                user.mille ?? 0,
              )} mille at the current value of ${curFormat(
                info.earningPerMile,
                user.currencyInfo?.currencySymbol,
              )}/mille - (${curFormat(
                info.finalEarnings,
                user.currencyInfo?.currencySymbol,
              )} for ${nearestMille(user.mille ?? 0)} mille)`}
              onContinue={() => {
                setModalVisible(false);
                handleSubmit({});
              }}
              onCancel={() => {
                setModalVisible(false);
              }}
              url=""
              headerText="Confirm Mille Conversion"
            />
          )}
        </div>
      </div>
    </>
  );
}
