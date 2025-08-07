import { api_response } from '@/app/helpers/api_response';
import { convertCur } from '@/app/helpers/convertCur';

import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import { nearestMille, nearestThousandBelow } from '@/app/helpers/nearestMille';

import { random_code } from '@/app/helpers/random_code';

import { fetchDataWithConditions, modifyFieldValue, updateData } from '@/database/mongodb';
import { get_wallet, process_payment } from '@/api/wallet_and_payments';

import { getBrandInfo } from '@/app/api/brand/brand';
import { get_user } from '@/api/user';
import { getExchangeRates } from '@/api/currency/currency';

export async function update_rev_rates() {
  let bConditions: any = {
    inhouseMonetization: { $exists: true, $eq: 'active' },
  };

  let brands: BrandType[] = await fetchDataWithConditions('brands', bConditions);

  for (let parentBrand of brands) {
    bConditions = {
      brandId: parentBrand.id,
    };

    brands = await fetchDataWithConditions('brands', bConditions);
    let total_cashViews = 0;

    for (let brand of brands) {
      const cashViews = await totalCashViews(brand?.id || '');
      total_cashViews += cashViews;
    }

    const walletD: WalletTypes = {
      userId: parentBrand.userId,
      brandId: parentBrand.brandId,
      identifier: 'revenue',
      currency: parentBrand.ownerData?.defaultCurrency!,
    };

    const { data } = await get_wallet(walletD as any);

    const walletBalance = data?.main.value || 0;

    // Prevent division by zero by checking if total_cashViews is greater than 0
    let costPerMille = 0;
    if (total_cashViews > 0) {
      costPerMille = parseFloat((walletBalance / total_cashViews).toString());
    }

    // Update the brand with the calculated blogRevenueRate, ensure it's a valid number
    const upsertRes = await updateData({
      data: { blogRevenueRate: parseFloat(costPerMille.toString()) || 0 },
      table: 'brands',
      id: parentBrand.id!,
    });
  }

  return api_response({ status: true, data: {} });
}

async function totalCashViews(brandId: string, userId?: string) {
  const conditions: any = {
    brandId,
    cashViews: { $exists: true, $gt: 1 },
  };

  if (userId) {
    conditions.userId = userId;
  }

  const posts = await fetchDataWithConditions('posts', conditions);

  const products = await fetchDataWithConditions('products', conditions);

  // Sum up the cashViews from the fetched posts
  const posts_cashViews = posts.reduce(
    (total: any, post: PostTypes) => total + (post.cashViews || 0),
    0,
  );

  const products_cashViews = products.reduce(
    (total: any, post: PostTypes) => total + (post.cashViews || 0),
    0,
  );

  const total_cashViews = posts_cashViews + products_cashViews;

  return total_cashViews;
}

/**
 * Processes revenue withdrawal for users based on their cash views
 * @param data Withdrawal request data containing userId and userBrandId
 * @param context Application context
 */
export async function server_withdraw_revenue(
  data: { userId: string; userBrandId: string },
  context: any,
) {
  // Input validation
  if (!data.userId || !data.userBrandId) {
    return api_response({
      status: false,
      msg: 'Invalid request: User ID and Brand ID are required',
    });
  }

  try {
    // Fetch required data
    const siteInfo = await getBrandInfo(context);

    const [rates] = await Promise.all([getExchangeRates()]);

    const { data: user } = await get_user({ id: data.userId, siteInfo });

    // Validate fetched data
    if (isNull(siteInfo) || isNull(user) || isNull(rates)) {
      return api_response({
        status: false,
        msg: 'Failed to fetch required data. Please try again later',
      });
    }

    // Validate revenue and views
    const costPerMille = siteInfo.costPerMille ?? 0;
    const userMille = nearestMille(user?.mille ?? 0);
    const userUnits = nearestThousandBelow(user?.mille ?? 0);

    if (costPerMille <= 0 || (siteInfo.childrenMille || 0) <= 0) {
      return api_response({
        status: false,
        msg: 'Insufficient revenue available',
      });
    }

    // Validate minimum withdrawal requirement

    if (userMille <= 0) {
      return api_response({
        status: false,
        msg: `Minimum 1 mille required for conversion`,
      });
    }

    // Calculate withdrawal amount
    const amount = Number(costPerMille * userMille);

    // Calculate earnings in user's currency
    let finalEarnings = 0;

    const missingCur = findMissingFields({
      amount,
      rates,
      fromCurrency: siteInfo.ownerData?.defaultCurrency ?? '',
      toCurrency: user?.defaultCurrency ?? '',
    });

    if (!missingCur) {
      finalEarnings = await convertCur({
        amount,
        rates,
        fromCurrency: siteInfo.ownerData?.defaultCurrency ?? '',
        toCurrency: user?.defaultCurrency ?? '',
      });
    }

    const missing = findMissingFields({
      brandWallet: siteInfo.ownerData?.wallet?.id,
      userWallet: user?.wallet?.id,
    });

    if (missing) {
      console.error('missing', missing);
      return api_response({ status: false, msg: `missing some data` });
    }

    try {
      await Promise.all([
        modifyFieldValue({
          collectionName: 'brands',
          filter: { id: siteInfo.id },
          fieldName: 'childrenMille',
          value: userUnits,
          operation: 'decrement',
        }),
        modifyFieldValue({
          collectionName: 'users',
          filter: { id: user?.id },
          fieldName: 'mille',
          value: userUnits,
          operation: 'decrement',
        }),
        modifyFieldValue({
          collectionName: 'wallets',
          filter: { id: siteInfo.ownerData?.wallet?.id },
          fieldName: 'shareValue',
          value: amount ?? 0,
          operation: 'decrement',
        }),
      ]);
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return api_response({
        status: false,
        msg: 'Failed to process withdrawal. Please try again',
      });
    }

    const credit = await process_payment({
      userId: user?.id!,
      walletId: user?.wallet?.id!,
      currency: user?.defaultCurrency,
      type: 'credit',
      amount: finalEarnings,
      referenceId: random_code(10),
      status: 'pending',
      gateway: 'wallet',
      trnxType: 'share',
      returnOnFail: true,
    });

    return api_response({
      status: credit.credited,
      msg: credit.credited
        ? 'Views successfully converted to revenue'
        : credit.msg || 'Payment processing failed',
    });
  } catch (error) {
    console.error('Revenue withdrawal error:', error);
    return api_response({
      status: false,
      msg: 'An unexpected error occurred. Please try again later',
    });
  }
}
