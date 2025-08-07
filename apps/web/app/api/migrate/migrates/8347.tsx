import { getTable } from "./shared_helpers";
import { bulkUpsert, removeKey } from "../../database/connection";

// Define explicit type for currency data
interface CurrencyType {
  id: number;
  availableForPayout?: boolean;
  availableForPurchase?: boolean;
  [key: string]: any;
}

export async function startMigrate8347(): Promise<number> {
  const table = "currencies";
  const conditions = {};

  try {
    const results: CurrencyType[] = await getTable(conditions, table);

    const updateData = await Promise.all(
      results.map(async (result) => {
        const data = await constructData(result, table);
        return { ...data, id: result.id };
      })
    );

    if (updateData.length > 0) {
      await bulkUpsert(updateData, table, true, {});
    }

    await removeKey({ table, key: "availaibleForPayout" });
    await removeKey({ table, key: "availaibleForPurchase" });

    return results.length;
  } catch (error) {
    console.error(`Migration 8347 failed: ${error}`);
    throw error;
  }
}

export async function constructData(
  data: CurrencyType,
  table: string
): Promise<CurrencyType> {
  return {
    ...data,
    availableForPayout: data.availaibleForPayout,
    availableForPurchase: data.availaibleForPurchase,
  };
}
