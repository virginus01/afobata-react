import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { response } from '@/app/helpers/response';

import { NextRequest } from 'next/server';

import { isNull } from '@/app/helpers/isNull';
import { startMigrate8476564 } from '@/api/migrate/migrates/8476564';
import { httpStatusCodes } from '@/app/helpers/status_codes';
import { _fetchDataWithConditions, _upsert } from '@/api/tenant/node/_mongodb';
import { startMigrate64544554 } from '@/api/migrate/64544554';
import { startMigrate66546354 } from '@/api/migrate/66546354';
import { startMigrate6834484576 } from '@/api/migrate/6834484576';

type MigrationFunction = () => Promise<number>;

const MIGRATIONS: Record<number, MigrationFunction> = {
  6834484576: startMigrate6834484576,
};

export async function GET(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  try {
    await startMigration();
    return response({
      status: true,
      statusCode: httpStatusCodes[200],
      msg: 'Migration process started successfully.',
    });
  } catch (error) {
    console.error('Migration process failed:', error);
    return invalid_response(error as string);
  }
}

export async function startMigration() {
  const migrationIds = getMigrationIds();

  const results = await Promise.all(
    migrationIds.map(async (id) => {
      try {
        const migration = await _fetchDataWithConditions('migrations', {
          migrationId: id,
        });
        if (isNull(migration.data)) {
          const result = await runMigrate(id);
          await _upsert({ migrationId: id, id }, 'migrations', true, {});
          console.info(`migration: ${id} proccessed`);
          console.info(result);
          return { id, success: true, result };
        } else {
          console.info(`migration: ${id} already proccessed`);
          return { id, success: false, result: {} };
        }
      } catch (error) {
        console.error(`Migration ${id} failed:`, error);
        return { id, success: false, error };
      }
    }),
  );

  return api_response({
    success: true,
    msg: `${migrationIds.length} migrations processed`,
    details: results,
  });
}

async function runMigrate(id: number): Promise<number> {
  const migrationFn = MIGRATIONS[id];

  if (!migrationFn) {
    console.warn(`No migration found for ID: ${id}`);
    return 0;
  }

  return migrationFn();
}

function getMigrationIds(): number[] {
  return [6834484576];
}
