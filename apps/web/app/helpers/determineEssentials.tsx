import { SectionOption } from '@/app/types/section';
import { isNull } from '@/app/helpers/isNull';

export function determineEssentials({ pageData }: { pageData: SectionOption[] }): string[] {
  let essentials: string[] = [];

  if (!isNull(pageData)) {
    pageData.forEach((p) => {
      if (Array.isArray(p.essentials)) {
        essentials.push(...p.essentials);
      }
    });
  }

  return essentials;
}
