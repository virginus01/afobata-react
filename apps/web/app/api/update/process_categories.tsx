import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { readDb } from '@/api/read';
import slugify from 'slugify';
import { bulkUpsert } from '@/app/api/database/mongodb';

export async function processCategories() {
  try {
    let categories: any[] = await readDb({ file: 'business_category.json' });

    if (!Array.isArray(categories)) {
      throw new Error('Invalid data format: Expected an array');
    }

    let categoriesData: any[] = [];

    // Add the main category
    categoriesData.push({
      id: slugify('business', { lower: true, replacement: '', trim: true }),
      name: 'Business',
      parentId: '',
    });

    // Process categories and validate input
    categories.forEach((cat) => {
      if (cat) {
        categoriesData.push({ ...cat, type: 'category' });
      } else {
        console.warn(`Skipping invalid category: ${cat}`);
      }
    });

    console.info('category data size:', categoriesData.length);

    const status = await bulkUpsert(categoriesData, 'categories', true, {});

    return api_response({
      data: { length: categoriesData.length },
      status: status.status,
    });
  } catch (error) {
    console.error('Error processing categories:', error);
    return invalid_response('category error');
  }
}
