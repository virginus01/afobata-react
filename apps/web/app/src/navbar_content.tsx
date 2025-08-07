'use client';
import React, { Fragment, ReactNode, useEffect, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/cart_context';
import CartButton from '@/src/cart_button';
import { FaArrowDown, FaShoppingCart } from 'react-icons/fa';
import { useBaseContext } from '@/app/contexts/base_context';
import CustomDrawer from '@/src/custom_drawer';
import { Search } from '@/app/widgets/search';
import { login_page } from '@/src/constants';
import { Logo } from '@/app/widgets/logo';
import { RaisedButton } from '@/app/widgets/widgets';
import { isNull } from '@/app/helpers/isNull';
import { CurSwitch } from '@/app/components/currency_switch';
import { isPWA } from '@/helpers/isPWA';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface NavType {
  type?: 'view' | 'home';
  showMenu: boolean;
  siteInfo: BrandType;
  children?: ReactNode;
}

export const NavbarContent = ({ type = 'home', siteInfo, children, showMenu = true }: NavType) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const { cart, isCartSidebarOpen, toggleCartSidebar } = useCart();
  const { toggleIsSideBarOpen, isSideBarOpen } = useBaseContext();

  let logoLink = '/';
  if (isPWA()) {
    logoLink = login_page({ subBase: siteInfo.slug! });
  } else if (siteInfo.id != 'admin') {
    logoLink = `/${siteInfo.slug}`;
  }

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  function navi(isMobile: boolean) {
    return <></>;
  }

  return (
    <>
      <div
        className={`fixed w-full z-20 pb-4 transition-all duration-300 ${
          scrolled || isCartSidebarOpen
            ? 'bg-gray-50 dark:bg-gray-900 shadow lg:shadow-none'
            : 'bg-transparent'
        } ${
          type === 'home' &&
          "bg-[url('/images/beams-with.png')] dark:bg-none bg-no-repeat bg-cover bg-center bg-fixed"
        } `}
      >
        <div className="mx-auto">
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
              <div className="hidden w-full sm:block md:min-w-[30vh] sm:min-w-[60vh] min-w-[60vh]">
                <Search />
              </div>
              <CurSwitch siteInfo={siteInfo} />
              {navi(false)}
              <CartButton
                onClick={toggleCartSidebar}
                href="/cart"
                IconComponent={FaShoppingCart}
                cartCount={cart.length}
              />
            </div>

            <div className="sm:hidden flex items-center justify-end flex-1 space-x-2">
              <CurSwitch siteInfo={siteInfo} />
              {/* Mobile Cart Icon */}
              <CartButton
                onClick={toggleCartSidebar}
                href="/cart"
                IconComponent={FaShoppingCart}
                cartCount={cart.length}
              />
            </div>
          </div>
          <div className="block lg:hidden md:hidden md:min-w-[30vh] sm:min-w-[60vh] min-w-[60vh]">
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
    </>
  );
};
