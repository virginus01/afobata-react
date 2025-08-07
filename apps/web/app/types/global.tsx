interface storeType {
  name?: string;
  slug?: string;
  logo?: string;
}

interface WalletTypes {
  id?: string;
  title?: string;
  name?: string;
  value?: number;
  shareValue?: number;
  userId?: string;
  brandId?: string;
  identifier?: 'revenue' | 'main' | 'btc';
  vaAccNumber?: number;
  vaAccName?: string;
  vaAccBank?: string;
  vaBankCode?: string;
  address?: string;
  currency?: string;
  privateKey?: string;
  disabled?: boolean;
}

interface ApiAuthModel {
  id?: string;
  uid?: string;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  value?: number;
  data?: AuthModel;
  user?: UserTypes;
}

interface walletPageTypes {
  bank?: string;
  amount?: number;
  accountNumber?: number;
  customerName?: string;
  bankName?: string;
  customerNameValidated?: boolean;
  paymentMethod?: string;
}

interface InfoTypes {
  id?: string;
  name?: string;
  country: string;
  city: string;
  state: string;
  address?: string;
  email?: string;
  phone?: string;
  logo?: string;
  footer_code?: string;
  header_code?: string;
}

interface MultipleType {
  body: string;
  title: string;
  position: string;
  selectedOption: string;
}

interface PaymentType {
  id?: string;
  title?: string;
  referenceId?: string;
  currency?: string;
  currencySymbol?: string;
  amount?: number;
  email?: string;
  name?: string;
  trnxType?: 'debit' | 'credit';
  type?: 'funding' | 'order' | 'withdrawal';
  status?: 'paid' | 'pending' | 'success' | 'completed' | 'abandoned' | 'failed' | 'error';
  gateway?: 'paystack' | 'wallet' | 'flutterwave';
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  brandId?: string;
}

interface _CreatePaymentModel {
  id?: string;
  userId: string;
  email?: string;
  name?: string;
  walletId: string;
  transferId?: string;
  pay?: boolean;
  shareRate?: number;
  fulfillmentDate?: any;
  type: 'credit' | 'debit' | 'payout' | 'none';
  amount: number;
  referenceId: string;
  status: string;
  currency?: string;
  currencySymbol?: string;
  gateway: 'paystack' | 'wallet' | 'flutterwave';
  trnxType:
    | 'payout'
    | 'commission'
    | 'withdrawal'
    | 'funding'
    | 'purchase'
    | 'subsidy'
    | 'share'
    | 'refund';
  returnOnFail?: boolean;
  bankPaymentInfo?: _BankPaymentInfo;
  others?: any;
}

interface _BankPaymentInfo {
  accountNumber: number;
  accountName: string;
  name?: string;
  bank: string;
  bankCode?: string;
  country: string;
  currency: string;
  bankName?: string;
}

interface _FundSouces {
  id: string;
  accountName?: string;
  accountNumber?: number;
  bankCode?: string;
  bankName?: string;
  bankInfo?: _BankPaymentInfo;
  role?: 'payout' | 'deposit';
  type?: 'virtual' | 'bank_account' | 'nroma' | 'crypto';
  expireAt?: any;
  walletId?: string;
  currency?: string;
  status: 'active';
  disabled: boolean;
  blackListed?: boolean;
}
// Define interfaces
interface NavItem {
  name: string;
  href: string;
  id?: string;
  status?: string;
  title?: string;
  position: number;
  sub?: NavItem[] | OnRouteModel[];
  base?: string;
  action?: string;
  type?: string;
  searchParams?: Record<string, string>;
  className?: string;
  silverImage?: string;
}

interface NavigationState {
  navigation: NavItem[];
}

interface CheckOutDataType {
  userId?: string;
  email: string;
  name: string;
  cart: CartItem[];
  subTotal?: number;
  referenceId?: string;
  gateway: string;
  currency: string;
  symbol: string;
  walletId: string;
  rates?: any;
  gatewayOption?: PaymentOptionsType;
  status?: 'pending' | 'paid';
}

interface CartItem {
  id: string;
  productId: string;
  sellerId?: string;
  customerId?: number | string;
  title: string;
  userId?: string;
  orderValue: number;
  amount: number;
  productPrice?: number;
  currency: string;
  sellerProfit?: number;
  orderCurrencySymbol: string;
  orderCurrency: string;
  managers: string[];
  symbol: string;
  type: string;
  slug: string;
  parentBrandId?: string;
  quantity: number;
  others?: CartOthers;
  planInfo?: PackageTypes;
  rates?: any;
  duration?: PlanDuration;
  paymentGateway?: string;
  sp?: string;
}

interface CartOthers {
  [key: string]: any;
  iucNumber?: string;
  meterNumber?: string;
}

interface ApiFields {
  [key: string]: any;
  id?: string | null;
  ref?: string;
  page?: string;
  limit?: string;
  slug?: string;
  brandId?: string;
  orderid?: string;
  parentId?: string | null;
  spId?: string | null;
  user_id?: string | null;
  keyType?: string | null;
  status?: string | null;
  crypto?: string | null;
  siteApiSecret?: string | null;
  siteApiKey?: string | null;
  csrfToken?: string | null;
  type?: string | null;
  apiSecret?: string | null;
  apiKey?: string | null;
  fullUrl?: string | null;
  source?: string | null;
  tag?: string | null;
  target?: string | null;
}

interface ServiceProviderTypes {
  id?: string;
  name?: string;
  title?: string;
  type?: string;
  index?: number;
  service_area?: string;
  status?: boolean;
  airtime_to_cash?: boolean;
  discount?: string;
  discount_type?: string;
  slug?: string;
  others?: any;
}

interface CBKProduct {
  PRODUCT_ID: string;
  PRODUCT_TYPE: string;
  MINIMUN_AMOUNT: string;
  MAXIMUM_AMOUNT: string;
  PRODUCT_DISCOUNT_AMOUNT: string;
  PRODUCT_DISCOUNT: string;
  PRODUCT_CODE: string;
  PRODUCT_NAME: string;
  PRODUCT_AMOUNT: string;
  PACKAGE_ID: string;
  PACKAGE_AMOUNT: string;
  PACKAGE_NAME: string;
}

interface VisitorInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  timezone: string;
}

interface FileType {
  id?: string;
  title?: string | null;
  name?: string;
  isFeatured?: boolean;
  type?: string | null;
  slug?: string | null;
  publicUrl?: string;
  url?: string;
  size?: number | null;
  provider?: string | null;
  path?: string | null;
  description?: string | null;
  _id?: string | null;
  userId?: string;
  brandId?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type FormValues = {
  amount: number;
  paymentMethod: string;
  accountNumber?: number;
  accountName?: string;
  bankName?: string;
  bvn?: string;
  others?: string;
  rules: Rule[];
};

type Rule = {
  id?: string;
  name?: string;
  title?: string;
  direction?: string;
  value?: number;
  adjustmentType?: 'percentage' | 'fixed';
  chargeDirection?: 'increase' | 'decrease';
  serviceCharge?: number;
  [key: string]: any;
};

interface ProcessPaymentResponse {
  debited: boolean;
  credited: boolean;
  payout: boolean;
  inserted: boolean;
  msg: string;
}

interface metaTagModel {
  title?: string;
  canonical?: any;
  description?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
}

interface AddonValueModel {
  packageId?: string;
  productsUploads?: number;
  planExpiresAt?: string;
  airtimeDiscount?: number;
  dataDiscount?: number;
  canMonetize?: boolean;
}

interface RevenueInfoModel {
  rate?: number;
  totalCashViews?: number;
  totalViews?: string;
  milles?: number;
  cpm?: number;
  revenue?: number;
  allRevenue?: number;
}

interface SubscriptionModel {
  id?: string;
  title?: string;
  userId: string;
  packageId?: string;
  level?: number;
  canMonetize?: boolean;
  brandId?: string;
  expiresAt?: any;
  planData?: any;
  addons?: any;
  productsUploads?: number;
  planExpiresAt?: any;
  airtimeDiscount?: number;
  dataDiscount?: number;
}

interface PlanDuration {
  name: string;
  value: number;
  title: string;
  months: number;
  discount: number;
}

type MenuItem = {
  href: string;
  sub?: MenuItem[];
};

interface SwitchStates {
  utility: boolean;
  creator: boolean;
  store: boolean;
  digital_asset: boolean;
  blog: boolean;
  custom: boolean;
}

interface BaseDataType {
  baseData: { url?: string; table?: string; title?: string };
  tag: string;
  table: string;
  conditions: any;
}

interface ParentsInfo {
  master: BrandType;
  parent: BrandType;
  other?: BrandType[];
}

interface RuleValueModel {
  value: number;
  plus: number;
  profit: number;
  sellerProfit: number;
}

interface OnRouteModel {
  isOpen?: boolean;
  isWidthFull?: 'yes' | 'no';
  isHeightFull?: 'yes' | 'no';
  base: string;
  action: string;
  name?: string;
  href?: string;
  hideScroll?: boolean;
  hideFooter?: boolean;
  position?: number;
  title?: string;
  slug?: string;
  type?: string;
  id?: string;
  others?: any;
  searchParams?: Record<string, string>;
  rates?: any;
  data?: any[];
  defaultData?: any;
  className?: string;
  silverImage?: string;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonText: string;
}

interface ThemeConfig {
  colors: ThemeColors;
  borderRadius: string;
  fontFamily: string;
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

interface GeoInfo {
  country?: string;
  city?: string;
  [key: string]: any;
}

interface MetaType {
  authorName?: string;
  brandName?: string;
  email?: string;
  phone?: string;
}

interface DropdownItem {
  value: string;
  label: string;
  id?: string;
  title?: string;
  name?: string;
  disabled?: boolean;
}

interface StatDataType {
  subscriptions?: StatType;
  sales?: StatType;
  users?: StatType;
  totalRevenue?: StatType;
  transactions?: StatType;
}

interface StatType {
  all?: number;
  thisMonth?: number;
  lastMonth?: number;
  data?: any[];
  title?: string;
  active?: number;
  durationData?: any[];
}

interface ViewRenderData {
  type: string;
  key: string;
  id: string;
  section: string;
  classes?: any[];
  sectionClasses?: any[];
  parentId?: string;
  data?: string;
  essentials: string[];
  preferences?: Preferences[];
}

interface ViewRenderLayout {
  hasHeader: boolean;
  hasBefore: boolean;
  hasAfter: boolean;
  hasFooter: boolean;
  leftSidebar: boolean;
  rightSidebar: boolean;
}

interface PageBuilderProps {
  user: UserTypes;
  siteInfo: BrandType;
  defaultData: PageBuilderData;
  onSave?: (data: PageBuilderData) => void;
  onClose?: () => void;
  id: string;
  iniSearchParams: any;
  setSections: React.Dispatch<React.SetStateAction<ViewRenderData[]>>;
  sections: ViewRenderData[];
}

interface Preferences {
  type: string;
  key: string;
  value: string;
}

interface PageBuilderData {
  layout: {
    hasHeader: boolean;
    hasBefore: boolean;
    hasAfter: boolean;
    hasFooter: boolean;
    leftSidebar: boolean;
    rightSidebar: boolean;
  };
  sections: ViewRenderData[];
}

interface SiteComponent {
  type: 'site_component' | 'custom_component';
  key: string;
  config?: any;
  classes?: ClassesConfig;
  preferences?: Preferences[];
  data?: string;
  section: 'header' | 'before' | 'left' | 'right' | 'main' | 'after' | 'footer';
  id: string;
}

type LayoutStructure = {
  header: SiteComponent[];
  before: SiteComponent[];
  left: SiteComponent[];
  right: SiteComponent[];
  main: SiteComponent[];
  after: SiteComponent[];
  footer: SiteComponent[];
};

type ClassesConfig = {
  width?: string;
  width_all?: string;
  height?: string;
  padding?: string;
  margin?: string;
  borders?: string;
  borderColors?: string;
  borderRadius?: string;
  flex?: string;
  text?: string;
  textColor?: string;
  background?: string;
  shadows?: string;
  grid?: string;
  positions?: string;
  animations?: string;
};

interface ServiceSettings {
  homepage?: string;
}
interface searchParamsModel {
  serviceType?: string;
  pf?: string;
}

interface ComponentRendererProps {
  componentKey: keyof ComponentMap;
  component: SiteComponent;
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
  navigation?: NavigationState[];
  classes?: any;
  preference?: any;
  className?: string;
  data?: any;
  rows?: ViewRenderData[];
  rates?: any;
  pageEssentials?: any;
  onCallback?: (data: any) => void;
  viewType?: string;
}

type SortDirection = 1 | -1 | 'asc' | 'desc';
type SortOptions = string | { [key: string]: SortDirection } | Array<[string, SortDirection]>;

interface TopicType {
  id: string;
  title: string;
  body?: string;
  message?: string;
  description?: string;
  chapterId?: any;
  image?: FileType;
  subTitle?: string;
}

interface AiModelType {
  id?: string;
  title?: string;
  partnerName?: string;
  partnerId?: string;
  unitValue?: number;
  maxTokenKey?: 'max_completion_tokens' | 'max_tokens';
}

interface ChapterType {
  id: string;
  title: string;
  body?: string;
  message?: string;
  description?: string;
  topics?: TopicType[];
  image?: FileType;
}

interface SendMailData {
  to: string[];
  from: string;
  subject: string;
  body: { data: any; templateId?: string };
  brand?: BrandType;
}

interface PaymentOptionsType {
  name: string;
  label: string;
  desc: string;
  disabled?: boolean;
  channels?: Array<'card' | 'bank' | 'ussd' | 'qr' | 'bank_transfer'>;
  sp: 'wallet' | 'cash' | 'paystack' | 'flutterwave' | 'free';
}

interface LimitRequirement {
  text: string;
  isStriked?: boolean;
}

interface _Level {
  tier: number;
  dailyLimit: number[];
  monthlyLimit: number[];
  limits: LimitRequirement[];
  buttonLabel: string;
  hasRangeLimit: boolean;
  reguirements: string[];
}

/**
 * Represents an HTTP status code and its description.
 * @property {number} code The HTTP status code.
 * @property {string} description The description of the status code.
 * @property {'Success' | 'Client Error' | 'Server Error'} category The category of the status code.
 */
interface HttpStatusCodeWithDescription {
  code: number;
  description: string;
  category: 'Success' | 'Client Error' | 'Server Error';
}

interface ViewProps {
  params: string[];
  paramSource?: string | number;
  plateForm?: 'web' | 'app' | 'pwa';
  table?: string;
  renderPage?: string;
  siteInfo?: BrandType;
  auth?: AuthModel;
  onDone?: (data: any) => void;
  viewType?: 'view' | 'modal';
  defaultData?: any;
  seg1?: string;
  conditions?: Record<string, any>[];
}

interface ActionProps {
  params: { action: string; base: string; seg1: string };
  siteInfo: any;
  user: any;
  auth: any;
  data: any;
  type?: string;
  status?: string;
  id?: string;
  baseData: any;
}

interface Menus {
  id?: string;
  name?: string;
  links?: any[];
  position?: 'main' | 'mobile' | 'footer';
  link?: string;
  description?: string;
  createdAt?: Date;
}

type PreferenceItem = {
  type: 'image' | 'text' | 'textarea' | 'link' | 'menus' | 'lists' | 'icon' | 'tw_color' | 'radio';
  key: string;
  value: string | PreferenceItem[][] | any;
  data?: any;
  title?: string;
};

interface DNSRecord {
  type: string;
  name: string;
  content: any;
  proxied?: boolean;
  priority?: number;
  ttl?: number;
}
