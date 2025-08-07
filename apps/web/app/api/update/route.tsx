import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { NextRequest } from 'next/server';
import { upsert } from '@/app/api/database/mongodb';
import { processCountries } from '@/api/update/countries';
import { masterAuthData, masterBrandData, masterUserData } from '@/app/data/master';
import { testerAuthData, testerBrandData, testerUserData } from '@/app/data/tester';
import runCron from '@/api/edge_lib/run_cron';
import { processCurrencies } from '@/api/update/currency';

const local = false;

export async function GET(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  try {
    const brand = masterBrandData;
    const auth = masterAuthData;
    const user = masterUserData;
    const testBrand = testerBrandData;
    const testUser = testerUserData;
    const testAuth = testerAuthData;

    const insertAuth = await upsert(auth, 'auth', true, brand);
    console.info('master auth updated: ', insertAuth.msg);
    const insertTestAuth = await upsert(testAuth, 'auth', true, brand);
    console.info('tester auth updated: ', insertTestAuth.msg);

    if (insertAuth.status) {
      const insertUser = await upsert(user, 'users', true, brand);
      console.info('master user updated: ', insertUser.msg);
      const insertTestUser = await upsert(testUser, 'users', true, brand);
      console.info('test user updated: ', insertTestUser.msg);

      if (insertUser.status) {
        const insertBrand = await upsert(brand, 'brands', true, brand);
        console.info('master brand updated: ', insertBrand.msg);
        const insertTestBrand = await upsert(testBrand, 'brands', true, brand);
        console.info('test brand updated: ', insertTestBrand.msg);
      }
    }

    await processCurrencies();

    runCron({ target: 'always' });

    if (process.env.NODE_ENV === 'development' && local) {
      await processCountries();
    }

    return api_response({ success: true, status: true });
  } catch (error) {
    console.error(error);
    return invalid_response(error as string);
  }
}
