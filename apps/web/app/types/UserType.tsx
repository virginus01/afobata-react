interface UserTypes {
  /** Unique identifier for the user */
  id?: string;

  uid?: string;

  _id?: string;

  hash?: string;

  /** Fullname of the user */
  name?: string;

  accessToken?: any;

  isTester?: boolean;

  /** Array of wallet objects associated with the user */
  wallets?: WalletTypes[];

  ai_units?: number;

  status?: 'suspended' | 'active';

  slug?: string;

  /** Username for user login or display */
  username?: string;

  packageId?: string;

  /** User's country of residence */
  country?: string;

  /** User's city of residence */
  city?: string;

  /** User's state of residence */
  state?: string;

  bankCodeSp?: string;

  /** Full address of the user */
  address?: string;

  /** User's email address */
  email?: string;

  /** User's hashed password */
  password?: string;

  password_confirm?: string;

  /** User's phone number */
  phone?: string;

  /** Identifier for the admin or user who added this user */
  userId?: string;

  /** User's bank account number */
  accountNumber?: number | any;

  /** Name associated with the user's bank account */
  accountName?: string;

  /** Bank where the user's account is held */
  customerBank?: string;

  /** Code for the user's bank */
  bankCode?: string;

  /** API secret key for system integration */
  api_secret?: string;

  /** Virtual account number assigned to the user */
  vaNumber?: string;

  /** Date of birth of the user */
  dob?: string;

  /** Gender of the user */
  gender?: string;

  /** Identifier for the user's selected profile */
  selectedProfile?: string;

  emailVerified?: boolean;

  /** User's first name */
  firstName?: string;

  /** User's last name */
  lastName?: string;

  /** API key associated with the user */
  api_key?: string;

  /** Store object associated with the user */
  store?: storeType;

  /** Loyalty or reward points for the user */
  honeyPoint?: string;

  mille?: number;

  /** URL-friendly identifier for the user's store */
  storeSlug?: string;

  /** Identifier for the user who registered the user */
  registeredBy?: string;

  /** Identifier for the brand under which the user was registered */
  joinedBrandId?: string;

  /** Identifier for the brand under which the user is currenly logged in used to determine the user menu */
  loggedBrandId?: string;

  brandId?: string;

  countryId?: string;

  defaultCurrency?: string;

  defaultCurrencyCode?: string;

  ipInfo?: VisitorInfo;

  /** Indicates if the user has admin privileges (0 for no, 1 for yes) */
  isAdmin?: boolean;

  token?: Token;

  plan?: PackageTypes;

  brand?: BrandType | any;

  bankData?: _BankPaymentInfo;

  fundSources?: _FundSouces[];

  cashViews?: number;

  wallet?: WalletTypes;

  otherWallets?: WalletTypes[];

  subscription?: SubscriptionModel;

  subscriptionId?: string;

  currencyInfo?: CurrencyType;

  verificationData?: VerificationData;

  level?: number;

  paystackCustomerId?: string;

  auth?: AuthModel;

  stat?: Stat;

  bossId?: string;
}

interface VerificationData {
  nin?: string;
  bvn?: string;
  verifiedName?: string;
  bvnVerified?: boolean;
  ninVerified?: boolean;
  bankData?: _BankPaymentInfo;
}

type UserEssentials = {
  brand: BrandType | null;
  user: UserTypes | null;
  auth: AuthModel | null;
};

type Token = {
  code: string;
  value: string;
  expire: number | Date | string;
};

type Stat = {
  totalRevenue?: number;
  subscriptions?: number;
  users?: number;
  sales?: number;
};

interface UserContextProps {
  user: UserTypes | null;
  userId: string;
  isLogged: boolean;
  isUserSidebarOpen: boolean;
  isUserLoaded: boolean;
  nav: any[];
  isSwitchProfileOpen: boolean;
  profiles: any[];
  wallets: any[] | null;
  setWallets: (wallets: any[]) => void;
  selectedProfile: string;
  setSelectedProfile: (selectedProfile: string) => void;
  setWalletType: (walletType: string) => void;
  setIsUserSidebarOpen: (value: boolean) => void;
  setUser: (user: UserTypes | null) => void;
  setUserId: (userId: string) => void;
  setIsLogged: (isLogged: boolean) => void;
  setIsSwitchProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleIsSwitchProfileOpen: () => void;
  setLinks: React.Dispatch<React.SetStateAction<string[]>>;
  updateEssentialData: (data: {
    user?: UserTypes;
    auth?: AuthModel;
    brand?: BrandType;
    siteInfo?: BrandType;
    nav?: any;
    rates?: any;
  }) => void;
  essentialData: {
    user: UserTypes;
    auth: AuthModel;
    brand: BrandType;
    siteInfo: BrandType;
    nav: any;
    rates: any;
  };
  setEssentialData: React.Dispatch<
    React.SetStateAction<{
      user: UserTypes;
      auth: AuthModel;
      brand: BrandType;
      siteInfo: BrandType;
      nav: any;
      rates: any;
    }>
  >;
  essentialDataLoading: boolean;
  params: { action: string; base: string; seg1: string };
  setParams: React.Dispatch<
    React.SetStateAction<{
      action: string;
      base: string;
      seg1: string;
    }>
  >;
}
