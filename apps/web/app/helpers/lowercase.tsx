import { isNull } from '@/app/helpers/isNull';

export function lowercase(text: string) {
  if (isNull(text)) return text;
  return text.toLowerCase();
}
