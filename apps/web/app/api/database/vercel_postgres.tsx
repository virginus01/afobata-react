import { createClient, Client, sql } from "@vercel/postgres";

async function dbConnect(): Promise<Client> {
  const client = createClient();
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

export async function createTableColumn(tableName: string, columns: any) {
  try {
    //await sql.query(`DROP TABLE IF EXISTS info`);

    const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `;

    if (!tableExists.rows[0].exists) {
      const result = await sql.query(
        `CREATE TABLE "${tableName}" ( id SERIAL PRIMARY KEY );`
      );
    }

    // Convert object to array of objects
    if (columns) {
      const columnArray = Object.entries(columns).map(([key, value]) => ({
        [key]: value,
      }));

      for (const obj of columnArray) {
        const key = Object.keys(obj)[0];

        // Check if column exists
        const columnExistsResult: any = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        AND column_name = ${key}
      );
    `;

        const columnExists = columnExistsResult.rows[0].exists;
        // If the column does not exist, add it
        if (!columnExists) {
          await sql.query(`
          ALTER TABLE "${tableName}"
          ADD COLUMN "${key}" VARCHAR(255)
        `);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`Failed to check or create the table "${tableName}":`, error);
  }
}

export async function insertUpdate(
  data: { table: string; id?: number; columns: Record<string, any> },
  update = false
): Promise<Client> {
  const client = await dbConnect();
  try {
    await createTableColumn(data.table, data.columns);

    if (update && data.id) {
      const id = data.id;

      const setClause = Object.keys(data.columns)
        .map((key, index) => `"${key}" = $${index + 1}`)
        .join(", ");
      const values = Object.values(data.columns);

      const updateDataQuery = `
        UPDATE "${data.table}"
        SET ${setClause}
        WHERE id = $${Object.keys(data.columns).length + 1};
      `;

      await client.query(updateDataQuery, [...values, id]);
    } else {
      const columns = Object.keys(data.columns)
        .map((col) => `"${col}"`)
        .join(", ");
      const placeholders = Object.keys(data.columns)
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const values = Object.values(data.columns);

      const insertDataQuery = `
        INSERT INTO "${data.table}" (${columns})
        VALUES (${placeholders});
      `;
      await client.query(insertDataQuery, values);
    }
    return client;
  } catch (error) {
    console.error("Failed to set up the database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

export async function fetchData(table: string, id?: any): Promise<any> {
  const client = await dbConnect();
  try {
    const q = {
      table: table,
      column: null,
    };
    await createTableColumn(table, q);
    if (id) {
      const result = await client.query(
        `SELECT * FROM "${table}" WHERE id = $1`,
        [id]
      );

      return result.rows[0];
    } else {
      const result = await client.query(`SELECT * FROM "${table}"`);
      return result.rows;
    }
  } catch (error) {
    console.error(`Failed to fetch data from table "${table}":`, error);
  } finally {
    await client.end();
  }
}

export async function fetchDataWithColumn(
  table: string,
  column: string,
  value: any
): Promise<any> {
  const client = await dbConnect();

  try {
    const q = {
      table: table,
      column: null,
    };
    await createTableColumn(table, q);
    const result = await client.query(
      `SELECT * FROM "${table}" WHERE "${column}" = $1`,
      [value]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      `Failed to fetch data from table "${table}" with column "${column}":`,
      error
    );
  } finally {
    await client.end();
  }
}
