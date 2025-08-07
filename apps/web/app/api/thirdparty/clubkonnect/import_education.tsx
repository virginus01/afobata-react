import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { bulkUpsert, fetchDataWithConditions } from '@/app/api/database/mongodb';
import slugify from 'slugify';
import { masterBrandData, masterUserData } from '@/app/data/master';
import { initializeCBK } from '@/api/thirdparty/clubkonnect/clubkonnet';
import { initializeMBNIG, sendMBNIGReq } from '@/api/thirdparty/mobilenig/mobilenig';
import { isNull } from '@/app/helpers/isNull';

export async function import_education_services() {
  console.info('starting education import...');
  try {
    const cbk_userId = process.env.CLUBK_USERID;
    if (!cbk_userId) {
      return invalid_response('CLUBK_USERID environment variable is not set.');
    }

    // Define service providers
    const serviceProviders = [
      {
        id: 'waec',
        slug: 'education-services-waec',
        name: 'WAEC',
      },
      {
        id: 'jamb',
        slug: 'education-services-jamb',
        name: 'JAMB',
      },
      {
        id: 'neco',
        slug: 'education-services-neco',
        name: 'NECO',
      },
    ].map((sp) => ({
      ...sp,
      type: 'education',
      service_area: 'NG',
      airtime_to_cash: false,
      currency: 'NGN',
      currencySymbol: '₦',
      others: {},
    }));

    // Insert service providers
    await bulkUpsert(serviceProviders, 'service_providers');

    // Fetch inserted service providers to get their IDs
    const spRes = await fetchDataWithConditions('service_providers', {
      type: 'education',
    });

    // Get specific provider IDs
    const waecSpId = spRes.find((sp: any) => sp.id === 'waec')?.id;
    const jambSpId = spRes.find((sp: any) => sp.id === 'jamb')?.id;
    const necoSpId = spRes.find((sp: any) => sp.id === 'neco')?.id;

    const productsData = [];

    // ===== WAEC - ClubKonnet =====
    try {
      const waecUrl = `${await initializeCBK({
        route: 'APIWAECPackagesV2.asp',
      })}`;

      const waecResponse = await fetch(waecUrl);
      const waecData = await waecResponse.json();

      if (waecSpId && waecData.EXAM_TYPE) {
        for (const product of waecData.EXAM_TYPE) {
          productsData.push({
            slug: slugify(`waec-${product.PRODUCT_CODE}`, { lower: true, strict: true }),
            title: product.PRODUCT_DESCRIPTION,
            price: parseFloat(product.PRODUCT_AMOUNT),
            spId: waecSpId,
            spName: 'WAEC',
            userId: masterUserData.id,
            brandId: masterBrandData.id,
            parentBrandId: masterBrandData.id,
            currency: masterUserData.defaultCurrency,
            currencySymbol: '₦',
            serviceType: 'utility',
            type: 'education',
            available: 0,
            partner: 'cbk',
            others: {
              cbkProductData: { cbkCode: product.PRODUCT_CODE },
              cbkProviderData: { cbkCode: product.PRODUCT_CODE },
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching WAEC data from ClubKonnet:', error.message);
    }

    // ===== WAEC - MobileNIG =====
    try {
      const waecUrl2 = `${await initializeMBNIG({
        route: 'services/packages',
      })}`;

      const waecResponse2 = await sendMBNIGReq({
        url: waecUrl2,
        body: {
          service_id: 'AJA',
        },
      });

      if (waecSpId && !isNull(waecResponse2.details)) {
        // Handle both array and single object responses
        const products = Array.isArray(waecResponse2.details)
          ? waecResponse2.details
          : [waecResponse2.details];

        for (const product of products) {
          productsData.push({
            slug: slugify(`waec-mbnig-${product.name}`, { lower: true, strict: true }),
            title: product.name,
            price: parseFloat(product.price),
            spId: waecSpId,
            spName: 'WAEC',
            userId: masterUserData.id,
            brandId: masterBrandData.id,
            parentBrandId: masterBrandData.id,
            currency: masterUserData.defaultCurrency,
            currencySymbol: '₦',
            serviceType: 'utility',
            type: 'education',
            available: 0,
            partner: 'mbnig',
            others: {
              mbnigDetails: product,
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching WAEC data from MobileNIG:', error.message);
    }

    // ===== JAMB - ClubKonnet =====
    try {
      const jambUrl = `${await initializeCBK({
        route: 'APIJAMBPackagesV2.asp',
      })}`;

      const jambResponse = await fetch(jambUrl);
      const jambData = await jambResponse.json();

      if (jambSpId && jambData.EXAM_TYPE) {
        for (const product of jambData.EXAM_TYPE) {
          productsData.push({
            slug: slugify(`jamb-${product.PRODUCT_CODE}`, { lower: true, strict: true }),
            title: product.PRODUCT_DESCRIPTION,
            price: parseFloat(product.PRODUCT_AMOUNT),
            spId: jambSpId,
            spName: 'JAMB',
            userId: masterUserData.id,
            brandId: masterBrandData.id,
            parentBrandId: masterBrandData.id,
            currency: masterUserData.defaultCurrency,
            currencySymbol: '₦',
            serviceType: 'utility',
            type: 'education',
            available: 0,
            partner: 'cbk',
            others: {
              cbkProductData: { cbkCode: product.PRODUCT_CODE },
              cbkProviderData: { cbkCode: product.PRODUCT_CODE },
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching JAMB data from ClubKonnet:', error.message);
    }

    // ===== JAMB - MobileNIG =====
    try {
      const jambUrl2 = `${await initializeMBNIG({
        route: 'services/packages',
      })}`;

      const jambResponse2 = await sendMBNIGReq({
        url: jambUrl2,
        body: {
          service_id: 'AJB',
        },
      });

      if (jambSpId && !isNull(jambResponse2.details)) {
        // Handle both array and single object responses
        const products = Array.isArray(jambResponse2.details)
          ? jambResponse2.details
          : [jambResponse2.details];

        for (const product of products) {
          productsData.push({
            slug: slugify(`jamb-mbnig-${product.name}`, { lower: true, strict: true }),
            title: product.name,
            price: parseFloat(product.price),
            spId: jambSpId,
            spName: 'JAMB',
            userId: masterUserData.id,
            brandId: masterBrandData.id,
            parentBrandId: masterBrandData.id,
            currency: masterUserData.defaultCurrency,
            currencySymbol: '₦',
            serviceType: 'utility',
            type: 'education',
            available: 0,
            partner: 'mbnig',
            others: {
              mbnigDetails: product,
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching JAMB data from MobileNIG:', error.message);
    }

    // ===== NECO - MobileNIG =====
    try {
      const necoUrl = `${await initializeMBNIG({
        route: 'services/packages',
      })}`;

      const necoResponse = await sendMBNIGReq({
        url: necoUrl,
        body: {
          service_id: 'AJC',
        },
      });

      if (necoSpId && !isNull(necoResponse.details)) {
        // Handle both array and single object responses
        const products = Array.isArray(necoResponse.details)
          ? necoResponse.details
          : [necoResponse.details];

        for (const product of products) {
          productsData.push({
            slug: slugify(`neco-mbnig-${product.name}`, { lower: true, strict: true }),
            title: product.name,
            price: parseFloat(product.price),
            spId: necoSpId,
            spName: 'NECO',
            userId: masterUserData.id,
            brandId: masterBrandData.id,
            parentBrandId: masterBrandData.id,
            currency: masterUserData.defaultCurrency,
            currencySymbol: '₦',
            serviceType: 'utility',
            type: 'education',
            available: 0,
            partner: 'mbnig',
            others: {
              mbnigDetails: product,
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching NECO data from MobileNIG:', error.message);
    }

    // ===== Insert all products =====
    if (productsData.length > 0) {
      await bulkUpsert(productsData, 'products');
      console.info(`${productsData.length} education products imported successfully`);
    } else {
      console.warn('No education products were found to import');
    }

    console.info('education import completed');
    return api_response({
      success: true,
      target: 'import_service_provider',
      count: productsData.length,
    });
  } catch (error: any) {
    console.error('Error importing education services:', error.message);
    return invalid_response(error.message);
  }
}
