import React, { FC, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SectionHeader } from '@/app/src/section_header';
import { useRouter, useSearchParams } from 'next/navigation';
import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, CheckCircle2, ExternalLink, QrCode, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CustomBadge } from '@/app/widgets/widgets';

interface WalletPageProps {
  siteInfo: BrandType;
  user: UserTypes;
  params: any;
  currency: CurrencyType;
}

const WalletPage: FC<WalletPageProps> = ({ user, siteInfo, params, currency }) => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [action, setAction] = useState(params.action);
  const [actionTitle, setActionTitle] = useState('Dashboard');
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (action === 'trade') {
      setActionTitle('Trade Bitcoin (BTC)');
    }
  }, [searchParams, action]);

  if (isNull(currency)) {
    return;
  }

  let wallet = user.otherWallets?.find(
    (wa) => wa.identifier?.toLowerCase() === currency.currencyCode?.toLowerCase(),
  );

  const handleCopy = () => {
    if (wallet && wallet.address) {
      navigator.clipboard.writeText(wallet.address).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const getCryptoNetwork = (symbol: string) => {
    const network: Record<string, string> = {
      btc: 'BITCOIN',
      eth: 'ETH',
    };
    return network[symbol] || '';
  };

  const network = getCryptoNetwork(currency?.currencyCode?.toLowerCase() || '').toUpperCase();

  return (
    <SectionHeader title={actionTitle} style={3}>
      <div className="min-h-screen bg-background p-8">
        <Card className="brand-bg-card brand-text-card max-w-xl mx-auto shadow-lg border border-none">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Wallet className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{currency?.currencyName} Wallet</CardTitle>
            </div>
            <CardDescription className="text-center text-base">
              Start receiving funds in your {currency?.currencyName} wallet
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="details">Wallet Details</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card className="brand-bg-card brand-text-card bg-muted p-6 border border-none">
                  <CardTitle className="text-lg mb-4 flex items-center gap-2">
                    Wallet Address
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CustomBadge variant="outline" className="ml-2" text={network} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Network: {network}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>

                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="flex items-center justify-between gap-2 mb-2 group">
                        <code className="relative rounded bg-background px-[0.3rem] py-[0.2rem] font-mono text-sm flex-1 overflow-x-auto transition-colors group-hover:bg-primary/10">
                          {wallet?.address}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopy}
                          className="h-8 w-8 transition-all hover:scale-105"
                        >
                          {copySuccess ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>Click to copy wallet address</HoverCardContent>
                  </HoverCard>

                  {copySuccess && (
                    <Alert variant="default" className="mb-4">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>Address copied to clipboard!</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 p-4 bg-background rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Rate</span>
                      <span className="font-semibold">
                        {curFormat(currency.exchangeRate || 0, user.currencyInfo?.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="qr">
                <Card className="brand-bg-card brand-text-card p-6 flex flex-col items-center border border-none">
                  <div className="bg-white p-6 rounded-lg shadow-inner mb-4">
                    <QRCodeSVG
                      value={wallet?.address || ''}
                      size={200}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="Q"
                      className="rounded"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code to get the wallet address
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>

          <Separator className="my-2" />

          <CardFooter className="p-6">
            <div className="w-full flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Network Status</span>
              <CustomBadge variant="default" text={'Active'} />
            </div>
          </CardFooter>
        </Card>
      </div>
    </SectionHeader>
  );
};

export { WalletPage };
