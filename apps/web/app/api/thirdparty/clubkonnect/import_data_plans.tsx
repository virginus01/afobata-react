import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { bulkUpsert, deleteDataWithConditions, fetchData } from '@/app/api/database/mongodb';
import slugify from 'slugify';
import { stripePrices } from '@/app/helpers/stripePrices';
import { staticImage } from '@/app/utils/get_static_image';
import { masterBrandData, masterUserData } from '@/app/data/master';
import getIndexById from '@/api/thirdparty/sorting';

interface Product {
  PRODUCT_ID?: string;
  PRODUCT_NAME?: string;
  PRODUCT_AMOUNT?: string;
  PACKAGE_ID?: string;
  PACKAGE_NAME?: string;
  PACKAGE_AMOUNT?: string;
}

interface Company {
  ID: string;
  NAME: string;
  PRODUCT: Product[];
}

interface ServiceProviderType {
  [key: string]: Company[];
}

const fetchAndProcessData = async (url: string, providerKey: string) => {
  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  const products: ServiceProviderType = res.MOBILE_NETWORK;

  const productsData: ProductTypes[] = [];

  for (const [providerKey, providerValue] of Object.entries(products)) {
    for (const company of providerValue) {
      const slug = slugify(`network-${providerKey}`, {
        lower: true,
        strict: true,
      });

      const index = await getIndexById(providerKey.toLowerCase());

      const data: ServiceProviderTypes = {
        id: providerKey.toLowerCase(),
        slug: slug,
        name: providerKey,
        index,
        type: 'data',
        service_area: 'NG',
        airtime_to_cash: true,
        discount: '',
        discount_type: '',
        others: { name: company.NAME },
      };

      await bulkUpsert([data], 'service_providers');

      const spRes = await fetchData('service_providers', slug);
      const spId = spRes.id;

      if (spId) {
        const { PRODUCT, ...companyWithoutProduct } = company;
        for (const product of company.PRODUCT) {
          const productData: DataType | any = {
            slug: slugify(`${providerKey}-${product.PRODUCT_ID || product.PACKAGE_ID}`, {
              lower: true,
              strict: true,
            }),
            title: stripePrices(product.PRODUCT_NAME!) || stripePrices(product.PACKAGE_NAME!),
            price: parseFloat(product.PRODUCT_AMOUNT || product.PACKAGE_AMOUNT || '0'),
            spId: spId,
            spName: providerKey,
            userId: masterUserData.id,
            brandId: masterBrandData.id,
            parentBrandId: masterBrandData.id,
            serviceType: 'utility',
            type: 'data',
            currency: 'NGN',
            currencySymbol: '₦',
            image: staticImage(providerKey),
            partner: 'cbk',
            orderValue: product.PRODUCT_ID,
            others: {
              cbkProductData: product,
              cbkProviderData: companyWithoutProduct,
            },
          };
          productsData.push(productData);
        }

        const airtimeData: DataType | any = {
          slug: slugify(`${providerKey}-airtime-direct`, {
            lower: true,
            strict: true,
          }),
          title: `${providerKey} Direct Airtime Recharge`,
          minimumAmount: '50',
          maximumAmount: '50000',
          spId: spId,
          price: 1,
          priceMode: 'multiply',
          spName: providerKey,
          userId: masterUserData.id,
          brandId: masterBrandData.id,
          parentBrandId: masterBrandData.id,
          serviceType: 'utility',
          image: staticImage(providerKey),
          type: 'airtime',
          currency: 'NGN',
          currencySymbol: '₦',
          partner: 'cbk',
          others: {
            cbkProductData: {},
            cbkProviderData: companyWithoutProduct,
          },
        };
        productsData.push(airtimeData as any);
      }
    }
  }

  return productsData;
};

export async function cbk_import_data_plans() {
  console.info('starting data plan import...');
  try {
    const cbk_userId = process.env.CLUBK_USERID;
    if (!cbk_userId) {
      return invalid_response('CLUBK_USERID environment variable is not set.');
    }

    const urls = [
      `https://www.nellobytesystems.com/APIDatabundlePlansV2.asp?UserID=${cbk_userId}`,
      `https://www.nellobytesystems.com/APISmilePackagesV2.asp?UserID=${cbk_userId}`,
      `https://www.nellobytesystems.com/APISpectranetPackagesV2.asp?UserID=${cbk_userId}`,
    ];

    const productsData: ProductTypes[] = [];

    for (const url of urls) {
      const providerKey = url.includes('DatabundlePlans')
        ? 'Databundle'
        : url.includes('SmilePackages')
          ? 'Smile'
          : 'Spectranet';
      const data = await fetchAndProcessData(url, providerKey);
      productsData.push(...data);
    }

    if (productsData.length > 0) {
      await deleteDataWithConditions({
        collectionName: 'products',
        conditions: { partner: 'cbk', $or: [{ type: 'data' }, { type: 'airtime' }] },
        ignoreCache: true,
      });

      await bulkUpsert(productsData, 'products');
    }

    console.info('data plan import completed');
    return api_response({ success: true, target: 'import_service_provider' });
  } catch (error) {
    console.error('Error importing data plans:', error);
    return invalid_response(`Error importing data plans: ${error}`);
  }
}
