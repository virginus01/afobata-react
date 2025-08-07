'use server';
import fs from 'fs/promises';
import path from 'path';

export async function getDictionary(locale = 'en') {
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Failed to load ${locale} dictionary:`, error);
    return {};
  }
}
