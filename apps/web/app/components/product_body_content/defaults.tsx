import { route_public_page } from '@/app/routes/page_routes';
import { SectionOption } from '@/app/types/section';

export const productBodyContent: SectionOption = {
  type: 'site_component',
  key: 'pbc',
  label: 'Product Body Content',
  classes: { width_all: 'w-full', padding_all: 'p-1' },

  preferences: { default: [] },
};
