'use client';
import React, { Fragment, ReactNode, useEffect, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/cart_context';
import { FaShoppingCart } from 'react-icons/fa';
import CartDetails from '@/app/widgets/cart_details';
import { useBaseContext } from '@/app/contexts/base_context';
import { Search } from '@/app/widgets/search';
import { Logo } from '@/app/widgets/logo';
import { RaisedButton } from '@/app/widgets/widgets';
import { isNull } from '@/app/helpers/isNull';
import { CurSwitch } from '@/app/components/currency_switch';
import { boolean } from 'yup';
import clsx from 'clsx';
import CartButton from '@/app/src/cart_button';
import CustomDrawer from '@/app/src/custom_drawer';
import { login_page } from '@/app/src/constants';
import { isPWA } from '@/app/helpers/isPWA';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface NavbarProps {
  children?: ReactNode;
  showMenu?: boolean;
  siteInfo: BrandType;
  navigation: NavigationState[];
  profiles?: any[];
  type: string;
  showCartCompo?: boolean;
  user: UserTypes;
  auth: AuthModel;
  homeLink?: string;
  isWeb?: boolean;
}

const Header2 = ({
  type = 'home',
  showCartCompo = true,
  children,
  showMenu = true,
  siteInfo,
  navigation,
  profiles = [],
  user,
  auth,
  homeLink = '',
  isWeb = true,
}: NavbarProps) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const { cart, isCartSidebarOpen, toggleCartSidebar } = useCart();
  const { toggleIsSideBarOpen, isSideBarOpen } = useBaseContext();
  const [menu, setMenu] = useState<any[]>(navigation ?? []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const debouncedScroll = debounce(handleScroll, 50);
    window.addEventListener('scroll', debouncedScroll);
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, []);

  // Utility function for debounce
  function debounce(fn: (...args: any[]) => void, delay: number): (...args: any[]) => void {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  let logoLink = homeLink;
  if (isPWA()) {
    logoLink = login_page({ subBase: siteInfo.slug! });
  } else if (siteInfo.id != 'admin') {
    logoLink = homeLink;
  }

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  function navi(isMobile: boolean) {
    return (
      <>
        {menu
          .sort((a, b) => a.position - b.position) // Sort by the "position" key
          .map((item) => (
            <div key={item.name} className="py-1">
              <div
                className={classNames(
                  'text-gray-800 dark:text-white hover:bg-gray-400 hover:text-gray-100',
                  'rounded-md px-3 py-1.5 text-sm font-normal flex justify-between items-center cursor-pointer',
                )}
                onClick={() => toggleExpand(item.name)}
                aria-current={'page'}
              >
                {isMobile ? (
                  <div
                    key={item.name}
                    className="text-sm font-normal"
                    onClick={() => {
                      if (isNull(item.sub)) {
                        toggleIsSideBarOpen();
                      }
                    }}
                  >
                    <Link
                      as={item.href}
                      key={item.name}
                      href={item.href}
                      className="text-sm font-normal"
                    >
                      {item.name}
                    </Link>
                  </div>
                ) : (
                  <Link
                    as={item.href}
                    key={item.name}
                    href={item.href}
                    className="text-sm font-normal"
                  >
                    {item.name}
                  </Link>
                )}
                {item.sub &&
                  Array.isArray(item.sub) &&
                  (expandedItems.includes(item.name) ? (
                    <svg
                      width="10"
                      height="7"
                      viewBox="0 0 10 7"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        id="Vector"
                        d="M0.960449 1.30225L4.98025 5.32205L9.00006 1.30225"
                        stroke="#5A648C"
                        strokeWidth="1.37822"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.30225 0.960449L5.32205 4.98025L1.30225 9.00006"
                        stroke="#5A648C"
                        strokeWidth="1.37822"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  ))}
              </div>
              {item.sub && Array.isArray(item.sub) && expandedItems.includes(item.name) && (
                <div className="pl-4 py-1">
                  {item.sub
                    .sort((a: any, b: any) => a.position - b.position) // Sort sub items by "position" key
                    .map((sub_item: any) =>
                      isMobile ? (
                        <Link
                          onClick={toggleIsSideBarOpen}
                          key={sub_item.name}
                          href={sub_item.href}
                          className="block text-gray-800 dark:text-white hover:bg-gray-50 dark:bg-gray-9000 hover:text-gray-100 rounded-md px-3 py-2 text-sm font-normal"
                        >
                          {sub_item.name}
                        </Link>
                      ) : (
                        <Link
                          key={sub_item.name}
                          href={sub_item.href}
                          className="block text-gray-800 dark:text-white hover:bg-gray-50 dark:bg-gray-9000 hover:text-gray-100 rounded-md px-3 py-2 text-sm font-normal"
                        >
                          {sub_item.name}
                        </Link>
                      ),
                    )}
                </div>
              )}
            </div>
          ))}
      </>
    );
  }

  return (
    <>
      <div className={clsx('fixed w-full z-20 pb-4 transition-all duration-300')}>
        <div className={`mx-auto`}>
          <div className="relative flex h-12 items-center justify-between mx-2">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <RaisedButton
                size="md"
                color="auto"
                iconPosition="after"
                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleIsSideBarOpen}
              >
                {isSideBarOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </RaisedButton>
            </div>
            <div className="flex ml-10 flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <Logo brand={siteInfo} link={logoLink} />
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex space-x-4 pt-2 items-center justify-center">
              <div className="hidden w-full sm:block min-w-[60vh]">
                <Search />
              </div>

              {showCartCompo && <CurSwitch siteInfo={siteInfo} />}

              {navi(false)}

              {showCartCompo && (
                <CartButton
                  onClick={toggleCartSidebar}
                  href="/cart"
                  IconComponent={FaShoppingCart}
                  cartCount={cart.length}
                />
              )}
            </div>

            <div className="sm:hidden flex items-center justify-end flex-1 space-x-2">
              {showCartCompo && <CurSwitch siteInfo={siteInfo} />}
              {/* Mobile Cart Icon */}
              {showCartCompo && (
                <CartButton
                  onClick={toggleCartSidebar}
                  href="/cart"
                  IconComponent={FaShoppingCart}
                  cartCount={cart.length}
                />
              )}
            </div>
          </div>
          <div className="block lg:hidden md:hidden">
            <Search />
          </div>
        </div>

        <CustomDrawer
          direction="top"
          isWidthFull={true}
          isHeightFull={true}
          className="w-full sm:w-80 lg:w-64 xl:w-80"
          isOpen={isSideBarOpen}
          onClose={() => toggleIsSideBarOpen()}
          header="Menu"
        >
          <div className="mt-4 flex flex-col h-full">
            <div className="mb-8 mt-2">
              <Search />
            </div>
            <div className="overflow-y-auto scrollbar-hide-mobile mb-30"> {navi(true)}</div>
          </div>
        </CustomDrawer>
      </div>

      {children}
    </>
  );
};
export default Header2;
