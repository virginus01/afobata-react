import { isNull } from '@/app/helpers/isNull';

export function uppercase(text: string) {
  if (isNull(text)) return '';
  return text.toUpperCase();
}
