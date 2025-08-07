import { FaArrowLeft, FaSave, FaShoppingCart, FaTimes } from 'react-icons/fa';
import CartButton from '@/src/cart_button';
import { useCart } from '@/app/contexts/cart_context';
import CustomHeader from '@/app/widgets/custom_header';
import { Capacitor } from '@capacitor/core';
import { ExternalLink } from 'lucide-react';
import CustomLink from '@/src/custom_link';
import Action from '@/app/dashboard/action';
import Image from 'next/image';
import IconButton from '@/app/widgets/icon_button';
import { getImgUrl } from '@/helpers/getImgUrl';
import { useUserContext } from '@/app/contexts/user_context';
import { memo } from 'react';

interface OnNavRouteProps {
  isOpen: boolean;
  user: UserTypes;
  data: any;
  siteInfo: BrandType;
  auth: AuthModel;
  base: string;
  action: string;
  searchParams?: Record<string, string>;
  seg1?: string;
  type?: string;
  slug?: string;
  isFull?: boolean;
  isWidthFull?: boolean | 'auto';
  isHeightFull?: boolean;
  className?: string;
  onClose: () => void;
  rates?: any;
  handleSaveAndClose?: () => void;
  header: string;
  showCloseButton?: boolean;
  showSaveButton?: boolean;
  showHeader?: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  defaultData?: any;
  silverImage?: string;
  hideScroll?: boolean;
  hideFooter?: boolean;
}

const OnNavRoute: React.FC<OnNavRouteProps> = ({
  isOpen,
  user,
  siteInfo,
  rates,
  auth,
  base,
  action,
  silverImage = '',
  searchParams = {},
  seg1,
  type,
  onClose,
  header,
  isFull = false,
  isWidthFull = false,
  className = '',
  isHeightFull = false,
  direction = 'right',
  showCloseButton = true,
  showSaveButton = false,
  showHeader = true,
  slug,
  data,
  defaultData,
  hideScroll,
  hideFooter,
}) => {
  const isLeft = direction === 'left';
  const isRight = direction === 'right';
  const isTop = direction === 'top';
  const isBottom = direction === 'bottom';
  const { toggleCartSidebar, cart } = useCart();
  const { essentialData } = useUserContext();

  let showSilver = silverImage && Capacitor.isNativePlatform();
  let showHeaderImage = silverImage && !showSilver;

  return (
    <div
      className={`fixed top-0 ${!isHeightFull && 'sm:top-[8vh]'} ${
        isWidthFull === 'auto'
          ? `${isLeft ? 'left-0' : 'right-0'} bottom-0 w-full h-full z-40 sm:w-4/5`
          : isWidthFull || isFull
            ? 'right-0 left-0 bottom-0 w-full h-full z-40'
            : `${isLeft ? 'left-0' : 'right-0'} w-10/12 sm:w-2/5 h-full`
      } bg-gray-100 ${showSilver && 'bg-gray-transparent'}  dark:bg-gray-900 transform ${
        isOpen
          ? 'translate-x-0 translate-y-0'
          : isLeft
            ? '-translate-x-full'
            : isRight
              ? 'translate-x-full'
              : isTop
                ? '-translate-y-full'
                : 'translate-y-full'
      } transition-transform duration-300 ease-in-out z-40 w-64 ${
        isLeft || isRight
          ? `${isLeft ? 'left-0' : 'right-0'} top-0 bottom-0`
          : `${isTop ? 'top-0' : 'bottom-0'} left-0 right-0`
      }
        
        `}
    >
      {showSilver && (
        <div className="absolute inset-0">
          <Image
            src={getImgUrl({
              id: silverImage ?? '',
              height: 500,
              width: 500,
            })}
            alt="Background"
            objectFit="cover"
            className="z-[-1] h-48 w-full"
            width={500}
            height={500}
            style={{
              filter: 'brightness(0.5)',
            }}
          />
        </div>
      )}

      <div className={`flex flex-col h-full`}>
        {showHeader && (
          <div className={showSilver ? 'h-48 pt-6 pb-44 text-gray-100 font-bold' : 'font-bold'}>
            <CustomHeader silverImage={showHeaderImage ? silverImage : ''}>
              <div
                className={`flex flex-row justify-between items-center  w-full py-2 px-1 ${
                  !Capacitor.isNativePlatform() && 'border-b sm:border border-gray-300'
                }`}
              >
                <div className="flex flex-row justify-between items-center w-full">
                  <IconButton
                    bordered={false}
                    size="sm"
                    className={!(showSilver || showHeaderImage) ? 'text-gray-700' : ''}
                    color="auto"
                    icon={<FaArrowLeft />}
                    iconPosition="before"
                    onClick={onClose}
                  >
                    back
                  </IconButton>
                  <div className="text-md font-bold ml-5 flex flex-row justify-between flex-grow w-full">
                    {header}{' '}
                    {!navigator.onLine && (
                      <div className="ml-auto flex items-center gap-1 text-red-600 font-bold text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-red-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        <span>Offline</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row justify-between mx-3 items-center space-x-3">
                  <div className="block sm:hidden">
                    <CartButton
                      onClick={toggleCartSidebar}
                      href=""
                      IconComponent={FaShoppingCart}
                      cartCount={cart.length}
                    />
                  </div>
                  {slug && (
                    <>
                      <CustomLink href={slug} target="_blank" className="h-6 w-6">
                        <ExternalLink />
                      </CustomLink>
                    </>
                  )}
                </div>
              </div>
            </CustomHeader>
          </div>
        )}

        <div
          className={`${!hideScroll && 'overflow-y-auto '} scrollbar-hide-mobile sm:border-l sm:border-gray-300`}
        >
          <Action
            iniSearchParams={searchParams}
            status={searchParams.status}
            navigation={essentialData.nav ?? {}}
            action={action}
            base={base}
            seg1={siteInfo.slug!}
            type={type}
            rates={rates}
            defaultData={defaultData}
            className={className}
            silverImage={silverImage}
            hideFooter={hideFooter}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(OnNavRoute);
