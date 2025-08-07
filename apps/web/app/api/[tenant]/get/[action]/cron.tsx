'use server';
import { cbk_import_data_plans } from '@/app/api/thirdparty/clubkonnect/import_data_plans';
import { cbk_import_tv_plans } from '@/app/api/thirdparty/clubkonnect/import_tv_plans';
import { cbk_import_electric } from '@/app/api/thirdparty/clubkonnect/cbk_import_electric';
import {
  query_payment,
  settle_payouts,
  settle_trades,
  update_exchange_rates,
} from '@/app/api/wallet_and_payments';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { response } from '@/app/helpers/response';
import { import_education_services } from '@/app/api/thirdparty/clubkonnect/import_education';
import { import_betting_plans } from '@/app/helpers/import_betting_package';
import { fulfill_orders, query_orders, settle_orders } from '@/app/api/order';
import { changeProductPrice } from '@/app/api/price_and_rate_update';
import { update_rev_rates } from '@/app/api/revenue/revenue';
import { startMigration } from '@/app/api/migrate/route';
import { after } from 'next/server';
import { setCookie } from '@/app/actions';
import { convertDateTime } from '@/app/helpers/convertDateTime';

export async function server_run_cron_job(target = 'always', context?: any) {
  after(() => {
    cron_job(target, context);
    console.info('running cron');
  });
  await setCookie(convertDateTime(), `_run_${target}`);
  return response({ status: true, msg: `cron started on ${target}` });
}

export async function cron_job(target = '', context?: any) {
  try {
    switch (target) {
      case 'import_data_plans':
        return await cbk_import_data_plans();
      case 'import_tv_plans':
        return cbk_import_tv_plans();
      case 'import_electric':
        return cbk_import_electric();
      case 'utility':
        return all_utility();
      case 'education':
        return import_education_services();
      case 'import_betting_plans':
        return import_betting_plans();
      case 'query_payments':
        return query_payment({ context });
      case 'fulfill_orders':
        return fulfill_orders();
      case 'settle_orders':
        return settle_orders();
      case 'settle_payouts':
        return settle_payouts();
      case 'query_orders':
        return query_orders({ context: context });
      case 'update_exchange_rates':
        return update_exchange_rates();
      case 'queries':
        return queries({ context });
      case 'update_rev_rates':
        return update_rev_rates();

      case 'query_crypto_wallet_addresses':
      //return query_crypto_wallet_addresses(context);

      case 'always':
        return always(context);
      case 'all':
        return all(context);

      default:
        return all(context);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error occured');
  }
}

export async function always(context: any) {
  try {
    await fulfill_orders();
    await queries(context);
    await settle_orders();
    await settle_payouts();
    await settle_trades();
    // await settle_transactions();
    return api_response({ status: true, success: true });
  } catch (error) {
    return invalid_response(error as string);
  }
}
export async function all_utility() {
  try {
    await cbk_import_data_plans();
    await cbk_import_tv_plans();
    await cbk_import_electric();
    await import_education_services();
    await import_betting_plans();
    await changeProductPrice();
    return api_response({ status: true, success: true });
  } catch (error) {
    return invalid_response(error as string);
  }
}

export async function queries(context: any) {
  try {
    await query_payment({ context });
    await query_orders({});
    return api_response({ status: true, success: true });
  } catch (error) {
    return invalid_response(error as string);
  }
}

export async function all(context: any) {
  try {
    await always(context);
    await update_rev_rates();
    //  await query_crypto_wallet_addresses(context);
    await update_exchange_rates();
    await all_utility();
    // await settle_transactions();
    await startMigration();
    return api_response({ status: true, success: true });
  } catch (error) {
    return invalid_response(error as string);
  }
}
