import { SectionOption } from '@/app/types/section';

export const introDefault: SectionOption = {
  type: 'site_component',
  key: 'intro',
  label: 'Introdution Widget',
  classes: { width_all: 'w-auto', padding_all: 'p-1', text_sizes: 'text-sm' },

  preferences: {
    default: [
      { type: 'text', key: 'highlight', value: 'Highlights' },
      { type: 'text', key: 'subject', value: 'Electronic Top Up' },
      {
        type: 'text',
        key: 'description',
        value:
          'Enjoy highly discounted rates on Internet Data Plans, Airtime VTU, Utility Bills and Convert Airtime to Cash.',
      },
    ],
  },
};
