import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { bulkUpsert, deleteDataWithConditions, fetchData } from '@/app/api/database/mongodb';
import slugify from 'slugify';
import { staticImage } from '@/app/utils/get_static_image';
import { masterBrandData, masterUserData } from '@/app/data/master';

interface Company {
  ID: string;
  NAME: string;
  PRODUCT: CBKProduct[];
}

interface ServiceProviderType {
  [key: string]: Company[];
}

export async function cbk_import_electric() {
  console.info('starting electric product import...');
  try {
    const cbk_userId = process.env.CLUBK_USERID;
    if (!cbk_userId) {
      return invalid_response('CLUBK_USERID environment variable is not set.');
    }

    const url = `https://www.nellobytesystems.com/APIElectricityDiscosV1.asp?UserID=${cbk_userId}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      return invalid_response(`Failed to fetch data: ${response.statusText}`);
    }

    const res = await response.json();
    const products: ServiceProviderType = res.ELECTRIC_COMPANY;

    const productsData: ProductTypes[] | DataType[] = [];

    await deleteDataWithConditions({
      collectionName: 'service_providers',
      conditions: { type: 'electric' },
      ignoreCache: true,
    });

    for (const [providerKey, providerValue] of Object.entries(products)) {
      for (const company of providerValue) {
        const slug = slugify(`${providerKey}-electricity`, {
          lower: true,
          strict: true,
        });

        const data: ServiceProviderTypes = {
          id: company.ID,
          slug: slug,
          name: providerKey,
          type: 'electric',
          service_area: 'NG',
          airtime_to_cash: false,
          discount: '',
          discount_type: '',
          others: {
            name: company.NAME,
          },
        };

        await bulkUpsert([data], 'service_providers');

        const spRes = await fetchData('service_providers', slug);
        const spId = spRes?.id;

        if (spId) {
          for (const product of company.PRODUCT) {
            const { PRODUCT, ...companyWithoutProduct } = company;

            const productData: DataType | any = {
              spId: spId,
              spName: providerKey,
              title: `${product.PRODUCT_TYPE}`,
              slug: slugify(`${providerKey}-${product.PRODUCT_TYPE}`, {
                lower: true,
                strict: true,
              }),
              price: 1,
              priceMode: 'multiply',
              minimumAmount: product.MINIMUN_AMOUNT,
              maximumAmount: product.MAXIMUM_AMOUNT,
              userId: masterUserData.id,
              brandId: masterBrandData.id,
              parentBrandId: masterBrandData.id,
              currency: 'NGN',
              currencySymbol: '₦',
              serviceType: 'utility',
              image: staticImage(providerKey),
              type: 'electric',
              partner: 'cbk',
              others: {
                cbkProductData: product,
                cbkProviderData: companyWithoutProduct,
              },
            };
            productsData.push(productData as any);
          }
        }
      }
    }

    if (productsData.length > 0) {
      await bulkUpsert(productsData, 'products');
    }

    console.info('electric import completed');
    return api_response({ success: true, target: 'import_service provider' });
  } catch (error) {
    console.error('Error importing data plans:', error);
    return invalid_response(`Error importing data plans: ${error}`);
  }
}
