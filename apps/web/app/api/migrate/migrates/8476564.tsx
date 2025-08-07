import { getTable } from "./shared_helpers";
import { bulkUpsert, removeKey } from "../../database/connection";

export async function startMigrate8476564(): Promise<number> {
  const table = "users";
  const conditions = {};

  try {
    const results: UserTypes[] = await getTable(conditions, table);

    const updateData = await Promise.all(
      results.map(async (result) => {
        const data = await constructData(result, table);
        return { ...data, id: result.id };
      })
    );

    if (updateData.length > 0) {
      await bulkUpsert(updateData, table, true, {});
    }

    return results.length;
  } catch (error) {
    console.error(`Migration 8476564 failed: ${error}`);
    throw error;
  }
}

export async function constructData(data: CurrencyType, table: string): Promise<UserTypes> {
  return {
    ...data,
    userId: data.id,
  };
}
