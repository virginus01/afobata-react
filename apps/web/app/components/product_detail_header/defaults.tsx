import { route_public_page } from '@/app/routes/page_routes';
import { SectionOption } from '@/app/types/section';

export const pdh: SectionOption = {
  type: 'site_component',
  key: 'pdh',
  label: 'Product Detail Header',
  classes: { width_all: 'w-full', padding_all: 'p-1' },

  preferences: { default: [] },
};
