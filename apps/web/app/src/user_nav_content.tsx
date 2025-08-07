'use client';
import React, { Fragment, useEffect, useState, ReactNode, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { dashboard_page, PRIMARY_COLOR } from '@/app/src/constants';
import { useUserContext } from '@/app/contexts/user_context';
import { RaisedButton, Shimmer } from '@/app/widgets/widgets';
import CartDetails from '@/app/widgets/cart_details';
import { useCart } from '@/app/contexts/cart_context';
import { useBaseContext } from '@/app/contexts/base_context';
import { toast } from 'sonner';
import { FaLink, FaShoppingCart } from 'react-icons/fa';
import CartButton from '@/app/src/cart_button';
import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react';
import { Logo } from '@/app/widgets/logo';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa6';
import { PlanUse } from '@/app/select_profile';
import CustomDrawer from '@/app/src/custom_drawer';
import { isNull } from '@/app/helpers/isNull';
import { Search } from '@/app/widgets/search';
import { NameSection } from '@/app/widgets/name_section';
import GetNavigation from '@/app/navigation';
import OnNavRoute from '@/src/onNavRoute';
import { getDynamicData } from '@/helpers/getDynamicData';
import indexedDB from '@/app/utils/indexdb';
import { signOut } from 'next-auth/react';
import CustomImage from '@/app/widgets/optimize_image';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

interface UserNavbarProps {
  children?: ReactNode;
  showMenu?: boolean;
  auth: AuthModel;
}

const UserNavbarContent: React.FC<UserNavbarProps> = ({ children, showMenu = true, auth }) => {
  const router = useRouter();
  const { isSwitchProfileOpen, setIsSwitchProfileOpen, toggleIsSwitchProfileOpen, essentialData } =
    useUserContext();
  const [fetched, setFetched] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isCartSidebarOpen, toggleCartSidebar, cart } = useCart();
  const {
    toggleIsSideBarOpen,
    isSideBarOpen,
    addRouteData,
    setOnRouteData,
    onNextedRouteData,
    removeRouteData,
  } = useBaseContext();
  const { refreshPage } = useDynamicContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const searchParams = useSearchParams();
  const isWeb = false;

  const plateform = searchParams.get('platform') ?? 'web';

  let logoLink = '/';

  let siteInfo: any = essentialData?.siteInfo || {};
  let user = essentialData?.user || {};
  let navigation = essentialData?.nav?.userNav?.sub || [];
  let profiles = essentialData?.nav?.allNavs || [];
  let rates = essentialData.rates ?? {};

  logoLink = dashboard_page({ subBase: siteInfo.slug! });
  const [menu, setMenu] = useState<any[]>(navigation);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      refreshPage(['user', 'auth', 'brand']);
      await signOut({ redirect: false });
      router.push(dashboard_page({ subBase: siteInfo.slug!, plateform, action: 'login' }));
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const getMenu = async () => {
      const navigation = await GetNavigation({
        selectedProfile: user?.selectedProfile,
        siteInfo,
        user,
      });
      setMenu(navigation?.userNav?.sub);
    };

    if (user.selectedProfile) {
      getMenu();
    }
  }, [user.selectedProfile]);

  useEffect(() => {
    // Prevent default navigation behavior
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return false;
    };

    // Add listener to prevent navigation
    window.addEventListener('beforeunload', handleBeforeUnload);

    onNextedRouteData.forEach((rt) => {
      if (rt.slug) {
        try {
          // Update URL without navigation
          const currentPath = window.location.pathname;
          if (currentPath !== rt.slug) {
          }
        } catch (error) {
          console.error('Error updating URL:', error);
        }
      }
    });

    // Clean up listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onNextedRouteData]);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => (prev.includes(name) ? [] : [name]));
  };

  const handlePrefetch = useCallback(
    async (item: NavItem) => {
      if (item.id) return;

      switch (item.id) {
        case 'pages':
          if (!fetched.includes(item.id)) {
            const pd = await getDynamicData({
              subBase: siteInfo.slug!,
              table: item.id,
              conditions: {},
            });
            if (pd.status && !isNull(pd.data)) {
              indexedDB.saveOrUpdateData({ table: 'pages', data: pd.data });
              setFetched((p) => [...p, 'pages']);
            }
            break;
          }

        case 'products':
          if (!fetched.includes(item.id)) {
            const pd = await getDynamicData({
              subBase: siteInfo.slug!,
              table: item.id,
              conditions: {},
            });
            if (pd.status && !isNull(pd.data)) {
              indexedDB.saveOrUpdateData({ table: 'products', data: pd.data });
              setFetched((p) => [...p, 'products']);
            }
            break;
          }

        default:
          break;
      }
    },
    [siteInfo.slug, fetched, router],
  );

  function navi(isMobile: boolean) {
    return (
      <div className="w-full">
        {menu && menu.length > 0 ? (
          menu
            .sort((a, b) => a.position - b.position) // Sort by the "position" key
            .map((item: any) => (
              <div
                key={item.name}
                className="py-1"
                // onMouseEnter={async () => await handlePrefetch(item)}
                // onTouchStart={async () => await handlePrefetch(item)}
              >
                <div
                  className={classNames(
                    'text-gray-800 dark:text-white hover:bg-gray-50 dark:bg-gray-9000 hover:text-gray-800 dark:hover:text-gray-100',
                    'rounded-md px-3 py-1.5 text-xs font-normal flex justify-between items-center cursor-pointer',
                  )}
                  onClick={() => toggleExpand(item.name)}
                  aria-current={'page'}
                >
                  <div className="flex flex-row items-center">
                    <FaLink className="h-3 w-3 mr-2 block text-gray-600 dark:text-white   rounded-md text-xs font-normal" />
                    {isMobile ? (
                      <div
                        key={item.name}
                        className="text-xs font-normal"
                        onClick={() => {
                          if (isNull(item.sub)) {
                            toggleIsSideBarOpen();
                          }
                        }}
                      >
                        <Link
                          prefetch={true}
                          as={item.href}
                          key={item.name}
                          href={item.href}
                          className="block text-gray-800 dark:text-white  rounded-md text-xs font-normal hover:cursor-pointer"
                        >
                          {item.name}
                        </Link>
                      </div>
                    ) : (
                      <Link
                        prefetch={true}
                        as={item.href}
                        key={item.name}
                        href={item.href}
                        className="block text-gray-800 dark:text-white   rounded-md text-xs font-normal"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
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
                  <div
                    className="pl-4 py-1"
                    onClick={() => {
                      if (isMobile) {
                        toggleIsSideBarOpen();
                      }
                    }}
                  >
                    {item.sub
                      .sort((a: any, b: any) => a.position - b.position) // Sort sub items by "position" key
                      .map((sub_item: NavItem) => {
                        if (sub_item.base && sub_item.action) {
                          return (
                            <div
                              className="flex flex-row items-center w-full whitespace-nowrap truncate justify-start  text-start text-gray-800 dark:text-white  rounded-md px-3 py-2 text-xs font-normal hover:bg-gray-50 dark:bg-gray-9000 hover:text-gray-800 dark:hover:text-gray-100"
                              key={sub_item.name}
                            >
                              <FaLink className="h-3 w-3 mr-2 block text-gray-600 dark:text-white   rounded-md text-xs font-normal" />
                              <button
                                // onMouseEnter={async () => await handlePrefetch(sub_item)}
                                // onTouchStart={async () => await handlePrefetch(sub_item)}
                                onClick={() => {
                                  addRouteData({
                                    isOpen: true,
                                    action: sub_item.action!,
                                    base: sub_item.base!,
                                    type: sub_item.type!,
                                    title: sub_item.title || '',
                                    rates,
                                    slug: sub_item.href || '',
                                    searchParams: sub_item.searchParams || {},
                                    className: sub_item.className,
                                    silverImage: sub_item.silverImage,
                                  });
                                }}
                                className=""
                              >
                                {sub_item.name}
                              </button>
                            </div>
                          );
                        }

                        return isMobile ? (
                          <div key={sub_item.name} className="w-full">
                            <div className="flex flex-row items-center">
                              <FaLink className="h-3 w-3 mr-2 block text-gray-600 dark:text-white   rounded-md text-xs font-normal" />
                              <Link
                                prefetch={true}
                                as={sub_item.href}
                                key={sub_item.name}
                                href={sub_item.href}
                                className="block text-gray-800 dark:text-white hover:bg-gray-50 dark:bg-gray-9000 hover:text-gray-800 dark:hover:text-gray-100 rounded-md px-3 py-2 text-xs font-normal"
                              >
                                {sub_item.name}
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={sub_item.name}
                            className="w-full hover:bg-gray-50 dark:bg-gray-9000 hover:text-gray-800  dark:hover:text-gray-100"
                          >
                            <div className="flex flex-row items-center">
                              <FaLink className="h-3 w-3 mr-2 block text-gray-600 dark:text-white   rounded-md text-xs font-normal" />
                              <Link
                                prefetch={true}
                                as={sub_item.href}
                                key={sub_item.name}
                                href={sub_item.href}
                                className="block text-gray-800 dark:text-white   rounded-md px-3 py-2 text-xs font-normal"
                              >
                                {sub_item.name}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))
        ) : (
          <Shimmer width="full" height="5" length={10} />
        )}
      </div>
    );
  }

  return (
    <>
      <Fragment key={767}>
        <header className="">
          <div className="bg-gray-100 dark:bg-gray-900 fixed w-full shadow h-[13vh] sm:h-[8vh]">
            <div className="px-2 sm:px-6 lg:px-3">
              <div className="block sm:hidden">
                <div className="flex flex-row justify-between items-center">{/* to add */}</div>
              </div>
              <div className="relative flex h-14 items-center justify-between px-1 sm:px-4">
                {/* Left Section - Logo */}
                <div className="flex items-center">
                  <Logo brand={siteInfo} link={logoLink} plateform={plateform} />
                </div>

                {/* Center Section - Search & Profile Switch (only on lg) */}
                <div className="hidden lg:flex flex-1 items-center justify-center space-x-4">
                  <div className="min-w-[50vh]">
                    <Search />
                  </div>
                  {siteInfo.type === 'creator' && (
                    <RaisedButton
                      icon={
                        isSwitchProfileOpen ? (
                          <FaToggleOn className="block h-4 w-4" aria-hidden="true" />
                        ) : (
                          <FaToggleOff className="block h-4 w-4" aria-hidden="true" />
                        )
                      }
                      className="animate-pulse"
                      size="auto"
                      color="auto"
                      iconPosition="after"
                      onClick={toggleIsSwitchProfileOpen}
                    >
                      <div className="my-0.5">Switch Services</div>
                    </RaisedButton>
                  )}
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-2">
                  {/* Settings Menu */}
                  <Menu as="div" className="relative z-50">
                    <div>
                      <MenuButton
                        className={`relative flex border border-${PRIMARY_COLOR} rounded-full bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800`}
                      >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        {siteInfo?.icon ? (
                          <CustomImage
                            height={20}
                            width={20}
                            alt={(
                              user?.firstName ??
                              user?.lastName ??
                              auth?.firstName ??
                              auth?.lastName ??
                              'O'
                            ).charAt(0)}
                            imgFile={siteInfo.icon}
                          />
                        ) : (
                          <div>A</div>
                        )}
                      </MenuButton>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg focus:outline-none">
                        <a href="#" className="block px-4 py-2 text-xs text-gray-700">
                          {user?.username} Your Profile
                        </a>
                        <a href="#" className="block px-4 py-2 text-xs text-gray-700">
                          Settings
                        </a>
                        <a
                          onClick={handleLogout}
                          href="#"
                          className="block px-4 py-2 text-xs text-gray-700"
                        >
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </a>
                      </MenuItems>
                    </Transition>
                  </Menu>

                  {/* Cart Button - Always visible */}
                  <CartButton
                    onClick={toggleCartSidebar}
                    href=""
                    IconComponent={FaShoppingCart}
                    cartCount={cart.length}
                  />
                </div>
              </div>
            </div>
            {showMenu && (
              <>
                <div className="hidden sm:block z-40 relative">
                  <div className="absolute left-0 mr-0 pr-0 z-10 h-screen w-1/5 lg:w-1/5 origin-top-left bg-gray-100 dark:bg-gray-900">
                    <NameSection user={user} siteInfo={siteInfo} />
                    <div className="space-y-1 px-2 pt-2 sm:max-h-[calc(72vh-4rem)] sm:overflow-y-auto scrollbar-hide-mobile">
                      {navi(false)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="m-0">
          {onNextedRouteData &&
            Array.isArray(onNextedRouteData) &&
            onNextedRouteData.length > 0 &&
            onNextedRouteData.map((route, index) => (
              <OnNavRoute
                key={index}
                action={route.action}
                base={route.base}
                seg1={siteInfo.slug!}
                type={route.type}
                isOpen={route.isOpen!}
                hideScroll={route.hideScroll}
                hideFooter={route.hideFooter}
                searchParams={route.searchParams}
                isWidthFull={route.isWidthFull === 'yes' ? true : 'auto'}
                isHeightFull={route.isHeightFull === 'yes' ? true : false}
                className={route.className}
                direction="right"
                rates={rates}
                onClose={() => {
                  removeRouteData();
                }}
                header={route.title || route.action}
                user={user}
                siteInfo={siteInfo}
                auth={auth}
                slug={route.slug ?? route?.href}
                defaultData={route.defaultData}
                data={route.data}
                silverImage={route.silverImage}
              />
            ))}

          <CustomDrawer
            isHeightFull={
              Array.isArray(onNextedRouteData) && onNextedRouteData.length > 0 ? true : true
            }
            isWidthFull="auto"
            className="w-full sm:w-2/4"
            direction="right"
            isOpen={isCartSidebarOpen}
            onClose={() => toggleCartSidebar()}
            header="Cart"
          >
            <CartDetails user={user} siteInfo={siteInfo} auth={auth} rates={rates} />
          </CustomDrawer>

          <CustomDrawer
            direction="left"
            isWidthFull={true}
            isHeightFull={true}
            className="w-full sm:w-80 lg:w-64 xl:w-80"
            isOpen={isSideBarOpen}
            showHeader={true}
            onClose={() => toggleIsSideBarOpen()}
            header="User Menu"
          >
            <div className="flex flex-col h-full">
              <NameSection user={user} siteInfo={siteInfo} />
              <div className="mb-8 mt-2">
                <Search />
              </div>
              <div className="overflow-y-auto scrollbar-hide-mobile mb-5"> {navi(true)}</div>
            </div>
          </CustomDrawer>

          {(isSwitchProfileOpen || !user.selectedProfile) && !isNull(user) && (
            <CustomDrawer
              direction="right"
              isWidthFull={true}
              isHeightFull={true}
              showHeader={true}
              isOpen={isSwitchProfileOpen || !user.selectedProfile}
              onClose={() => {
                if (user && !isNull(user.selectedProfile)) {
                  setIsSwitchProfileOpen(false);
                } else {
                  toast.error('select service');
                }
              }}
              header="Switch Services"
            >
              <PlanUse profiles={profiles} page="dashboard" user={user} siteInfo={siteInfo} />
            </CustomDrawer>
          )}
          <main id="user" className="w-full h-full flex-col justify-between">
            <div className="flex flex-col flex-grow-2 text-gray-600 dark:text-white dark:bg-gray-800">
              <div className="sm:ml-auto sm:w-4/5">
                <div className="flex flex-col flex-grow-0 mt-[13vh] sm:mt-[8vh]">{children} </div>
              </div>
            </div>
          </main>
        </div>
      </Fragment>
    </>
  );
};

export default memo(UserNavbarContent);
