'use client';
import Link from 'next/link';
import { Logo } from '@/app/widgets/logo';
import { useTranslations } from 'next-intl';
import { useBaseContext } from '@/app/contexts/base_context';
import { memo, useEffect, useRef, useState } from 'react';
import { login_page, route_public_page, route_user_page } from '@/app/src/constants';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/cart_context';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { isNull } from '@/app/helpers/isNull';
import { isPWA } from '@/app/helpers/isPWA';
import CustomDrawer from '@/app/src/custom_drawer';
import { Search } from '@/app/widgets/search';
import CartButton from '@/app/src/cart_button';
import { ShoppingCart } from 'lucide-react';
import IconButton from '@/app/widgets/icon_button';
import CustomLink from '@/app/src/custom_link';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Brand } from '@/app/models/Brand';
import CustomCard from '@/app/widgets/custom_card';
import { CurSwitch } from '@/app/components/currency_switch';

function Header1({
  siteInfo,
  user,
  auth,
  navigation = [],
  component = {} as SiteComponent,
  preference = {},
}: {
  siteInfo: Brand;
  user: UserTypes;
  auth: AuthModel;
  navigation: any[];
  component?: SiteComponent;
  preference?: Record<string, any>;
}) {
  const { scrolled } = useBaseContext();
  const t = useTranslations('common');

  let primaryMenu: Menus | undefined = siteInfo?.menus?.find(
    (menu: any) => menu?.id === (preference?.primaryMenuId ?? ''),
  );

  let mobileMenus: Menus[] | undefined = [primaryMenu ?? {}];

  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { cart, isCartSidebarOpen, toggleCartSidebar } = useCart();
  const { toggleIsSideBarOpen, isSideBarOpen } = useBaseContext();
  const [menu, setMenu] = useState<any[]>(navigation ?? []);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef: any = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  let logoLink = '';
  const isPwaRn = isPWA();

  if (isPwaRn) {
    logoLink = login_page({ subBase: siteInfo.slug! });
  } else if (siteInfo.id != 'admin') {
    logoLink = '/';
  }

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  function navi(isMobile: boolean) {
    if (isMobile) {
      return (
        <div className="flex flex-col">
          {Array.isArray(mobileMenus) && mobileMenus.length > 0 && (
            <nav className="space-x-4">
              {mobileMenus.map((menu) => (
                <div key={menu.id} className="mb-4">
                  <CustomCard title={menu.name}>
                    {Array.isArray(menu.links) && (
                      <ul className="space-y-2">
                        {menu.links.map((link) => (
                          <li key={link.id} className="border-y border-gray-100">
                            <Link
                              href={link.link}
                              className="block text-lg py-1 text-gray-700 hover:text-primary transition-colors duration-200 hover:scale-101 hover:font-bold"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CustomCard>
                </div>
              ))}
            </nav>
          )}
        </div>
      );
    }

    // Desktop version
    return (
      <div className="flex flex-row justify-between items-center w-full space-x-6">
        {Array.isArray(primaryMenu?.links) && primaryMenu.links.length > 0 && (
          <div>
            <nav className="space-x-4">
              {primaryMenu.links.map((link) => (
                <Link
                  key={link.id}
                  href={link.link}
                  className="text-sm text-gray-700 hover:text-primary transition-colors duration-200 hover:scale-101 hover:font-bold"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
        <CurSwitch siteInfo={siteInfo as any} />
      </div>
    );
  }

  return (
    <div className={scrolled ? 'bg-gray-100 shadow-sm w-full' : 'w-full'} key={component.key}>
      <div className="flex flex-row justify-between items-center w-full space-x-6 p-2">
        <div className="flex items-center">
          <div className="sm:hidden mr-2">
            {/* Mobile menu button */}
            <IconButton
              size="md"
              color="auto"
              filled="none"
              iconPosition="after"
              className="inline-flex items-center bg-transparent justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-0 focus:ring-inset focus:ring-white"
              onClick={toggleIsSideBarOpen}
            >
              {isSideBarOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </IconButton>
          </div>
          <div className="flex items-center space-x-2">
            <Logo brand={siteInfo} />
          </div>
        </div>

        {/* <div className="w-2/12">search here</div> */}

        <div className="hidden sm:flex items-center space-x-4">{navi(false)}</div>

        <div className="block sm:hidden">
          <CurSwitch siteInfo={siteInfo as any} />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* User button with icon */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center p-1 px-3 text-inherit"
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>{' '}
              <div className="ml-2 hidden sm:block text-inherit hover:text-gray-600">Account</div>
            </button>

            {/* Dropdown menu */}
            <div
              className={`${
                isOpen ? 'block' : 'hidden'
              } absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
              role="menu"
              aria-orientation="vertical"
              tabIndex={-1}
            >
              {/* Sign in button */}
              <div className="px-4 py-3 w-full">
                <CustomLink style={1} href={route_public_page({ paths: ['login'] })}>
                  Sign in
                </CustomLink>
              </div>

              {/* Menu items */}
              <div className="py-1" role="none">
                <Link
                  href={route_user_page({
                    subBase: siteInfo.slug!,
                    action: 'index',
                    base: 'index',
                  })}
                  className="flex items-center text-gray-700  px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                >
                  <svg
                    className="w-3 h-3 mr-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.121 17.804A4 4 0 0111 14h2a4 4 0 015.879 3.804M12 14v.01M17 10a5 5 0 10-10 0 5 5 0 0010 0z"
                    />
                  </svg>
                  My account
                </Link>
                {['creator', 'store'].includes(siteInfo?.type!) && (
                  <Link
                    href={route_user_page({
                      subBase: siteInfo.slug!,
                      action: 'orders',
                      base: 'overview',
                    })}
                    className="flex items-center text-gray-700  px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    <svg
                      className="w-3 h-3 mr-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3h18M4 8h16M5 12h14M6 16h12M7 20h10"
                      />
                    </svg>
                    Orders
                  </Link>
                )}
                {!isNull(auth) ? (
                  <>
                    <hr className="my-1 border-gray-200" />
                    <Link
                      prefetch={false}
                      href={'#'}
                      onClick={async () => {
                        const toastId = toast.loading('signing out');
                        try {
                          await signOut({ redirect: false });
                          toast.success('Logged out');
                        } catch (error) {
                          console.error(error);
                        } finally {
                          toast.dismiss(toastId);
                        }
                      }}
                      className="flex items-center text-gray-700  px-4 py-2 text-sm hover:bg-gray-100 hover:text-red-600"
                      role="menuitem"
                    >
                      <svg
                        className="w-3 h-3 mr-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-11V5m0 16a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v1"
                        />
                      </svg>
                      Sign out
                    </Link>
                  </>
                ) : (
                  <>
                    <hr className="my-1 border-gray-200" />
                    <Link
                      href={route_public_page({ paths: ['signup'] })}
                      className="flex items-center text-gray-700  px-4 py-2 text-sm hover:bg-gray-100 hover:text-red-600"
                      role="menuitem"
                    >
                      <svg
                        className="w-3 h-3 mr-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-11V5m0 16a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v1"
                        />
                      </svg>
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <CartButton
            onClick={toggleCartSidebar}
            href="/cart"
            IconComponent={ShoppingCart}
            cartCount={cart.length}
          />
        </div>
      </div>

      <CustomDrawer
        direction="top"
        isWidthFull={true}
        isHeightFull={true}
        className="w-full sm:w-2/4"
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
  );
}

export default memo(Header1);
