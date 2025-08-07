'use client';
import React, { memo, useEffect, useRef, useState } from 'react';
import { BaseContextProvider, useBaseContext } from '@/app/contexts/base_context';
import CookieConsentBanner from '@/app/widgets/cookie_consent_banner';
import { CartProvider, useCart } from '@/app/contexts/cart_context';
import CustomDrawer from '@/app/src/custom_drawer';
import CartDetails from '@/app/widgets/cart_details';
import { DynamicContextProvider } from '@/app/contexts/dynamic_context';
import { StatusBarInit } from '@/app/components/statusbarInit';
import { useSearchParams } from 'next/navigation';
import { isPWA } from '@/app/helpers/isPWA';
import { Capacitor } from '@capacitor/core';

interface LayoutProps {
  headerContent?: React.ReactNode;
  beforeContent?: React.ReactNode;
  leftSidebarContent?: React.ReactNode;
  rightSidebarContent?: React.ReactNode;
  mainContent?: React.ReactNode;
  afterContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  className: string;
  siteInfo: BrandType;
  viewType?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  auth?: AuthModel;
  rates?: any;
}

const StructurePageLayout: React.FC<LayoutProps> = ({
  headerContent,
  beforeContent,
  leftSidebarContent,
  rightSidebarContent,
  mainContent,
  afterContent,
  footerContent,
  showHeader = true,
  showFooter = true,
  siteInfo,
  className = '',
  viewType,
  auth,
  rates,
}) => {
  const { setScrolled } = useBaseContext();
  const { cart, isCartSidebarOpen, toggleCartSidebar } = useCart();
  const containerRef: any = useRef(null);
  const searchParams = useSearchParams();
  const isWeb = searchParams.get('platform') ?? 'web' === 'web';

  const MainLayout = ({
    mainContent,
    leftSidebarContent,
    rightSidebarContent,
  }: {
    mainContent: any;
    leftSidebarContent: any;
    rightSidebarContent: any;
  }) => {
    const getMainContentWidth = () => {
      if (!leftSidebarContent && !rightSidebarContent) {
        return 'w-full h-full';
      } else if (leftSidebarContent && rightSidebarContent) {
        return 'sm:w-1/2 w-full h-full';
      } else {
        return 'sm:w-3/4 w-full h-full';
      }
    };

    return <main className={getMainContentWidth()}>{mainContent}</main>;
  };

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (containerRef.current) {
  //       //setScrollPosition(containerRef.current.scrollTop);

  //       if (containerRef.current.scrollTop > 10) {
  //         setScrolled(true);
  //       } else {
  //         setScrolled(false);
  //       }
  //     }
  //   };

  //   const container = containerRef.current;
  //   if (container) {
  //     container.addEventListener('scroll', handleScroll);
  //   }

  //   // Cleanup on unmount
  //   return () => {
  //     if (container) {
  //       container.removeEventListener('scroll', handleScroll);
  //     }
  //   };
  // }, [setScrolled]);

  const isPwaRn = isPWA();
  const isAppRn = Capacitor && Capacitor.isNativePlatform();

  const isApp = isPwaRn || isAppRn;

  return (
    <>
      <div
        className="flex flex-col h-full w-full pb-5 overflow-y-auto scrollbar-hide-mobile"
        key={'view'}
        ref={containerRef}
      >
        {viewType !== 'modal' && showHeader && headerContent && isWeb && !isApp && (
          <header>{headerContent}</header>
        )}

        <div>
          {beforeContent && beforeContent}
          <div className="flex flex-col lg:flex-row h-full w-full">
            {leftSidebarContent && (
              <aside className="hidden sm:block sm:w-1/4 h-full w-full">{leftSidebarContent}</aside>
            )}

            <MainLayout
              mainContent={mainContent}
              leftSidebarContent={leftSidebarContent}
              rightSidebarContent={rightSidebarContent}
            />

            {leftSidebarContent && (
              <aside className="block sm:hidden h-full w-full">{leftSidebarContent}</aside>
            )}

            {rightSidebarContent && (
              <aside className="sm:w-1/4 h-full w-full">{rightSidebarContent}</aside>
            )}
          </div>
          {afterContent && afterContent}
        </div>

        {viewType !== 'modal' && showFooter && isWeb && footerContent && !isApp && (
          <footer>{footerContent}</footer>
        )}
      </div>
      {showFooter && isWeb && !isApp && <CookieConsentBanner />}

      {isCartSidebarOpen && (
        <CustomDrawer
          direction="right"
          isHeightFull={true}
          isOpen={isCartSidebarOpen}
          onClose={toggleCartSidebar}
          header="Cart"
        >
          <CartDetails siteInfo={siteInfo} rates={rates} auth={auth ?? {}} />
        </CustomDrawer>
      )}
    </>
  );
};

const PageLayout: React.FC<LayoutProps> = ({
  headerContent,
  beforeContent,
  leftSidebarContent,
  rightSidebarContent,
  mainContent,
  afterContent,
  footerContent,
  showHeader = true,
  showFooter = true,
  siteInfo,
  className = '',
  viewType,
  auth,
  rates,
}) => {
  return (
    <>
      <StructurePageLayout
        headerContent={headerContent}
        beforeContent={beforeContent}
        leftSidebarContent={leftSidebarContent}
        rightSidebarContent={rightSidebarContent}
        mainContent={mainContent}
        afterContent={afterContent}
        footerContent={footerContent}
        showHeader={showHeader}
        showFooter={showFooter}
        siteInfo={siteInfo}
        className={className}
        viewType={viewType}
        auth={auth}
        rates={rates}
      />
    </>
  );
};

export default memo(PageLayout);
