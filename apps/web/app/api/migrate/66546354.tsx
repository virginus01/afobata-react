import { addToCurrentDate } from '@/app/helpers/addToCurrentDate';
import { isNull } from '@/app/helpers/isNull';
import { lowercase } from '@/app/helpers/lowercase';
import { _bulkUpsert } from '@/api/tenant/node/_mongodb';
import { createBackup, createReport, getTable } from '@/api/migrate/migrates/shared_helpers';

import { fetchDataWithConditions } from '@/app/api/database/mongodb';
import { get_wallet } from '@/api/wallet_and_payments';
import { generateSub } from '@/api/plan/plan';
import { FREE_PACKAGE_ID } from '@/app/src/constants';

export async function startMigrate66546354(): Promise<any> {
  const table = 'users';
  let migrationId = '66546354';
  const conditions = {
    $or: [
      { migrationId: { $exists: false } },
      { migrationId: '' },
      { migrationId: { $ne: migrationId } },
    ],
  };

  let length = 0;

  try {
    const results: UserTypes[] = await getTable(conditions, table);

    length = results.length;

    // Create backup before migration
    await createBackup({ data: results, table, id: migrationId });

    const reports: any[] = [];

    const updateData = await Promise.all(
      results.map(async (result) => {
        const data = await constructData(result, migrationId, table);
        reports.push(data.report);
        return { ...data.data, id: result.id };
      }),
    );

    if (!isNull(reports)) {
      await createReport({ data: reports, table, id: migrationId });
    }

    if (updateData.length > 0) {
      await _bulkUpsert(updateData, table, true, {});
    }

    return `Total of ${length} processed migrationId successfully at ${Date.now()}`;
  } catch (error) {
    console.error(`Migration 66546354 failed: ${error}`);
    throw error;
  }
}

export async function constructData(
  data: UserTypes,
  migrationId: string,
  table: string,
): Promise<any> {
  let report = [];
  let finalData: any = {};

  let fundSourcesFetch = await fetchDataWithConditions('fund_sources', {
    userId: data.id,
  });

  if (!isNull(fundSourcesFetch)) {
    finalData.fundSources = fundSourcesFetch;
  } else {
    console.warn({ id: data.id, report: `fund_sources not found` });
  }

  let [currencyData]: CurrencyType[] = await fetchDataWithConditions('currencies', {
    id: lowercase(data.defaultCurrency ?? ''),
  });

  // Handle case where currency is not found
  if (!isNull(currencyData)) {
    finalData.currencyInfo = {
      currencyCode: currencyData.currencyCode,
      currencyName: currencyData.currencyName,
      currencySymbol: currencyData.currencySymbol,
    };
  } else {
    // report.push({ id: data.id, report: `Currency not found - ${data.defaultCurrency}` });
    finalData.defaultCurrency = 'NGN';
    finalData.currencyInfo = {
      currencyCode: 'NGN',
      currencyName: 'Naira',
      currencySymbol: '₦',
    };
    finalData.wallet = {};
  }

  const [userBrand] = await fetchDataWithConditions('brands', { id: data.brandId });

  // Handle case where brand is not found
  if (!isNull(userBrand)) {
    try {
      const walletResult: any = await get_wallet({
        userId: data.id,
        id: data.id,
        siteInfo: userBrand,
        user: data,
        currency: data.defaultCurrency ?? '',
      });
      if (!isNull(walletResult?.data?.main)) {
        finalData.wallet = walletResult?.data?.main || {};
      } else {
        if (isNull(data.defaultCurrency)) {
          finalData.defaultCurrency = 'NGN';
          finalData.wallet = {};
        }
        //  report.push({ id: data.id, report: `error getting wallet` });
      }

      if (!isNull(walletResult?.data?.others || []))
        finalData.otherWallets = walletResult?.data?.others || [];
    } catch (error) {
      console.error(error, 'at get user wallet');
      report.push({ id: data.id, report: `error at wallet` });
    }

    // Generate subscription only if userBrand exists
    let expiresAt = addToCurrentDate({ days: 100000 });

    try {
      const subData: any = await generateSub({
        data: { brandId: userBrand.id, userId: data.id, expiresAt, packageId: FREE_PACKAGE_ID },
        siteInfo: userBrand,
      });

      if (!isNull(subData) && subData.status) {
        finalData.subscription = subData?.data;
      } else {
        console.error(subData?.msg ?? 'error generating subscription');
        report.push({ id: data.id, report: `error generating subscription, subscription is null` });
      }
      finalData.packageId = FREE_PACKAGE_ID;
    } catch (error) {
      console.error(error, 'at generate subscription');
      report.push({ id: data.id, report: `error generating subscription` });
    }
  } else {
    report.push({ id: data.id, report: `Brand not found` });
  }

  return {
    data: {
      ...finalData,
      ...(isNull(report) ? { migrationId } : {}),
    },
    report,
  };
}
