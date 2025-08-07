import { isNull } from '@/app/helpers/isNull';

export function trackNull(text?: string, variable?: string, comment = 'process'): string {
  if (isNull(text)) {
    console.error(`${variable} is missing on ${comment}`);
    return '';
  } else {
    return text!;
  }
}
