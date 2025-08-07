interface AuthModel {
  /** Unique identifier for the user */
  id?: string;

  uid?: string;

  _id?: string;

  /** Full name of the user */
  name?: string;

  userId?: string;

  tier?: number;

  expiresAt?: string;

  isTester?: boolean;

  status?: 'suspended' | 'active';

  buildNumber?: string;

  accessToken?: string;

  providerId?: string;

  /** Username for user login or display */
  username?: string;

  packageId?: string;

  /** User's country of residence */
  country?: string;

  /** User's city of residence */
  city?: string;

  /** User's state of residence */
  state?: string;

  /** Full address of the user */
  address?: string;

  /** User's email address */
  email?: string;

  /** User's hashed password */
  password?: string;

  password_confirm?: string;

  /** User's phone number */
  phone?: string;

  /** API secret key for system integration */
  api_secret?: string;

  /** Virtual account number assigned to the user */
  vaNumber?: string;

  /** Date of birth of the user */
  dob?: string;

  /** Gender of the user */
  gender?: string;

  emailVerified?: boolean;

  /** User's first name */
  firstName?: string;

  /** User's last name */
  lastName?: string;

  /** API key associated with the user */
  api_key?: string;

  /** Identifier for the user who registered the user */
  registeredBy?: string;

  /** Identifier for the brand under which the user was registered */
  joinedBrandId?: string;

  /** Identifier for the brand under which the user is currenly logged in used to determine the user menu */
  loggedBrandId?: string;

  brandId?: string;

  countryId?: string;

  defaultCurrency?: string;

  ipInfo?: VisitorInfo;

  /** Indicates if the user has admin privileges (0 for no, 1 for yes) */
  isAdmin?: boolean;

  token?: any;

  verificationData?: VerificationData;

  dailyLimit?: number;

  monthlyLimit?: number;
}
