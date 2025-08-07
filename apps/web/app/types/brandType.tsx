interface BrandType {
  id?: string;
  name?: string;
  type?: string;
  userId?: string;
  uid?: string;
  logo?: FileType;
  icon?: FileType;
  domain?: string;
  parentCompanyId?: string;
  subscriptionId?: string;
  brandId?: string;
  pendingDomain?: string;
  subDomain?: string;
  colors?: BrandColors | any;
  profiles?: string[];
  rules?: any[];
  slug?: string;
  phone?: string;
  email?: string;
  texts?: Record<any, any>;
  translations?: any[];
  adsense?: any;
  inHouse?: any;
  allowMonetization?: boolean;
  parentBrandData?: BrandType;
  parentBrandOwner?: UserTypes;
  masterBrandData?: BrandType;
  isDefault?: boolean;
  isTester?: boolean;
  serviceSettings?: any[];
  ownerData?: UserTypes;
  wallet?: string;
  childrenViews?: number;
  costPerMille?: number;
  costPerUnit?: number;
  childrenMille?: number;
  revenueWallet?: string;
  plan?: PackageTypes;
  blogRevenueRate?: number;
  mobileConfig?: MobileConfig;
  requestFrom?:
    | "primaryDomain"
    | "customDomain"
    | "subDomain"
    | "customDomainSubFolder"
    | "subFolder";
  inhouseMonetization?: "active" | "inactive";
  googleMonetization?: "active" | "inactive";
  additional_inhouse_product_price?: number;
  additional_pack_inclusion?: number;
  crypto_rate?: number;
  sales_commission?: number;
  share_value?: number;
  action?: string;
  domainInfo?: DomainInfoModel;
  subDomainInfo?: DomainInfoModel;
  preferred?: string;
  isConnected?: boolean;
  isActive?: boolean;
  isAdded?: boolean;
  options?: any;
  mobileAppsData?: MobileAppsData;
  businessCountry?: string;
  businessState?: string;
  businessCity?: string;
  coverageCountries?: string;
  coverageStates?: string;
  coverageCities?: string;
  menus?: Menus[] | null;
  domains?: string[];
  addonForSubDomains?: string;
}

interface MobileAppsData {
  buildId?: number;
  tenantId?: string;
  downloadUrls?: DownloadUrls;
  publicUrl?: string;
  buildType?: string;
  buildTime?: number;
  commit?: string;
  branch?: string;
  apk?: any;
  ios?: any;
  aab?: any;
}

interface DownloadUrls {
  apk?: string;
  aab?: string;
  ios?: string;
}

interface DomainInfoModel {
  isConnected?: boolean;
  isVerified?: boolean;
  isAdded?: boolean;
  isActive?: boolean;
  oldNS?: any[];
  domain?: string;
  verifications?: any[];
  nameServers?: any[];
  internalDNS?: any;
}

interface MobileConfig {
  appName?: string;
  bundleId?: string;
  platform?: "android" | "ios" | "both";
  darkMode?: boolean;
  icon?: string;
  logo?: string;
  primaryColor?: string;
  template?: string;
}

interface BrandColors {
  // Light mode
  primaryForegroundLight?: string | null;
  secondaryForegroundLight?: string | null;
  primaryBackgroundLight?: string | null;
  secondaryBackgroundLight?: string | null;
  foregroundLight?: string | null;
  backgroundLight?: string | null;
  cardForegroundLight?: string | null;
  cardBackgroundLight?: string | null;

  // Dark mode
  primaryForegroundDark?: string | null;
  secondaryForegroundDark?: string | null;
  primaryBackgroundDark?: string | null;
  secondaryBackgroundDark?: string | null;
  foregroundDark?: string | null;
  backgroundDark?: string | null;
  cardForegroundDark?: string | null;
  cardBackgroundDark?: string | null;
}
