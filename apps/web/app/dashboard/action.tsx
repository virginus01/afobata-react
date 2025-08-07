"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import { useBaseContext } from "@/app/contexts/base_context";
import { useDynamicContext } from "@/app/contexts/dynamic_context";
import { RefreshCcw } from "lucide-react";
import { isNull } from "@/app/helpers/isNull";
import { GetWallets } from "@/dashboard/wallet/wallet";
import AppFooter from "@/app/widgets/app_footer";
import AwaitingComponent from "@/app/widgets/awaiting";
import Dash from "@/dashboard/dash";
import { toast } from "sonner";
import EmailVerification from "@/app/widgets/email_verification";
import { useUserContext } from "@/app/contexts/user_context";
import LazyComponent from "@/app/components/general/lazy_components";
import LoadingScreen from "@/src/loading_screen";

export const Action = ({
  action,
  base,
  seg1,
  navigation = {},
  categories,
  silverImage,
  type,
  status,
  id,
  defaultData,
  sps = [],
  parents = {} as any,
  rates = {},
  iniSearchParams = {},
  className = "bg-transparent",
  hideFooter,
}: {
  action: string;
  base: string;
  seg1: string;
  navigation: any;
  categories?: CategoryModel[];
  type?: string;
  status?: string;
  id?: string;
  className?: string;
  defaultData?: any;
  sps?: ServiceProviderTypes[];
  parents?: ParentsInfo;
  rates?: any;
  silverImage?: string;
  iniSearchParams?: Record<string, string>;
  hideFooter?: boolean;
}) => {
  const { refreshPage } = useDynamicContext();
  const { essentialData } = useUserContext();
  const { searchParams } = useBaseContext();

  const { user, siteInfo, brand, auth, nav } = essentialData;

  // Memoize params to prevent unnecessary re-renders
  const params = useMemo(() => ({ action, base, seg1 }), [action, base, seg1]);

  const [baseData, setBaseData] = useState<BaseDataType>({} as BaseDataType);
  const [showSilver, setShowShowSilver] = useState(
    silverImage && Capacitor.isNativePlatform()
  );

  // Memoize wallets calculation
  const wallets = useMemo(
    () => GetWallets({ user, siteInfo, params }),
    [user, siteInfo, params]
  );

  const containerRef = useRef<any | null>(null);
  const router = useRouter();
  const sParams = useSearchParams();

  // Memoize merged search params
  const mergedSearchParams = useMemo(
    () => ({
      ...(!isNull(iniSearchParams)
        ? { ...iniSearchParams }
        : { ...searchParams }),
      type: type ?? sParams.get("type") ?? "",
      status: status ?? sParams.get("status") ?? "",
    }),
    [iniSearchParams, searchParams, type, status, sParams]
  );

  useEffect(() => {
    const setStatusBarStyle = async () => {
      if (Capacitor.isNativePlatform()) {
        const { StatusBar } = await import("@capacitor/status-bar");
        const { Style } = await import("@capacitor/status-bar");

        if (StatusBar && Style) {
          if (showSilver) {
            await StatusBar.setStyle({ style: Style.Dark });
            await StatusBar.setOverlaysWebView({ overlay: true });
          } else {
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setOverlaysWebView({ overlay: false });
          }
        }
      }
    };
    setStatusBarStyle();
  }, [showSilver, hideFooter]);

  const handleRefresh = useCallback(() => {
    refreshPage(["all"], true, true);
    toast.success("Page refreshed successfully");
  }, [refreshPage, params.action]);

  // Memoize the component rendering to prevent unnecessary re-renders
  const renderedComponent = useMemo(() => {
    const commonProps = {
      user: user!,
      siteInfo: siteInfo!,
      params,
      auth: auth!,
    };

    switch (base) {
      case "index":
        return (
          <div className="pb-32">
            <Dash
              {...commonProps}
              defaultProfile={user?.selectedProfile || ""}
              defaultData={defaultData}
            />
          </div>
        );

      case "revenue":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="Revenue"
              importFn={() =>
                import("@/dashboard/monetization/revenue").then(
                  (m) => m.default
                )
              }
            >
              {(Revenue) => <Revenue {...commonProps} />}
            </LazyComponent>
          </div>
        );

      case "monetize":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="Monetize"
              importFn={() =>
                import("@/dashboard/monetization/monetize").then(
                  (m) => m.default
                )
              }
            >
              {(Monetize) => <Monetize user={user!} siteInfo={siteInfo!} />}
            </LazyComponent>
          </div>
        );

      case "assets":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="AssetIndex"
              importFn={() =>
                import("@/dashboard/assets").then((m) => m.default)
              }
            >
              {(AssetIndex) => (
                <AssetIndex {...commonProps} type={mergedSearchParams.type} />
              )}
            </LazyComponent>
          </div>
        );

      case "transactions":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="Orders"
              importFn={() =>
                import("@/dashboard/transactions/orders").then((m) => m.default)
              }
            >
              {(Orders) => <Orders {...commonProps} />}
            </LazyComponent>
          </div>
        );

      case "wallet":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="WalletIndex"
              importFn={() =>
                import("@/dashboard/wallet").then((m) => m.default)
              }
            >
              {(WalletIndex) => (
                <WalletIndex {...commonProps} wallets={wallets} />
              )}
            </LazyComponent>
          </div>
        );

      case "subscription":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="SubscriptionIndex"
              importFn={() =>
                import("@/dashboard/subscription/subscription_index").then(
                  (m) => m.default
                )
              }
            >
              {(SubscriptionIndex) => (
                <SubscriptionIndex {...commonProps} wallets={wallets} />
              )}
            </LazyComponent>
          </div>
        );

      case "profile":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="ProfileIndex"
              importFn={() =>
                import("@/dashboard/profile").then((m) => m.default)
              }
            >
              {(ProfileIndex) => (
                <ProfileIndex
                  {...commonProps}
                  wallets={wallets || []}
                  iniSearchParams={mergedSearchParams}
                  rates={rates}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "utility":
        return (
          <div className="pb-32 transition-all duration-200 ease-in-out">
            <LazyComponent
              componentName="Utility"
              importFn={() =>
                import("@/dashboard/utility").then((m) => m.default)
              }
            >
              {(Utility) => (
                <Utility
                  {...commonProps}
                  iniSps={sps}
                  wallets={wallets || []}
                  iniParents={parents || ({} as ParentsInfo)}
                  iniRates={rates || {}}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "menu":
      case "sub_menu":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="MobileMenuView"
              importFn={() =>
                import("@/app/widgets/mobile_menu_view").then((m) => m.default)
              }
            >
              {(MobileMenuView) => (
                <MobileMenuView
                  user={user!}
                  siteInfo={siteInfo!}
                  menu={defaultData}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "brand":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="BrandIndex"
              importFn={() =>
                import("@/dashboard/brand/index_page").then((m) => m.default)
              }
            >
              {(BrandIndex) => (
                <BrandIndex
                  {...commonProps}
                  iniProfiles={navigation?.allNavs || []}
                  brand={brand ?? {}}
                  navigation={navigation}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "orders":
        return (
          <div className="mb-32">
            <LazyComponent
              componentName="OrdersIndex"
              importFn={() =>
                import("@/dashboard/orders/orders_index").then((m) => m.default)
              }
            >
              {(OrdersIndex) => (
                <OrdersIndex
                  {...commonProps}
                  data={defaultData}
                  status={mergedSearchParams.status}
                  type={mergedSearchParams.type ?? ""}
                  id={id}
                  baseData={baseData}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "purchases":
        return (
          <div className="mb-32">
            <LazyComponent
              componentName="PurchasesIndex"
              importFn={() =>
                import("@/dashboard/purchases/purchases_index").then(
                  (m) => m.default
                )
              }
            >
              {(PurchasesIndex) => (
                <PurchasesIndex
                  {...commonProps}
                  data={defaultData}
                  status={mergedSearchParams.status}
                  type={mergedSearchParams.type}
                  id={id}
                  baseData={baseData}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "appearance":
        return (
          <div className="mb-32">
            <LazyComponent
              componentName="AppearanceIndex"
              importFn={() =>
                import("@/dashboard/appearance/appearance_index").then(
                  (m) => m.default
                )
              }
            >
              {(AppearanceIndex) => (
                <AppearanceIndex
                  {...commonProps}
                  data={defaultData}
                  status={mergedSearchParams.status}
                  type={mergedSearchParams.type}
                  id={id}
                  baseData={baseData}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "domains":
        return (
          <div className="mb-32">
            <LazyComponent
              componentName="DomainOverview"
              importFn={() =>
                import("@/dashboard/domains/domain_overview").then(
                  (m) => m.default
                )
              }
            >
              {(DomainOverview) => (
                <DomainOverview
                  {...commonProps}
                  data={defaultData}
                  status={mergedSearchParams.status}
                  type={mergedSearchParams.type}
                  id={id}
                  baseData={baseData}
                />
              )}
            </LazyComponent>
          </div>
        );

      case "products":
      case "blog":
      case "posts":
      case "categories":
      case "tags":
      case "pages":
        return (
          <div className="pb-32">
            <LazyComponent
              componentName="CrudData"
              importFn={() =>
                import("@/dashboard/crud/crud_data").then((m) => m.default)
              }
            >
              {(CrudData) => (
                <CrudData
                  searchParams={mergedSearchParams}
                  {...commonProps}
                  categories={categories || []}
                  status={mergedSearchParams.status}
                  type={mergedSearchParams.type}
                  id={id}
                  defaultData={defaultData}
                  baseData={baseData}
                />
              )}
            </LazyComponent>
          </div>
        );

      default: {
        if (base) {
          console.warn(`Route not found for base: ${base}`);
        }
        return (
          <div className="pb-32">
            <Dash
              {...commonProps}
              defaultProfile={user?.selectedProfile || ""}
              defaultData={defaultData}
            />
          </div>
        );
      }
    }
  }, [
    base,
    user,
    siteInfo,
    params,
    auth,
    mergedSearchParams,
    wallets,
    defaultData,
    navigation,
    categories,
    sps,
    parents,
    rates,
    id,
    baseData,
  ]);

  const renderedFooter = useMemo(() => {
    if (hideFooter) return null;
    return (
      <AppFooter
        nav={navigation?.userNav?.sub}
        siteInfo={brand}
        user={user}
        params={params}
      />
    );
  }, [hideFooter]);

  if (isNull(siteInfo)) {
    return (
      <div>
        <AwaitingComponent
          siteName={siteInfo.name}
          path={"/"}
          data="Brand you are looking for is yet to complete its set up, come back later"
        />
      </div>
    );
  }

  if (isNull(essentialData.user) || isNull(essentialData.siteInfo)) {
    return <LoadingScreen />;
  }

  return (
    <div className={`flex flex-col ${className}`} ref={containerRef}>
      <div>
        <div className="relative flex flex-row h-7 border border-gray-300 items-center overflow-hidden">
          <div className="whitespace-nowrap overflow-hidden flex-1">
            <div className="inline-block animate-marquee">
              <span className="pr-8 text-xs">
                mille is cash, acquire much you can. Contact us for help incase.
                use the refresh button to refresh page content
              </span>
            </div>
          </div>
          <div className="absolute right-0 p-2 brand-bg">
            <button
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 animate-pulse"
              onClick={handleRefresh}
            >
              <RefreshCcw className="h-4 w-4" color="red" />
            </button>
          </div>
        </div>
      </div>

      {renderedComponent}

      {renderedFooter}

      {!(
        essentialData.auth?.emailVerified ||
        essentialData?.user?.auth?.emailVerified
      ) &&
        !isNull(essentialData?.user) && <EmailVerification />}
    </div>
  );
};

export default memo(Action);
