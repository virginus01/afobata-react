'use client';

import HeaderColorCard from '@/app/src/color_card';

import { nearestMille } from '@/app/helpers/nearestMille';
import { curFormat } from '@/app/helpers/curFormat';
import { FaExchangeAlt, FaWallet } from 'react-icons/fa';
import { revenue_page, wallet_page } from '@/app/routes/page_routes';
import { UtilityFeatures } from '@/app/special_widgets/utility_features';
import { CustomBadge, CustomButton } from '@/app/widgets/widgets';
import { useBaseContext } from '@/app/contexts/base_context';

export function General({
  children,
  user,
  siteInfo,
  auth,
}: {
  user: UserTypes;
  siteInfo: BrandType;
  auth: AuthModel;
  children: React.ReactNode;
}) {
  const { addRouteData } = useBaseContext();

  return (
    <div className="flex flex-col space-y-6 h-full p-1 rounded my-5">
      <div>
        Hi {user?.firstName} {user?.lastName}, Welcome
        {siteInfo.name ? ' to' : ''} {siteInfo.name}
      </div>

      <div className="flex flex-row space-x-3 overflow-x-auto scrollbar-hide w-full">
        <div className="h-32 w-52 lg:w-[30%] sm:h-full flex-shrink-0">
          <HeaderColorCard
            title={`Wallet`}
            rightWidget={
              <div className="h-6 w-6 py-1">
                <CustomButton
                  onClick={() => {
                    addRouteData({
                      isOpen: true,
                      action: 'fund-wallet',
                      base: 'wallet',
                      name: 'Fund Wallet',
                      title: 'Fund Wallet',
                      slug: wallet_page({
                        action: 'fund-wallet',
                        subBase: siteInfo.slug!,
                      }),
                    });
                  }}
                >
                  <FaWallet className="h-3 w-3" />
                </CustomButton>
              </div>
            }
          >
            <div className="flex flex-row justify-between w-full h-full text-xs">
              <div className="">
                {curFormat(user?.wallet?.value || 0, user.currencyInfo?.currencySymbol)}
              </div>
            </div>
          </HeaderColorCard>
        </div>
        <div className="h-32 w-52 lg:w-1/3 sm:h-full flex-shrink-0">
          <HeaderColorCard
            title={`Mille`}
            rightWidget={
              <div className="h-6 w-6 py-1">
                <CustomButton
                  onClick={() => {
                    addRouteData({
                      isOpen: true,
                      action: 'withdraw',
                      type: 'blog',
                      base: 'revenue',
                      slug: `${revenue_page({
                        subBase: siteInfo.slug!,
                        action: 'withdraw',
                        type: 'blog',
                      })}`,
                    });
                  }}
                >
                  <FaExchangeAlt className="h-3 w-3" />
                </CustomButton>
              </div>
            }
          >
            <div className="flex flex-row justify-between w-full h-full text-xs">
              <div> {nearestMille(user.mille ?? 0)}</div>
              <div>({(user.mille ?? 0).toFixed()})</div>
            </div>
          </HeaderColorCard>
        </div>
        <div className="h-32 w-52 lg:w-1/3 sm:h-full flex-shrink-0">
          <HeaderColorCard title={`Status`}>
            <div className="flex flex-row justify-between items-center text-xs py-1">
              <div className="mr-2">active</div>{' '}
              <CustomBadge text={user.selectedProfile} size="xs" />
            </div>
          </HeaderColorCard>
        </div>
      </div>
      {children}
      <div>
        <div className="font-bold my-5 mx-1">Services</div>
        <UtilityFeatures siteInfo={siteInfo} user={user} auth={auth} />
      </div>
    </div>
  );
}
