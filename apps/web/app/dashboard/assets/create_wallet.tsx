import React, { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SectionHeader } from '@/app/src/section_header';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { modHeaders } from '@/app/helpers/modHeaders';
import { api_create_crypto_wallet } from '@/app/src/constants';

interface CreateWalletPageProps {
  siteInfo: BrandType;
  user: UserTypes;
  params: any;
  currency: CurrencyType;
  onSuccess: () => void;
}

const CreateWalletPage: FC<CreateWalletPageProps> = ({
  user,
  siteInfo,
  params,
  currency,
  onSuccess,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tradeType, setTradeType] = useState(searchParams.get('type') || 'btc');

  let wallet = user.otherWallets?.find((wa) => wa.identifier === currency.type);

  const handleCreateWallet = async () => {
    const toastId = toast.loading('Creating wallet...', {
      className: 'toast-center',
    });

    try {
      const body = {
        brandId: siteInfo.id!,
        type: tradeType,
        userId: user?.id!,
        currency: user?.defaultCurrency,
      };

      const url = await api_create_crypto_wallet({ subBase: siteInfo.slug! });

      const response = await (
        await fetch(url, {
          method: 'POST',
          headers: await modHeaders(),
          body: JSON.stringify(body),
        })
      ).json();

      if (response.status) {
        toast.success(response.msg);
        onSuccess();
      } else {
        toast.error(response.msg);
      }
    } catch (error) {
      console.error('Error creating crypto wallet', error);
      toast.error('Error creating crypto wallet');
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <SectionHeader title={''} style={3}>
      <div className="m-2">
        <Card className="brand-bg-card brand-text-card w-full border border-none">
          <CardHeader>
            <CardTitle className="text-center">Wallet Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="default" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No wallet found for {tradeType.toUpperCase()}</AlertDescription>
            </Alert>

            <div className="text-center">
              <Button onClick={handleCreateWallet} size="lg" className="w-full">
                Create Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionHeader>
  );
};

export { CreateWalletPage };
