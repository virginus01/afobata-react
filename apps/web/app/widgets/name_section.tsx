import React, { useState } from 'react';
import { RaisedButton } from '@/app/widgets/raised_button';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useBaseContext } from '@/app/contexts/base_context';
import { useRouter } from 'next/navigation';
import { route_user_page } from '@/app/src/constants';
import { toast } from 'sonner';
import { Shimmer } from '@/app/widgets/shimmer';
import { CustomBadge } from '@/app/widgets/badge';
import Link from 'next/link';
import { CustomButton } from '@/app/widgets/custom_button';
import { Rocket } from 'lucide-react';
import { curFormat } from '@/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';

interface NameSectionProps {
  user: UserTypes | null;
  siteInfo: BrandType;
}

export const NameSection: React.FC<NameSectionProps> = ({ user, siteInfo }) => {
  const [brandLink, setBrandLink] = useState('');
  const router = useRouter();
  const { addRouteData, setIsSideBarOpen } = useBaseContext();

  return (
    <div className="border-b-2 border-gray-200 ">
      <div className="my-2 p-2">
        <div className="flex flex-col space-y-5">
          <div>
            {user?.brand && siteInfo.type === 'creator' ? (
              <div className="flex flex-row justify-between items-center mr-2">
                <div className="text-xs font-bold">{user.brand.name || <Shimmer height="5" />}</div>
                {user.brand.slug ? (
                  <Link href={brandLink} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt className="inline ml-1" />
                  </Link>
                ) : (
                  <Shimmer height="5" />
                )}
              </div>
            ) : (
              <div>
                {user ? (
                  <>
                    {user.firstName} {user.lastName}
                  </>
                ) : (
                  <Shimmer height="5" />
                )}
              </div>
            )}

            {/* UID and Wallet value with shimmer */}
            <div className="flex flex-row justify-between">
              <div className="text-xs my-2">UID: {user ? user.id : <Shimmer height="5" />}</div>
              <div className="text-xs my-2 mr-2">
                {user ? (
                  curFormat(user?.wallet?.value || 0, user.currencyInfo?.currencySymbol)
                ) : (
                  <Shimmer height="5" />
                )}
              </div>
            </div>

            {/* Conditional display for Creator type with BID and Revenue Wallet shimmer */}
            {siteInfo.type === 'creator' && !isNull(user?.brand) && (
              <>
                <div className="flex flex-row justify-between">
                  <div className="text-xs my-2">
                    BID: {user?.brand?.id || <Shimmer height="5" />}
                  </div>
                  <div className="text-xs my-2 mr-2">
                    {user?.wallet ? (
                      curFormat(user.wallet.shareValue || 0, user.currencyInfo?.currencySymbol)
                    ) : (
                      <Shimmer height="5" />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Subscription section with targeted shimmer */}
          {siteInfo.type === 'creator' && (
            <div className="flex flex-row justify-between space-x-2 items-center h-7">
              <CustomBadge
                text={user?.subscription?.title ?? 'No Plan'}
                size="xs"
                filled="primary"
                className="h-full whitespace-nowrap rounded-md text-xs sm:text-sm w-auto"
              />
              {(user?.subscription?.level || 1) < 4 ? (
                <div className="text-xs h-7">
                  <CustomButton
                    onClick={() => {
                      setIsSideBarOpen(false);
                      addRouteData({
                        isOpen: true,
                        id: 'subscription',
                        href: route_user_page({
                          subBase: siteInfo?.slug!,
                          action: 'index',
                          base: 'index',
                        }),
                        type: 'user',
                        position: 1,
                        action: 'index',
                        base: 'subscription',
                        title: 'Subscription',
                        searchParams: { type: 'user' },
                        isHeightFull: 'yes',
                        isWidthFull: 'yes',
                        hideScroll: true,
                        hideFooter: true,
                      });
                    }}
                    icon={<Rocket className="w-3 h-3" />}
                  >
                    Upgrade
                  </CustomButton>
                </div>
              ) : (
                <div className="text-xs">
                  <RaisedButton
                    color="primary"
                    size="auto"
                    onClick={() => {
                      toast.info("You're in the highest package");
                    }}
                  >
                    Active
                  </RaisedButton>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NameSection;
