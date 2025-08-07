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

export async function cbk_import_tv_plans() {
  console.info('starting tv plans import...');
  try {
    const cbk_userId = process.env.CLUBK_USERID;
    if (!cbk_userId) {
      return invalid_response('CLUBK_USERID environment variable is not set.');
    }

    const url = `https://www.nellobytesystems.com/APICableTVPackagesV2.asp?UserID=${cbk_userId}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      return invalid_response(`Failed to fetch data: ${response.statusText}`);
    }

    const res = await response.json();
    const products: ServiceProviderType = res.TV_ID;

    const productsData: ProductTypes[] = [];

    for (const [providerKey, providerValue] of Object.entries(products)) {
      for (const company of providerValue) {
        const slug = slugify(`tv-cable-${providerKey}`, {
          lower: true,
          strict: true,
        });

        const data: ServiceProviderTypes = {
          id: providerKey.toLowerCase(),
          slug,
          name: providerKey,
          type: 'tv',
          service_area: 'NG',
          airtime_to_cash: false,
          others: {
            name: company.NAME,
          },
        };

        await bulkUpsert([data], 'service_providers');

        const spRes = await fetchData('service_providers', slug);
        const spId = spRes.id;

        if (spId) {
          for (const product of company.PRODUCT) {
            const { PRODUCT, ...companyWithoutProduct } = company;

            const productData: DataType | any = {
              slug: slugify(`${providerKey}-${product.PACKAGE_ID}`, {
                lower: true,
                strict: true,
              }),
              title: product.PACKAGE_NAME,
              price: parseFloat(product.PACKAGE_AMOUNT),
              spId: spId,
              spName: providerKey,
              userId: masterUserData.id,
              brandId: masterBrandData.id,
              parentBrandId: masterBrandData.id,
              serviceType: 'utility',
              currency: 'NGN',
              currencySymbol: '₦',
              image: staticImage(providerKey),
              type: 'tv',
              partner: 'cbk',
              orderValue: product.PRODUCT_ID,
              others: {
                cbkProductData: product,
                cbkProviderData: companyWithoutProduct,
              },
            };
            productsData.push(productData);
          }
        }
      }
    }

    if (productsData.length > 0) {
      await deleteDataWithConditions({
        collectionName: 'products',
        conditions: { partner: 'cbk', $or: [{ type: 'tv' }] },
        ignoreCache: true,
      });
      await bulkUpsert(productsData, 'products');
    }
    console.info('service provider import completed');
    return api_response({ success: true, target: 'import_service provider' });
  } catch (error) {
    console.error('Error importing data plans:', error);
    return invalid_response(`Error importing data plans: ${error}`);
  }
}
