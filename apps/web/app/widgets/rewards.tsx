import React from 'react';
import { isNull } from '@/app/helpers/isNull';
import { getRewardMille } from '@/app/helpers/getRewardMille';

type RewardMilleDisplayProps = {
  siteInfo: BrandType;
  auth: UserTypes;
  subTotal: number | null;
  rates: any;
  currency: string;
};

const RewardMilleDisplay: React.FC<RewardMilleDisplayProps> = ({
  siteInfo,
  auth,
  subTotal,
  rates,
  currency,
}) => {
  if (isNull(auth) || isNull(rates) || isNull(currency)) return;

  return (
    <div className="flex justify-between items-center w-full h-full whitespace-nowrap space-x-4">
      <div className="text-xs">Reward Mille:</div>
      <div className="text-xs text-right">
        {!isNull(auth)
          ? `${getRewardMille({
              amount: subTotal ?? 0,
              rates,
              currency,
            })} pts`
          : 'not logged'}
      </div>
    </div>
  );
};

export default RewardMilleDisplay;
