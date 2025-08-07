import { route_public_page } from '@/app/routes/page_routes';
import { SectionOption } from '@/app/types/section';

export const descCard: SectionOption = {
  type: 'site_component',
  key: 'desc_card',
  label: 'Description Card',
  classes: { width_all: 'w-full', padding_all: 'p-1' },

  preferences: { default: [] },
};
