class User {
  id?: string | null = '';
  uid?: string | null = '';
  _id?: string | null = '';
  hash?: string | null = '';
  name?: string | null = '';
  accessToken?: any | null = '';
  isTester?: boolean | null = null;
  wallets?: WalletTypes[] | null = [];
  ai_units?: number | null = 0;
  status?: 'suspended' | 'active' | null = 'active';
  slug?: string | null = '';
  username?: string | null = '';
  packageId?: string | null = '';
  country?: string | null = '';
  city?: string | null = '';
  state?: string | null = '';
  bankCodeSp?: string | null = '';
  address?: string | null = '';
  email?: string | null = '';
  password?: string | null = '';
  password_confirm?: string | null = '';
  phone?: string | null = '';
  userId?: string | null = '';
  accountNumber?: number | string | null = '';
  accountName?: string | null = '';
  customerBank?: string | null = '';
  bankCode?: string | null = '';
  api_secret?: string | null = '';
  vaNumber?: string | null = '';
  dob?: string | null = '';
  gender?: string | null = '';
  selectedProfile?: string | null = '';
  emailVerified?: boolean | null = null;
  firstName?: string | null = '';
  lastName?: string | null = '';
  api_key?: string | null = '';
  store?: storeType | null = null;
  honeyPoint?: string | null = '';
  mille?: number | null = 0;
  storeSlug?: string | null = '';
  registeredBy?: string | null = '';
  joinedBrandId?: string | null = '';
  loggedBrandId?: string | null = '';
  brandId?: string | null = '';
  countryId?: string | null = '';
  defaultCurrency?: string | null = '';
  defaultCurrencyCode?: string | null = '';
  ipInfo?: VisitorInfo | null = null;
  isAdmin?: boolean | null = null;
  token?: Token | null = null;
  plan?: PackageTypes | null = null;
  brand?: BrandType | null = null;
  bankData?: _BankPaymentInfo | null = null;
  fundSources?: _FundSouces[] | null = [];
  cashViews?: number | null = 0;
  wallet?: WalletTypes | null = null;
  otherWallets?: WalletTypes[] | null = [];
  subscription?: SubscriptionModel | null = null;
  currencyInfo?: CurrencyType | null = null;
  verificationData?: VerificationData | null = {
    nin: '',
    bvn: '',
    verifiedName: '',
    bvnVerified: false,
    ninVerified: false,
    bankData: {} as any,
  };
  level?: number | null = 0;
  paystackCustomerId?: string | null = '';
  auth?: AuthModel | null = null;

  constructor(data?: Partial<User>) {
    if (data) Object.assign(this, data);
  }
}
