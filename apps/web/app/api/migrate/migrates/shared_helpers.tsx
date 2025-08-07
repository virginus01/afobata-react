import { _fetchDataWithConditions } from '@/api/tenant/node/_mongodb';
import fs from 'fs';
import path from 'path';

export async function getTable(conditions: any, table: string) {
  const { data } = await _fetchDataWithConditions(table, conditions);
  return data;
}

export async function createBackup({
  data,
  table,
  id,
}: {
  data: any[];
  table: string;
  id: string;
}): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', 'migrations');
    const backupFile = path.join(backupDir, `${table}_backup_${id}_${timestamp}.json`);

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Write backup file
    await fs.promises.writeFile(backupFile, JSON.stringify(data, null, 2));

    console.info(`Backup contains ${data.length} records`);
  } catch (error) {
    console.error(`Failed to create backup: ${error}`);
    throw new Error(`Backup creation failed: ${error}`);
  }
}

export async function createReport({
  data,
  table,
  id,
}: {
  data: any[];
  table: string;
  id: string;
}): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'reports', 'migrations');
    const backupFile = path.join(backupDir, `${table}_report_${id}_${timestamp}.json`);

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Write backup file
    await fs.promises.writeFile(backupFile, JSON.stringify(data, null, 2));

    console.info(`Report contains ${data.length} records`);
  } catch (error) {
    console.error(`Failed to create report: ${error}`);
    throw new Error(`Report creation failed: ${error}`);
  }
}
