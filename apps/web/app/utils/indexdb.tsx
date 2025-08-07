import Dexie from 'dexie';
import { randomNumber } from '@/app/helpers/randomNumber';
import { isNull } from '@/app/helpers/isNull';

class DynamicDataDB extends Dexie {
  constructor() {
    super('solace_project');
    this.version(1).stores({
      dynamicTables: '++id, name, timestamp, data',
    });
  }

  async saveOrUpdateData({
    table,
    data,
    tag = '',
    force = false,
  }: {
    table: string;
    data: any[] | any;
    tag?: string;
    force?: boolean;
  }) {
    try {
      const tableName = `${table}${tag ? `_${tag}` : ''}`;

      if (!this.isSupportedType(data)) {
        console.error(`data not supported on ${tableName}`);
        return [];
      }

      const normalizedData = Array.isArray(data)
        ? data
        : typeof data === 'object' && data !== null && !Array.isArray(data)
          ? [data]
          : [];

      if (isNull(normalizedData)) {
        return [];
      }

      // If force is true, clear the table first
      if (force) {
        await this.clearTable(table, tag);
      }

      const existingEntry = await this.table('dynamicTables')
        .where('name')
        .equals(tableName)
        .first();

      let updatedData: any[];
      let result: any;

      if (existingEntry) {
        // Create a map of existing data for faster lookups
        const existingDataMap = new Map<string, any>(
          (existingEntry.data || []).map((item: { id: string }) => [item.id, item]),
        );

        // Process each new item
        normalizedData.forEach((newItem) => {
          if (newItem.id) {
            // If this ID exists in our map, it will be replaced with the new data
            existingDataMap.set(newItem.id, newItem);
          } else {
            // For items without ID, add them as new entries
            newItem.id = randomNumber().toString();
            existingDataMap.set(newItem.id, newItem);
          }
        });

        // Convert map back to array
        updatedData = Array.from(existingDataMap.values());

        // Use update for existing records
        result = await this.table('dynamicTables').update(existingEntry.id, {
          data: updatedData,
          timestamp: Date.now(),
        });
      } else {
        updatedData = normalizedData.map((item) => {
          if (!item.id) {
            item.id = randomNumber().toString();
          }
          return item;
        });

        // Use put for new records
        result = await this.table('dynamicTables').put({
          name: tableName,
          data: updatedData,
          timestamp: Date.now(),
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.info(`${updatedData.length} items at ${tableName} Cached ✅`);
      }

      return updatedData;
    } catch (error) {
      console.error('IndexedDB save error on table:', data, error);
    }
  }

  private async isSupportedType(value: any) {
    if (value === null) return false;

    const type = typeof value;

    if (type === 'string' || type === 'number' || type === 'boolean') return true;
    if (Array.isArray(value)) return true;
    if (value instanceof Date) return true;
    if (value instanceof Blob) return true;
    if (value instanceof File) return true;
    if (value instanceof ArrayBuffer) return true;

    // Check for plain object (not class instance or special object)
    if (type === 'object' && Object.getPrototypeOf(value) === Object.prototype) return true;

    return false;
  }

  private sanitizeDataForIndexedDB(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle React elements and components
    if (data.$$typeof || data._owner || data.type) {
      return null; // Remove React elements entirely
    }

    // Handle functions
    if (typeof data === 'function') {
      return null;
    }

    // Handle symbols
    if (typeof data === 'symbol') {
      return data.toString();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(this.sanitizeDataForIndexedDB).filter((item) => item !== null);
    }

    // Handle objects
    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip React-specific properties
        if (key.startsWith('$$') || key === '_owner' || key === '_store' || key === 'type') {
          continue;
        }

        const sanitizedValue = this.sanitizeDataForIndexedDB(value);
        if (sanitizedValue !== null) {
          sanitized[key] = sanitizedValue;
        }
      }
      return sanitized;
    }

    return data;
  }

  async saveOrUpdateDataWithId({
    table,
    data,
    tag = '',
    id,
  }: {
    table: string;
    data: any[] | any;
    tag?: string;
    id?: string;
  }) {
    try {
      if (isNull(data)) {
        return [];
      }

      const normalizedData = Array.isArray(data) ? data : [data];
      const tableName = `${table}${tag ? `_${tag}` : ''}`;

      const existingEntry = await this.table('dynamicTables')
        .where('name')
        .equals(tableName)
        .first();

      let updatedData: any[];

      if (existingEntry) {
        if (id) {
          // If specific ID is provided, update just that record
          const existingData = existingEntry.data || [];
          const existingIndex = existingData.findIndex((item: any) => item.id === id);

          if (existingIndex >= 0) {
            // Found the record with matching ID, update it
            const recordToUpdate =
              normalizedData.find((item) => item.id === id) || normalizedData[0];

            // Create a new array with the updated record
            updatedData = [...existingData];
            updatedData[existingIndex] = {
              ...updatedData[existingIndex],
              ...recordToUpdate,
              id, // Ensure ID is preserved
            };
          } else {
            // ID not found, add the new record to existing data
            const recordToAdd = normalizedData.find((item) => item.id === id) || {
              ...normalizedData[0],
              id,
            };
            updatedData = [...existingData, recordToAdd];
          }
        } else {
          // No specific ID provided, use the original merging logic
          updatedData = this.mergeDataWithUniqueId(existingEntry.data || [], normalizedData);

          // Filter as in the original function
          updatedData = updatedData.filter((existingItem) =>
            normalizedData.some((newItem) => newItem.id === existingItem.id),
          );
        }
      } else {
        // No existing entry found, use normalized data
        if (id && normalizedData.length > 0) {
          // If ID is provided but not found in data, add it
          const hasMatchingId = normalizedData.some((item) => item.id === id);

          if (!hasMatchingId && normalizedData.length === 1) {
            // Add ID to the single item
            normalizedData[0].id = id;
          }
        }

        updatedData = normalizedData;
      }

      await this.table('dynamicTables').put({
        name: tableName,
        data: updatedData,
        timestamp: Date.now(),
      });

      console.info(` ${id} in ${tableName}`, 'Cached ✅');
      return updatedData;
    } catch (error) {
      console.error('IndexedDB save error:', error);
      throw error;
    }
  }

  private mergeDataWithUniqueId(existingData: any[], newData: any[]): any[] {
    const dataMap = new Map(existingData.map((item) => [item.id, item]));

    newData.forEach((newItem) => {
      if (newItem.id) {
        dataMap.set(newItem.id, newItem);
      }
    });

    return Array.from(dataMap.values());
  }

  async queryData({
    table,
    conditions,
    sort,
    tag = '',
    limit = 10000,
  }: {
    table: string;
    conditions: Record<string, any>;
    sort?: SortOptions;
    tag?: string;
    limit?: number;
  }) {
    try {
      const tableEntry = await this.table('dynamicTables')
        .where('name')
        .equals(`${table}${tag ? `_${tag}` : ''}`)
        .first();

      if (!tableEntry) return [];

      let data1 = this.filterData(tableEntry.data, conditions, 'base');
      let data2 = this.filterData(data1, conditions, 'or');

      // Apply sorting if specified
      const sortedData = sort ? this.sortData(data2, sort) : data2;

      // Apply limit if specified
      return limit !== undefined ? sortedData.slice(0, limit) : sortedData;
    } catch (error) {
      console.error('IndexedDB query error:', error);
      return [];
    }
  }

  async getAllTables(): Promise<string[]> {
    try {
      const allEntries = await this.table('dynamicTables').toArray();
      return allEntries.map((entry) => entry.name);
    } catch (error) {
      console.error('IndexedDB get tables error:', error);
      return [];
    }
  }

  async clearAllTables(): Promise<void> {
    try {
      // Clear all tables
      const allTables = await this.table('dynamicTables').toArray();
      const tableNames = allTables.map((t) => t.name);

      // Delete each table one by one
      for (const tableName of tableNames) {
        await this.table('dynamicTables').where('name').equals(tableName).delete();
        console.info(`✅ Cleared cache for ${tableName}`);
      }
      console.info('✅ Cleared cache for all tables');
    } catch (error) {
      console.error(`IndexedDB cleared "all tables" error:`, error);
      throw error;
    }
  }

  async clearTable(table: string, tag?: string): Promise<void> {
    const finalTableName = `${table}${tag ? `_${tag}` : ''}`;
    try {
      const exists = await this.table('dynamicTables').where('name').equals(finalTableName).count();

      if (exists > 0) {
        await this.table('dynamicTables').where('name').equals(finalTableName).delete();
        console.info(`✅ Cleared cache for ${finalTableName}`);
      } else {
        console.info(`ℹ️ No cache found for ${finalTableName}, skipping clear`);
      }
    } catch (error) {
      console.error(`❌ IndexedDB clear table ${finalTableName} error:`, error);
      throw error;
    }
  }

  async deleteItem({
    table,
    itemId,
    tag,
  }: {
    table: string;
    itemId: string;
    tag?: string;
  }): Promise<void> {
    try {
      const existingEntry = await this.table('dynamicTables')
        .where('name')
        .equals(`${table}${tag ? `_${tag}` : ''}`)
        .first();

      if (existingEntry) {
        const updatedData = existingEntry.data.filter((item: any) => item.id !== itemId);

        await this.table('dynamicTables').put({
          name: table,
          data: updatedData,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('IndexedDB delete item error:', error);
      throw error;
    }
  }

  private filterData(data: any[], conditions: Record<string, any>, type: 'base' | 'or'): any[] {
    return data.filter((doc: any) => this.matchesConditions(doc, conditions, type));
  }

  private sortData(data: any[], sort: SortOptions): any[] {
    if (!sort) return data;

    // Handle string input (single field ascending sort)
    if (typeof sort === 'string') {
      return [...data].sort((a, b) => {
        const valueA = this.getNormalizedValue(a[sort]);
        const valueB = this.getNormalizedValue(b[sort]);
        return valueA > valueB ? 1 : -1;
      });
    }

    // Convert sort object to array format if needed
    const sortArray = Array.isArray(sort) ? sort : Object.entries(sort);

    return [...data].sort((a, b) => {
      for (const [field, direction] of sortArray) {
        const multiplier = direction === -1 || direction === 'desc' ? -1 : 1;

        const valueA = this.getNormalizedValue(a[field]);
        const valueB = this.getNormalizedValue(b[field]);

        if (valueA === valueB) continue;

        return (valueA > valueB ? 1 : -1) * multiplier;
      }
      return 0;
    });
  }

  private getNormalizedValue(value: any): number {
    // If it's already a number, return it
    if (typeof value === 'number') return value;

    // If it's a string with commas (like "1,737,733,462"), remove commas and convert
    if (typeof value === 'string' && value.includes(',')) {
      return Number(value.replace(/,/g, ''));
    }

    // Try to convert to number
    const numValue = Number(value);
    if (!isNaN(numValue)) return numValue;

    // If conversion fails, return the original value
    return value;
  }

  private matchesConditions(
    doc: any,
    conditions: Record<string, any>,
    type: 'base' | 'or',
  ): boolean {
    const { $or, ...otherConditions } = conditions;

    switch (type) {
      case 'base':
        if (isNull(otherConditions)) {
          return true;
        }
        return this.matchAllBaseConditions(doc, otherConditions);

      case 'or':
        if (isNull($or) || !Array.isArray($or)) {
          return true;
        }
        return $or.some((orCondition: any) => {
          return this.matchAllBaseConditions(doc, orCondition);
        });

      default:
        return false;
    }
  }

  private matchAllBaseConditions(doc: any, conditions: Record<string, any>): boolean {
    if (isNull(conditions)) {
      return true;
    }

    const conditionResults = Object.entries(conditions).map(([key, value]) => {
      // Handle complex comparison objects
      if (typeof value === 'object' && value !== null) {
        const operatorResults = Object.entries(value).map(([operator, comparisonValue]) => {
          let result = false;

          switch (operator) {
            case '$eq':
              result = doc[key] === comparisonValue;
              break;
            case '$ne':
              result = doc[key] !== comparisonValue;
              break;
            case '$gt':
              result = this.compareValues(doc[key], comparisonValue, '>');
              break;
            case '$gte':
              result = this.compareValues(doc[key], comparisonValue, '>=');
              break;
            case '$lt':
              result = this.compareValues(doc[key], comparisonValue, '<');
              break;
            case '$lte':
              result = this.compareValues(doc[key], comparisonValue, '<=');
              break;
            case '$in':
              result = Array.isArray(comparisonValue) && comparisonValue.includes(doc[key]);
              break;
            case '$nin':
              result = Array.isArray(comparisonValue) && !comparisonValue.includes(doc[key]);
              break;
            case '$regex':
              if (typeof comparisonValue !== 'string') {
                result = false;
                break;
              }

              const pattern = comparisonValue;
              const options = value.$options || '';

              try {
                const regex = new RegExp(pattern, options);
                result = regex.test(String(doc[key]));
              } catch (err) {
                console.error(`  Invalid regex: /${pattern}/${options}`, err);
                result = false;
              }
              break;
            default:
              result = true;
          }

          return result;
        });

        // Change to some() to allow multiple conditions
        return operatorResults.some((r) => r);
      } else {
        const simpleResult = doc[key] === value;
        return simpleResult;
      }
    });

    const finalResult = conditionResults.every((r) => r);

    return finalResult;
  }

  private compareValues(a: any, b: any, operator: string): boolean {
    // Handle null/undefined
    if (a == null || b == null) {
      if (operator === '>' || operator === '>=') return false;
      if (operator === '<' || operator === '<=') return false;
      return a === b;
    }

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      const dateA = a.getTime();
      const dateB = b.getTime();
      switch (operator) {
        case '>':
          return dateA > dateB;
        case '>=':
          return dateA >= dateB;
        case '<':
          return dateA < dateB;
        case '<=':
          return dateA <= dateB;
        default:
          return false;
      }
    }

    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      switch (operator) {
        case '>':
          return a > b;
        case '>=':
          return a >= b;
        case '<':
          return a < b;
        case '<=':
          return a <= b;
        default:
          return false;
      }
    }

    // Handle strings
    if (typeof a === 'string' && typeof b === 'string') {
      switch (operator) {
        case '>':
          return a.localeCompare(b) > 0;
        case '>=':
          return a.localeCompare(b) >= 0;
        case '<':
          return a.localeCompare(b) < 0;
        case '<=':
          return a.localeCompare(b) <= 0;
        default:
          return false;
      }
    }

    // Default comparison for other types
    switch (operator) {
      case '>':
        return a > b;
      case '>=':
        return a >= b;
      case '<':
        return a < b;
      case '<=':
        return a <= b;
      default:
        return false;
    }
  }
}

const indexedDB = new DynamicDataDB();
export default indexedDB;
