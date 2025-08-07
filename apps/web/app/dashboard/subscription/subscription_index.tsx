import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { useUserContext } from '@/app/contexts/user_context';
import ClientView from '@/app/views/client_view';
import React from 'react';

const SubscriptionIndex = ({
  params,
  siteInfo = {},
  user,
  wallets,
}: {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
  wallets: WalletTypes[];
}) => {
  const { refreshPage } = useDynamicContext();
  const { essentialData } = useUserContext();
  return (
    <div className="overflow-hidden">
      <ClientView
        params={['pricing']}
        siteInfo={siteInfo}
        auth={user?.auth ?? {}}
        rates={essentialData.rates ?? {}}
        table={''}
        onCallback={() => {
          refreshPage(['user'], true);
        }}
      />
    </div>
  );
};

export default SubscriptionIndex;
