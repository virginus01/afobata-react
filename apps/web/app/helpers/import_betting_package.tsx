import slugify from 'slugify';
import { bulkUpsert, fetchData } from '@/app/api/database/mongodb';
import { staticImage } from '@/app/utils/get_static_image';
import { masterBrandData, masterUserData } from '@/app/data/master';
import { invalid_response } from '@/app/helpers/invalid_response';
import { api_response } from '@/app/helpers/api_response';

interface BettingCompany {
  PRODUCT_CODE: string;
}

interface BettingCompaniesType {
  BETTING_COMPANY: BettingCompany[];
}

const fetchAndProcessBettingData = async (url: string) => {
  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  const bettingCompanies: BettingCompaniesType = res;

  const productsData: ProductTypes[] = [];

  for (const company of bettingCompanies.BETTING_COMPANY) {
    const slug = slugify(`betting-${company.PRODUCT_CODE}`, {
      lower: true,
      strict: true,
    });

    const data: ServiceProviderTypes = {
      id: company.PRODUCT_CODE.toLowerCase(),
      slug: slug,
      name: company.PRODUCT_CODE,
      type: 'betting',
      service_area: 'NG',
      discount: '',
      discount_type: '',
      others: { product_code: company.PRODUCT_CODE },
    };

    await bulkUpsert([data], 'service_providers');

    const spRes = await fetchData('service_providers', slug);
    const spId = spRes.id;

    if (spId) {
      const productData: DataType | any = {
        slug: slugify(`${company.PRODUCT_CODE}-betting-plan`, {
          lower: true,
          strict: true,
        }),
        title: `${company.PRODUCT_CODE} Betting Plan`,
        spId: spId,
        spName: company.PRODUCT_CODE,
        available: 0,
        userId: masterUserData.id,
        brandId: masterBrandData.id,
        parentBrandId: masterBrandData.id,
        type: 'betting',
        currency: 'NGN',
        currencySymbol: '₦',
        serviceType: 'utility',
        image: staticImage(spId),
        partner: 'cbk',
        others: {
          bettingCompanyData: company,
        },
      };
      productsData.push(productData);
    }
  }

  return productsData;
};

export async function import_betting_plans() {
  console.info('starting betting plans import...');
  try {
    const cbk_userId = process.env.CLUBK_USERID;
    if (!cbk_userId) {
      return invalid_response('CLUBK_USERID environment variable is not set.');
    }

    const url = `https://www.nellobytesystems.com/APIBettingCompaniesV2.asp?UserID=${cbk_userId}`;

    const productsData = await fetchAndProcessBettingData(url);

    if (productsData.length > 0) {
      await bulkUpsert(productsData, 'products');
    }

    console.info('betting plans import completed');
    return api_response({ success: true, target: 'import_betting_provider' });
  } catch (error) {
    console.error('Error importing betting plans:', error);
    return invalid_response(`Error importing betting plans: ${error}`);
  }
}

//https://chatgpt.com/c/5795c808-4e34-422b-9e67-84d15735275b
