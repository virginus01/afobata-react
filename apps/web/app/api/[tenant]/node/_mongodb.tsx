import { ObjectId } from 'mongodb';
import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { isNull } from '@/app/helpers/isNull';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { mode } from '@/app/src/constants';
import { getBrandInfo } from '@/app/api/brand/brand';
import { connectDB } from '@/api/database/mongodb_connect';
import { show_error } from '@/app/helpers/show_error';

const mongoRes: any = { status: false, data: [], msg: 'not successful.' };

export async function _updateData({
  data,
  table,
  id,
  siteInfo,
}: {
  data: Record<string, any>;
  table: string;
  id: string;
  siteInfo?: BrandType;
}) {
  try {
    if (isNull(id) || isNull(table) || isNull(data)) {
      console.error('no id, table or data found');
      return mongo_response({ ...mongoRes, msg: 'no id, table or data found', status: false });
    }

    const db = await connectDB();
    const collection = db.collection(table);
    let brand = siteInfo;

    if (isNull(siteInfo)) {
      brand = await getBrandInfo();
    }

    const currentDateTime = convertDateTime().toLocaleString();

    delete data.id;
    delete data.slug;
    delete data.updatedAt;
    data.updatedAt = data.updatedAt || currentDateTime;
    data.lastUpdatedFrom = brand?.id;

    // Updated query condition to match by either `id` or `slug`
    const result = await collection.updateOne(
      { $or: [{ id: id }] }, // Match either by id or slug
      { $set: data },
      { upsert: false },
    );

    if (result.acknowledged) {
      mongoRes.status = true;
      mongoRes.id = id;
      return mongo_response(mongoRes);
    } else {
      return mongo_response({
        ...mongoRes,
        msg: 'not updated',
        data: [],
        meta: { totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 0 },
      });
    }
  } catch (error) {
    console.error('Failed to insert or update the database:', error);
    return mongo_response({ status: false, msg: 'error occurred', data: [] });
  }
}

export async function _removeKey({ key, table }: { key: string; table: string }) {
  try {
    const db = await connectDB();
    const collection = db.collection(table);

    // Construct the $unset operation dynamically
    const unsetOperation = { [key]: '' };

    const result = await collection.updateMany({}, { $unset: unsetOperation });
    //ok
    return mongo_response({ data: result, status: false });
  } catch (error) {
    console.error('Failed to remove key from the database:', error);
    return mongo_response({ status: false, msg: 'error occurred', data: [] });
  }
}

export async function _updateWithSlug({
  data,
  table,
  id,
  siteInfo,
}: {
  data: Record<string, any>;
  table: string;
  id: string;
  siteInfo?: BrandType;
}) {
  try {
    let mongoRes: any = { status: false };

    if (isNull(id) || isNull(table) || isNull(data)) {
      console.error('no id, table or data found');
      return mongo_response({ ...mongoRes, msg: 'no id, table or data found' });
    }

    const db = await connectDB();
    const collection = db.collection(table);
    let brand = siteInfo;

    if (isNull(siteInfo)) {
      brand = await getBrandInfo();
    }

    const currentDateTime = convertDateTime().toLocaleString();

    delete data.id;
    delete data.updatedAt;
    data.updatedAt = data.updatedAt || currentDateTime;
    data.lastUpdatedFrom = brand?.id;

    // Updated query condition to match by either `id` or `slug`
    const result = await collection.updateOne(
      { $or: [{ id: id }] }, // Match either by id or slug
      { $set: data },
      { upsert: false },
    );

    if (result.acknowledged) {
      mongoRes.status = true;
      mongoRes.id = id;
      return mongo_response(mongoRes);
    } else {
      return mongo_response({ ...mongoRes, msg: 'not updated' });
    }
  } catch (error) {
    console.error('Failed to insert or update the database:', error);
    return mongo_response({ status: false, msg: 'error occurred', data: [] });
  }
}

export async function _fetchData(collectionName: string, id?: any): Promise<any> {
  const db = await connectDB();
  try {
    const collection = db.collection(collectionName);

    if (id) {
      if (ObjectId.isValid(id)) {
        id = new ObjectId(id);
      }

      return await collection.findOne({
        $or: [{ id: id }, { _id: id }, { slug: id }],
      });
    } else {
      return await collection.find({}).toArray();
    }
  } catch (error) {
    console.error(`Failed to fetch data from collection "${collectionName}":`, error);
  }
}

export async function _fetchDataWithConditions(
  collectionName: string,
  conditions: { [key: string]: any },
  sortOptions: { [key: string]: any } = {},
  ignoreCache: boolean = false,
): Promise<any> {
  try {
    const db = await connectDB(ignoreCache);
    const collection = db.collection(collectionName);
    const data = await collection.find(conditions).sort(sortOptions).toArray();
    return mongo_response({ data, status: true });
  } catch (error) {
    console.error(
      `Failed to fetch data from collection "${collectionName}" with conditions "${JSON.stringify(
        conditions,
      )}" and sort options "${JSON.stringify(sortOptions)}":`,
      error,
    );
    return mongo_response({ status: false, data: [] });
  }
}

export async function _deleteDataWithConditions({
  collectionName,
  conditions,
  ignoreCache = false,
}: {
  collectionName: string;
  conditions: { [key: string]: any };
  ignoreCache?: boolean;
}): Promise<any> {
  try {
    const missing = findMissingFields({ collectionName, conditions });

    if (missing) return { ...mongoRes, status: false, msg: `${missing} missing` };

    const db = await connectDB(ignoreCache);
    const collection = db.collection(collectionName);
    const result = await collection.deleteMany(conditions);
    return mongo_response({ deletedCount: result.deletedCount, data: result, status: true });
  } catch (error) {
    console.error(
      `Failed to delete data from collection "${collectionName}" with conditions "${JSON.stringify(
        conditions,
      )}":`,
      error,
    );
    return mongo_response({ deletedCount: 0, status: false, data: [] });
  }
}

export async function _fetchPaginatedData({
  collectionName,
  conditions,
  limit = '10',
  page = '1',
  sortOptions = {},
}: {
  collectionName: string;
  conditions: { [key: string]: any };
  limit?: string;
  page?: string;
  sortOptions?: { [key: string]: any }; // Adding sortOptions parameter
}): Promise<{
  data: any[];
  status: boolean;
  meta?: {
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    itemsPerPage?: number;
  };
}> {
  try {
    const db: any = await connectDB();

    const collection = db.collection(collectionName);

    // Calculate total number of items that match the conditions
    const totalItems = await collection.countDocuments(conditions);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / parseInt(limit, 10));

    // Calculate how many documents to skip based on the page number
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Fetch data with limit, skip, and sorting
    const data = await collection
      .find(conditions)
      .sort(sortOptions) // Apply the sort options
      .skip(skip)
      .limit(parseInt(limit, 10))
      .toArray();

    // Construct the meta object
    const meta = {
      totalItems,
      totalPages,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
    };

    return mongo_response({
      ...mongoRes,
      data,
      meta,
      status: true,
    });
  } catch (error) {
    console.error(
      `Failed to fetch data from collection "${collectionName}" with conditions "${JSON.stringify(
        conditions,
      )}" and sort options "${JSON.stringify(sortOptions)}":`,
      error,
    );
    return mongo_response({
      msg: 'error occurred',
      data: [],
      status: false,
      meta: {
        totalItems: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
      },
    });
  }
}

export async function _fetchMultiplePaginatedData({
  collectionNames,
  conditions,
  limit = '10',
  page = '1',
  sortOptions = {},
}: {
  collectionNames: string[];
  conditions: { [key: string]: any };
  limit?: string;
  page?: string;
  sortOptions?: { [key: string]: any };
}): Promise<{
  data: any[];
  meta?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}> {
  try {
    const db: any = await connectDB();
    const parsedLimit = Math.max(parseInt(limit, 10), 1); // Ensure limit is at least 1
    const parsedPage = Math.max(parseInt(page, 10), 1); // Ensure page is at least 1

    const all: any[] = [];
    let totalItems = 0; // Track total items across collections

    for (const collectionName of collectionNames) {
      const collection = db.collection(collectionName);

      // Calculate total items in this collection
      const collectionTotal = await collection.countDocuments(conditions);
      totalItems += collectionTotal;

      // Skip documents based on pagination
      const skip = (parsedPage - 1) * parsedLimit;

      // Fetch paginated data
      const data = await collection
        .find(conditions)
        .sort(sortOptions)
        .skip(skip)
        .limit(parsedLimit - all.length) // Only fetch remaining needed items
        .toArray();

      if (data.length > 0) {
        for (const record of data) {
          all.push({ ...record });

          // If gathered items exceed the limit, return early
          if (all.length >= parsedLimit) {
            return mongo_response({
              data: all,
              status: true,
              meta: {
                totalItems: all.length,
                totalPages: Math.ceil(totalItems / parsedLimit),
                currentPage: parsedPage,
                itemsPerPage: parsedLimit,
              },
            });
          }
        }
      }
    }

    // If the loop completes without exceeding limit, return normally
    return mongo_response({
      data: all,
      status: true,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / parsedLimit),
        currentPage: parsedPage,
        itemsPerPage: parsedLimit,
      },
    });
  } catch (error) {
    console.error(`Failed to fetch data from collections "${collectionNames.join(', ')}":`, error);
    return mongo_response({
      data: [],
      status: false,
      meta: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: parseInt(limit, 10),
      },
    });
  }
}

export async function _updateDataWithConditions(
  collectionName: string,
  conditions: { [key: string]: any },
  updateFields: { [key: string]: any },
  personalize = true,
  siteInfo?: BrandType,
): Promise<any> {
  const db = await connectDB();

  try {
    let brand = siteInfo;

    const missing = findMissingFields({ collectionName, conditions });

    if (missing) return { ...mongoRes, status: false, msg: `${missing} missing` };

    if (isNull(siteInfo)) {
      brand = await getBrandInfo();
    }

    delete updateFields.id;

    if (personalize) {
      updateFields.createdFrom = brand?.id;
    }

    const collection = db.collection(collectionName);
    const result = await collection.updateMany(conditions, {
      $set: updateFields,
    });

    if (result.modifiedCount > 0 || result.acknowledged) {
      return mongo_response({ status: true, data: result });
    } else {
      console.error(
        `No documents matched the conditions "${JSON.stringify(
          conditions,
        )}" in collection "${collectionName}".`,
        result,
      );
      return mongo_response({
        status: false,
        msg: 'No documents matched the conditions',
        data: [],
      });
    }
  } catch (error) {
    console.error(
      `Failed to update data in collection "${collectionName}" with conditions "${JSON.stringify(
        conditions,
      )}":`,
      error,
    );
    return mongo_response({ status: false, msg: 'Failed to update data in collection', data: [] });
  }
}

export function mongo_response(
  mongoRes: { data: any; status: boolean; [key: string]: any } | null | undefined,
  id = '',
) {
  if (mongoRes) {
    return {
      ...mongoRes,
      msg: mongoRes.msg ?? mongoRes.error,
    };
  } else {
    return { status: false, data: [], msg: 'error' };
  }
}

export async function _deleteData(collectionName: string, id: any): Promise<any> {
  const db = await connectDB();
  try {
    const collection = db.collection(collectionName);

    if (id) {
      const res = await collection.deleteOne({ id: id });
      return {
        status: true,
        success: true,
        msg: 'deleted',
      };
    } else {
      return {
        status: false,
        success: false,
        msg: 'ID is required to delete a specific document.',
      };
    }
  } catch (error) {
    return {
      status: false,
      success: false,
      msg: 'not deleted',
    };
  }
}

export async function _upsert(
  item: any,
  collectionName: string,
  upsert = true,
  siteInfo: BrandType,
) {
  try {
    item = beforeUpdate(item);

    if (isNull(item)) {
      return mongo_response({ ...mongoRes, status: false });
    }

    let brand = siteInfo;

    if (isNull(siteInfo)) {
      brand = await getBrandInfo();
    }

    const id = item.id ?? '';
    const slug = item.slug ?? '';

    if (isNull(id)) {
      show_error('id is missing during upsert', 'id is missing during upsert');
      return { ...mongoRes, msg: 'id is missing', status: false };
    }

    // Create a filter that matches either id, slug, or _id
    let filter: any = { $or: [{ id }] };

    if (!isNull(slug)) {
      //  filter = { $or: [{ id }, { slug: slug }] };
    }

    // Create a copy of the item without the 'id', 'slug', '_id', 'createdAt', and 'status' fields
    const { id: _, createdAt: __, ...itemWithoutIdSlugStatusAndMongoId } = item;

    // Prepare the update object
    const update: any = {
      $set: {
        ...itemWithoutIdSlugStatusAndMongoId,
        updatedAt: convertDateTime(),
        lastUpdatedFrom: brand?.id!,
      },
      $setOnInsert: {
        id, // Only set 'id' if inserting
        createdFrom: brand?.id!,

        mode: mode,
        createdAt: convertDateTime(), // Only set 'createdAt' if inserting
      },
    };

    // Ensure the `id` is properly set in the `update` object for upsert operations
    if (!update.$setOnInsert) {
      update.$setOnInsert = {};
    }
    update.$setOnInsert.id = update.$setOnInsert.id || id;

    const db = await connectDB();
    const collection = db.collection(collectionName);

    // Perform the upsert operation
    const result = await collection.updateOne(filter, update, { upsert });

    // Safely determine the result ID
    const resId = result.matchedCount > 0 ? id : update.$setOnInsert && update.$setOnInsert.id;

    return mongo_response({
      data: itemWithoutIdSlugStatusAndMongoId,
      status: result.matchedCount > 0 || result.upsertedCount > 0 ? true : false,
      msg: `Upsert completed: ${result.matchedCount} matched, ${result.upsertedCount} upserted on ${collectionName}`,
    });
  } catch (error) {
    console.error('Error in upsert:', error);

    return mongo_response({ ...mongoRes, status: false });
  }
}

export async function _bulkUpsert(
  data: any[],
  collectionName: string,
  upsert = true,
  siteInfo?: BrandType,
) {
  // Input validation
  if (!data || data.length === 0) {
    return mongo_response({
      ...mongoRes,
      status: false,
      error: 'Invalid or empty data array',
    });
  }

  try {
    const db = await connectDB();
    const collection = db.collection(collectionName);

    // Fallback brand info if not provided
    const brand = siteInfo || (await getBrandInfo());

    const operations = data.reduce((ops, item) => {
      try {
        const processedItem = beforeUpdate(item);

        // Skip null or invalid items
        if (!processedItem || !item.id) return ops;

        delete processedItem.createdAt;

        // Ensure id exists, use alternative identifiers
        const id = processedItem.id;

        const slug = processedItem.slug || '';
        const _id = processedItem._id;

        const filter = { $or: [{ id }, { _id }] };

        const {
          id: _,
          _id: ___,
          createdFrom: ____,
          ...itemWithoutIdSlugStatusAndMongoId
        } = processedItem;

        const update: any = {
          $set: {
            ...itemWithoutIdSlugStatusAndMongoId,
            updatedAt: convertDateTime(),
            lastUpdatedFrom: brand?.id,
          },
          $setOnInsert: {
            id,
            createdAt: convertDateTime(),
            mode: mode,
            createdFrom: brand?.id,
          },
        };

        ops.push({
          updateOne: {
            filter,
            update,
            upsert: upsert,
          },
        });

        return ops;
      } catch (itemError) {
        console.error(`Error processing item: ${JSON.stringify(item)}`, itemError);
        return ops;
      }
    }, [] as any[]);

    // Check if any operations were created
    if (operations.length === 0) {
      return mongo_response({
        ...mongoRes,
        status: false,
        msg: 'No valid operations could be created',
      });
    }

    // Execute bulk operation with additional error handling
    const result = await collection.bulkWrite(operations, {
      ordered: false,
      writeConcern: { w: 1 },
    });

    return mongo_response({
      status: true,
      added: result.upsertedCount,
      updated: result.modifiedCount,
      failedOperations: '',
      data: `Bulk upsert completed: ${result.modifiedCount} modified, ${result.upsertedCount} upserted. ${result}`,
    });
  } catch (error) {
    console.error('Critical error in bulkUpsert:', error);
    return mongo_response({
      ...mongoRes,
      status: false,
      msg: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error,
    });
  }
}

export async function _modifyFieldValue({
  collectionName,
  filter,
  fieldName,
  value,
  operation,
}: {
  collectionName: string;
  filter: Record<string, any>;
  fieldName: string;
  value: number;
  operation: 'increment' | 'decrement';
}): Promise<any> {
  try {
    const missing = findMissingFields({
      collectionName,
      filter,
      fieldName,
      value,
      operation,
    });

    if (missing) {
      throw Error(`missing: ${missing}`);
    }

    const db = await connectDB();
    const collection = db.collection(collectionName);

    // Determine the value to change based on operation
    const changeBy = operation === 'increment' ? value : -value;

    const result = await collection.updateOne(
      filter, // Filter to identify the document
      { $inc: { [fieldName]: changeBy } }, // Increment/Decrement operation
      { upsert: false }, // Do not create a document if not found
    );

    if (result.modifiedCount > 0) {
      return {
        status: true,
        message: `Field '${fieldName}' ${operation}ed by ${value} in '${collectionName}'.`,
      };
    } else {
      return {
        status: false,
        message: `No document matched the filter in '${collectionName}'.`,
      };
    }
  } catch (error) {
    console.error(`Error modifying field in '${collectionName}':`, error);
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
