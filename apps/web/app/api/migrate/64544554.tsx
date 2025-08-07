import { lowercase } from '@/app/helpers/lowercase';
import { _bulkUpsert } from '@/api/tenant/node/_mongodb';
import { getTable } from '@/api/migrate/migrates/shared_helpers';

export async function startMigrate64544554(): Promise<number> {
  const table = 'wallets';
  const conditions = {};

  try {
    const results: UserTypes[] = await getTable(conditions, table);

    const updateData = await Promise.all(
      results.map(async (result) => {
        const data = await constructData(result, table);
        return { ...data, id: result.id };
      }),
    );

    if (updateData.length > 0) {
      await _bulkUpsert(updateData, table, true, {});
    }

    return results.length;
  } catch (error) {
    console.error(`Migration 64544554 failed: ${error}`);
    throw error;
  }
}

export async function constructData(data: WalletTypes, table: string): Promise<WalletTypes> {
  return {
    ...data,
    currency: lowercase(data?.currency ?? ''),
  };
}
