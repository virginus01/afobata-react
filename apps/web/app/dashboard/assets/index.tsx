'use client';

import React, { useEffect, useState } from 'react';
import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';
import { useCart } from '@/app/contexts/cart_context';
import { Card } from '@/components/ui/card';
import CustomDrawer from '@/app/src/custom_drawer';
import { WalletPage } from '@/dashboard/assets/wallet_page';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateWalletPage } from '@/dashboard/assets/create_wallet';

export default function AssetIndex({
  params,
  siteInfo,
  user,
  type,
}: {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
  type: string;
}): React.ReactElement | null {
  const { currencies } = useCart();
  const [cCurrency, setCCurrency] = useState<CurrencyType | null>(null);
  const [isCurrencyBarOpen, setIsCurrencyBarOpen] = useState(false);
  const [isCreateWalletPageOpen, setIsCreateWalletPageOpen] = useState(false);

  let cryptos = currencies?.filter((crypto) => crypto.type === 'crypto');
  const getCryptoImage = (symbol: string) => {
    const images: Record<string, string> = {
      btc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/96px-Bitcoin.svg.png',
      eth: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/96px-Ethereum-icon-purple.svg.png',
    };
    return images[symbol] || '/api/placeholder/96/96';
  };

  return (
    <>
      <div className="w-full">
        <div className="p-4 space-y-2">
          {cryptos.map((crypto, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className="p-4 hover:bg-accent cursor-pointer transition-colors w-full h-full border border-none"
                    onClick={() => {
                      setCCurrency(crypto);

                      let wallet = user.otherWallets?.find(
                        (wa) =>
                          wa.identifier?.toLowerCase() === crypto?.currencyCode?.toLowerCase() ||
                          '',
                      );

                      if (isNull(wallet)) {
                        setIsCreateWalletPageOpen(true);
                      } else {
                        setIsCurrencyBarOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-8 w-8">
                          <Image
                            src={getCryptoImage(crypto.currencyCode!.toLowerCase())}
                            alt={crypto.currencyCode!}
                            fill
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{crypto.currencyName}</h3>
                          <p className="text-sm text-muted-foreground">{crypto.currencyCode!}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex flex-row items-center justify-between">
                          <div className="font-medium">
                            {curFormat(crypto.exchangeRate || 0, user.currencyInfo?.currencySymbol)}
                            /USD
                          </div>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="right" className="p-4 space-y-2">
                  <div className="font-medium">{crypto.currencyName} Details</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span>
                      {curFormat(crypto.exchangeRate || 0, user.currencyInfo?.currencySymbol)}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {isCurrencyBarOpen && (
        <CustomDrawer
          direction="right"
          isWidthFull={true}
          showHeader={true}
          isHeightFull={true}
          isOpen={isCurrencyBarOpen}
          onClose={() => setIsCurrencyBarOpen(false)}
          header={cCurrency?.currencyName || ''}
        >
          <WalletPage siteInfo={siteInfo} user={user} params={params} currency={cCurrency || {}} />
        </CustomDrawer>
      )}

      {isCreateWalletPageOpen && (
        <CustomDrawer
          direction="right"
          isWidthFull={false}
          showHeader={true}
          isHeightFull={true}
          isOpen={isCreateWalletPageOpen}
          onClose={() => setIsCreateWalletPageOpen(false)}
          header={cCurrency?.currencyName || ''}
        >
          <CreateWalletPage
            siteInfo={siteInfo}
            user={user}
            params={params}
            currency={cCurrency || {}}
            onSuccess={() => {
              setIsCreateWalletPageOpen(false);
              setIsCurrencyBarOpen(true);
            }}
          />
        </CustomDrawer>
      )}
    </>
  );
}
