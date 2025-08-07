import { isNull } from '@/app/helpers/isNull';
import { processTemplates } from '@/app/helpers/processTemplates';
import { Brand } from '@/app/models/Brand';
import { Data } from '@/app/models/Data';

export function clvalue({
  items,
  brand,
  data,
}: {
  items: any[];
  brand: Brand;
  data: Data;
}): Record<string, any> | string {
  if (isNull(items)) return '';

  const result: Record<string, any> = {};

  items.forEach((entry) => {
    if (entry?.key) {
      const value = entry.value;

      if (Array.isArray(value)) {
        if (value.length > 0 && Array.isArray(value[0])) {
          // Handle 'lists' type (array of arrays)
          result[entry.key] = value.map((subArray: any[]) => {
            const subData: Record<string, any> = {};
            subArray.forEach((subItem: any) => {
              if (subItem?.key) {
                subData[subItem.key] =
                  processTemplates({ input: subItem?.value, brand, data }) ?? null;
              }
            });
            return subData;
          });
        } else {
          // Recursively process nested items
          result[entry.key] = clvalue({ items: value, brand, data });
        }
      } else {
        result[entry.key] = processTemplates({ input: value, brand, data }) ?? null;
      }
    }
  });

  return result;
}
