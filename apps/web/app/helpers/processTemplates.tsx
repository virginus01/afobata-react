import { isNull } from '@/app/helpers/isNull';
import { Brand } from '@/app/models/Brand';
import { Data } from '@/app/models/Data';

export function processTemplates({
  input,
  brand,
  data,
}: {
  input: string;
  brand: Brand;
  data: Data;
}): string {
  if (typeof input !== 'string' || isNull(input)) return input;

  const map: Record<string, string> = {
    siteName: brand?.name ?? 'Our Platform',
  };

  return input.replace(/\{\{(.*?)\}\}/g, (_, key) => map[key.trim()] ?? `{{${key}}}`);
}
