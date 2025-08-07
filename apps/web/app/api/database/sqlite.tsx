// utils/sqlite.js

import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Function to connect to SQLite database
async function dbConnect() {
  try {
    const db = await open({
      filename: "./database.db",
      driver: sqlite3.Database,
    });
    return db;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

// Function to create a table if it does not exist, or alter it if necessary
export async function createTable(tableName: any, columns: any) {
  try {
    const db = await dbConnect();
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );

    if (!tableExists) {
      const columnsDefinition = Object.entries(columns)
        .map(([name, type]) => `${name} ${"TEXT"}`)
        .join(", ");

      await db.exec(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ${columnsDefinition}
        );
      `);
    } else {
      const existingColumns = await db.all(`PRAGMA table_info(${tableName});`);
      const existingColumnNames = existingColumns.map((col) => col.name);

      for (const [name, type] of Object.entries(columns)) {
        if (!existingColumnNames.includes(name)) {
          await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${name} ${type};`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`Failed to check or create the table "${tableName}":`, error);
    throw error;
  }
}

// Function to setup the database and insert initial data
export async function insertUpdate(data: any, update = false) {
  try {
    const db = await dbConnect();

    // Create or update table structure
    await createTable(data.table, data.columns);

    if (update && data.id) {
      const id = data.id;

      // Prepare for update
      const setClause = Object.keys(data.columns)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(data.columns);

      const updateDataQuery = `
      UPDATE ${data.table}
      SET ${setClause}
      WHERE id = ?;  -- Assumes you want to update a specific row identified by id
    `;

      // Run the update query (assuming you're updating a specific row, you might need an id value here)
      const rowId = id; // Change this to the appropriate id value
      await db.run(updateDataQuery, [...values, rowId]);
    } else {
      // Insert data into the table
      const columns = Object.keys(data.columns).join(", ");
      const placeholders = Object.keys(data.columns)
        .map(() => "?")
        .join(", ");
      const values = Object.values(data.columns);

      const insertDataQuery = `
      INSERT INTO ${data.table} (${columns})
      VALUES (${placeholders});
    `;
      await db.run(insertDataQuery, values);
    }
    return db;
  } catch (error) {
    console.error("Failed to set up the database:", error);
    throw error;
  }
}

export async function fetchData(table?: any, id?: any) {
  const db = await dbConnect();
  if (id) {
    return db.get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  } else {
    return db.all(`SELECT * FROM ${table}`);
  }
}

export async function fetchDataWithColumn(table?: any, column?: any, id?: any) {
  const db = await dbConnect();
  return db.get(`SELECT * FROM ${table} WHERE ${column} = ?`, [id]);
}
