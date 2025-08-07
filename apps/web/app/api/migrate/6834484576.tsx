import { isNull } from '@/app/helpers/isNull';
import { _bulkUpsert } from '@/api/tenant/node/_mongodb';
import { createBackup, createReport, getTable } from '@/api/migrate/migrates/shared_helpers';

import { uppercase } from '@/app/helpers/uppercase';

export async function startMigrate6834484576(): Promise<any> {
  const table = 'users';
  let migrationId = '6834484576';
  const conditions = {};

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
        return { ...data.data };
      }),
    );

    if (!isNull(reports)) {
      await createReport({ data: reports, table, id: migrationId });
    }

    if (updateData.length > 0) {
      await _bulkUpsert(updateData, 'auth', true, {});
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
  let finalData: any = {};

  return {
    data: {
      country: uppercase(data?.country ?? '') ?? 'NG',
      defaultCurrency: data?.defaultCurrency,
      id: data.uid,
    },
  };
}
