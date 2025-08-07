import { Brand } from '@/app/models/Brand';

const testerBrandData = new Brand();
testerBrandData.id = '22';
testerBrandData.userId = '222';
testerBrandData.name = 'sistester';
testerBrandData.slug = 'sistester';
testerBrandData.brandId = '22';
testerBrandData.domain = 'sistester.site';
testerBrandData.subDomain = 'sistester';
testerBrandData.type = 'creator';
testerBrandData.isDefault = false;
testerBrandData.isTester = true;
testerBrandData.logo = {};
testerBrandData.icon = {};
testerBrandData.pendingDomain = '';
testerBrandData.profiles = [];

export { testerBrandData };

export const testerUserData: UserTypes = {
  isAdmin: true,
  firstName: 'Alajekwu',
  lastName: 'Virginus',
  email: 'info.vsolace@gmail.com',
  registeredBy: '222',
  joinedBrandId: '22',
  loggedBrandId: '22',
  brandId: '22',
  defaultCurrency: 'NGN',
  country: 'NG',
  defaultCurrencyCode: '₦',
  api_key: 'B65RWSR54DE3E4',
  api_secret: process.env.MASTER_API_SECRET,
  id: '222',
  uid: '2',
  token: {} as any,
  emailVerified: true,
  packageId: 'starter-package',
};

export const testerAuthData: UserTypes = {
  isAdmin: true,
  firstName: 'Virginus',
  lastName: 'Alajekwu',
  email: 'info.vsolace@gmail.com',
  password: '$2b$10$JVXymEaqNo3o1DjoJgWep.C3J/y.WBGD4nXfHX1ujw2xf/NzSyPh.',
  registeredBy: '222',
  joinedBrandId: '22',
  loggedBrandId: '22',
  api_key: 'B65RWSR54DE3E4',
  api_secret: process.env.MASTER_API_KEY,
  id: '2',
  uid: '16DkLJQg6cfW1adoVfm6mU5W9lF2',
  defaultCurrency: 'NGN',
  country: 'NG',
  token: {} as any,
  emailVerified: true,
  packageId: 'starter_package',
};
