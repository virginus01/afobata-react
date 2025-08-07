import path from 'path';
import fs from 'fs';
import { isNull } from '@/app/helpers/isNull';

export async function readDb({ file, dir = 'database' }: { file: string; dir?: string }) {
  try {
    const filePath = path.join(process.cwd(), 'public', dir ?? 'database', file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    let constructedData: any[] = [];

    for (let c of data) {
      if (!isNull(c)) {
        constructedData.push(c);
      }
    }

    return constructedData || [];
  } catch (error) {
    console.error('Error db connect');
    return [];
  }
}
