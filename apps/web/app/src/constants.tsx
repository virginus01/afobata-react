export * from '@/app/navigations/creator';
export * from '@/app/routes/api_routes';
export * from '@/app/routes/page_routes';
export * from '@/app/routes/admin_routes';
export * from '@/app/routes/api_routes';
export * from '@/app/routes/page_routes';
export * from '@/app/src/svg_icons';

export const PRIMARY_COLOR = 'red-500';
export const PRIMARY_COLOR_STYLE = '#490249';

//start of view routes

export const mode: 'test' | 'live' = process.env.NODE_ENV === 'development' ? 'test' : 'live';
export const cbkMode: 'live' | 'test' = process.env.NODE_ENV === 'development' ? 'test' : 'live';

export const liveDomain: string = 'afobata.com';
export const MASTER_BRAND_ID: string = '11';

export const cacheDuration = process.env.NODE_ENV === 'development' ? 0 : 600;

export const BLOCKSTREAM_API_URL =
  mode === 'test' ? 'https://blockstream.info/testnet/api' : 'https://blockstream.info/api';

export const emptySelect = [
  {
    label: 'Select Option',
    value: '',
    disabled: false,
  },
];

export const domainVerifitionConstants = {
  ns1: 'ns1.vercel-dns.com',
  ns2: 'ns2.vercel-dns.com',
  type: 'A',
  name: '@',
  value: '76.76.21.21',
  type2: 'TXT',
  name2: '_vercel',
  value2: '51890b34334f8a43d92d',
};

export const CRUD_CONFIG = {
  csrfIgnoredRoutes: [''],
  protectedTables: [''],
  allowedTables: ['users', 'wallets', 'subscriptions', 'brands', 'posts', 'products', 'pages'],
};

export const paymentGts = ['paystack'];

export const activeSps = {
  data: 'cbk',
  airtime: 'cbk',
  electric: 'cbk',
  education: 'cbk',
  tv: 'cbk',
  betting: 'cbt',
  payout: 'paystack',
};

export const currentHost: 'vercel' | 'amplify' = 'vercel';

export const centralDomain = 'afo.com';

export const availableAiModels: AiModelType[] = [
  {
    id: 'mar-2025',
    title: '{name} o1',
    partnerName: 'OpenAI o1',
    partnerId: 'o1',
    unitValue: 0.015,
    maxTokenKey: 'max_completion_tokens',
  },
  {
    id: 'feb-2025',
    title: '{name}-4 Turbo',
    partnerName: 'GPT-4 Turbo',
    partnerId: 'gpt-4-turbo',
    unitValue: 0.0011,
    maxTokenKey: 'max_tokens',
  },
  {
    id: 'july-2024',
    title: '{name}-4o',
    partnerName: 'GPT-4o',
    partnerId: 'gpt-4o',
    unitValue: 0.0025,
    maxTokenKey: 'max_tokens',
  },
  {
    id: 'june-2024',
    title: '{name}-4o mini',
    partnerName: 'GPT-4o mini',
    partnerId: 'gpt-4o-mini',
    unitValue: 0.00015,
    maxTokenKey: 'max_tokens',
  },
  {
    id: 'may-2024',
    title: '{name}-3.5 Turbo',
    partnerName: 'GPT-3.5 Turbo',
    partnerId: 'gpt-3.5-turbo-1106',
    unitValue: 0.00005,
    maxTokenKey: 'max_tokens',
  },
];

export const BASE_AI_MODEL: AiModelType = availableAiModels.find((b) => b.id === 'june-2024') ?? {};

export const csrfIgnoredRotes = ['callback'];
export const trustIgnore = ['run_cron_job', 'callback'];

export const authenticationIgnore = [
  'api_get_brand',
  'api_get_exchange_rates',
  'api_dynamic_get_data',
  'api_get_csrf',
  'run_cron_job',
  'api_get_exchange_rates',
  'callback',
  'api_create_order',
  'api_get_views',
];

export const supported_lang = [{ id: 'en', name: 'English' }];

export const FREE_PACKAGE_ID = 'starter_package';

export const customStyles: Record<number, string> = {
  0: '',
  1: 'rounded-lg brand-bg-primary hover:bg-[hsl(var(--primary-background-light))] text-xs items-center font-bold whitespace-nowrap brand-text-primary shadow-xl shadow-gray-300 dark:shadow-none',
  2: 'rounded-lg brand-bg-secondary hover:bg-[hsl(var(--secondary-background-light))] text-xs items-center font-bold whitespace-nowrap brand-text-secondary shadow-xl shadow-gray-300 dark:shadow-none',
  3: 'rounded-lg brand-bg-primary hover:bg-[hsl(var(--primary-background-light))] text-sm font-semibold whitespace-nowrap brand-text-primary shadow-md shadow-gray-300 dark:shadow-none',
  4: 'rounded-full brand-bg-primary hover:bg-[hsl(var(--primary-background-light))] text-base font-bold whitespace-nowrap brand-text-primary shadow-lg shadow-gray-300 dark:shadow-none',
  5: 'rounded-full brand-bg-primary hover:bg-[hsl(var(--primary-background-light))] text-base font-bold whitespace-nowrap brand-text-primary shadow-lg shadow-gray-300 dark:shadow-none',
  6: 'rounded-lg brand-bg-primary hover:bg-[hsl(var(--primary-background-light))] text-xs font-bold whitespace-nowrap brand-text-primary shadow-xl shadow-gray-300 dark:shadow-none',
};

export const colorGroups = {
  none: [null],
  black: [null],
  white: [null],
  'text-primary': [null],
  gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  red: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  yellow: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  green: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  blue: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  indigo: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  purple: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  pink: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
} as const;

export const purchaseCur: CurrencyType[] = [
  {
    currencyCode: 'EUR',
  },
];

export const colorKeys = [
  'primaryForegroundLight',
  'secondaryForegroundLight',
  'primaryBackgroundLight',
  'secondaryBackgroundLight',
  'foregroundLight',
  'backgroundLight',
  'cardForegroundLight',
  'cardBackgroundLight',
  'primaryForegroundDark',
  'secondaryForegroundDark',
  'primaryBackgroundDark',
  'secondaryBackgroundDark',
  'foregroundDark',
  'backgroundDark',
  'cardForegroundDark',
  'cardBackgroundDark',
] as const;

export const defaultColors: Record<(typeof colorKeys)[number], string> | any = {
  // Light Theme
  primaryForegroundLight: '0 0% 98%', // near white
  secondaryForegroundLight: '0 0% 85%', // soft gray
  primaryBackgroundLight: '38 92% 50%', // amber/gold
  secondaryBackgroundLight: '160 60% 45%', // teal green
  foregroundLight: '0 0% 9%', // near black
  backgroundLight: '0 0% 98%', // very light gray (almost white)
  cardForegroundLight: '210 15% 15%', // dark slate
  cardBackgroundLight: '210 25% 99%', // light slate

  // Dark Theme
  primaryForegroundDark: '38 100% 90%', // warm yellow/amber tint for visibility
  secondaryForegroundDark: '160 60% 80%', // bright teal for secondary
  primaryBackgroundDark: '38 100% 25%', // dark amber/gold
  secondaryBackgroundDark: '160 50% 20%', // dark teal
  foregroundDark: '0 0% 90%', // soft white
  backgroundDark: '240 15% 8%', // near black with slight blue
  cardForegroundDark: '0 0% 90%', // soft white
  cardBackgroundDark: '240 10% 12%', // very dark slate
} as const;

export const bgPs: any[] = ['afobata.com', 'lasgold.com'];
