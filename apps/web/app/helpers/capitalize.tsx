import { isNull } from '@/app/helpers/isNull';

export function capitalize(text: string) {
  if (isNull(text)) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
