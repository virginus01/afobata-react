export class Brand {
  id?: string | null = '';
  name?: string | null = '';
  type?: string | null = '';
  userId?: string | null = '';
  logo?: FileType | null = null;
  icon?: FileType | null = null;
  domain?: string | null = '';
  brandId?: string | null = '';
  colors?: any | null = null;
  pendingDomain?: string | null = '';
  subDomain?: string | null = '';
  profiles?: string[] | null = [];
  rules?: any[] | null = [];
  slug?: string | null = '';
  phone?: string | null = '';
  email?: string | null = '';
  allowMonetization?: boolean | null = false;
  parentBrandData?: Brand | null = null;
  parentBrandOwner?: UserTypes | null = null;
  masterBrandData?: Brand | null = null;
  isDefault?: boolean | null = false;
  isTester?: boolean | null = false;
  serviceSettings?: any[] | null = [];
  ownerData?: UserTypes | null = null;
  wallet?: string | null = '';
  childrenViews?: number | null = 0;
  costPerMille?: number | null = 0;
  costPerUnit?: number | null = 0;
  childrenMille?: number | null = 0;
  revenueWallet?: string | null = '';
  plan?: PackageTypes | null = null;
  blogRevenueRate?: number | null = 0;
  mobileConfig?: MobileConfig | null = null;
  requestFrom?:
    | 'primaryDomain'
    | 'customDomain'
    | 'subDomain'
    | 'customDomainSubFolder'
    | 'subFolder'
    | null;
  inhouseMonetization?: 'active' | 'inactive' | null;
  googleMonetization?: 'active' | 'inactive' | null;
  additional_inhouse_product_price?: number | null = 0;
  additional_pack_inclusion?: number | null = 0;
  crypto_rate?: number | null = 0;
  sales_commission?: number | null = 0;
  share_value?: number | null = 0;
  action?: string | null = '';
  domainInfo?: DomainInfoModel | null = null;
  subDomainInfo?: DomainInfoModel | null = null;
  preferred?: string | null = '';
  isConnected?: boolean | null = false;
  isActive?: boolean | null = false;
  isAdded?: boolean | null = false;
  options?: any | null = {};
  mobileAppsData?: MobileAppsData | null = null;
  businessCountry?: string | null = '';
  businessState?: string | null = '';
  businessCity?: string | null = '';
  coverageCountries?: string | null = '';
  coverageStates?: string | null = '';
  coverageCities?: string | null = '';
  businessPhone?: string | null = '';
  whatsappPhone?: string | null = '';
  businessAddress?: string | null = '';
  menus?: Menus[] | null = [];
}

export class MobileAppsData {
  iosDownloadUrl?: string | null = '';
  androidDownloadUrl?: string | null = '';
  buildId?: number | null = 0;
  tenantId?: string | null = '';
  downloadUrls?: DownloadUrls | null = null;
  buildType?: string | null = '';
  buildTime?: number | null = 0;
  commit?: string | null = '';
  branch?: string | null = '';
  apk?: any | null = {};
  ios?: any | null = {};
  aab?: any | null = {};
}

export class DownloadUrls {
  apk?: string | null = '';
  aab?: string | null = '';
  ios?: string | null = '';
}

export class DomainInfoModel {
  isConnected?: boolean | null = false;
  isVerified?: boolean | null = false;
  isAdded?: boolean | null = false;
  isActive?: boolean | null = false;
  oldNS?: any[] | null = [];
  domain?: string | null = '';
  verifications?: any[] | null = [];
  nameServers?: any[] | null = [];
  internalDNS?: any | null = {};
}

export class MobileConfig {
  appName?: string | null = '';
  bundleId?: string | null = '';
  darkMode?: boolean | null = false;
  icon?: string | null = '';
  logo?: string | null = '';
  primaryColor?: string | null = '';
  template?: string | null = '';
  platform?: 'android' | 'ios' | 'both' | '' | null = '';
}
