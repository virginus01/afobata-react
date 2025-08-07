import { route_public_page } from '@/app/routes/page_routes';
import { SectionOption } from '@/app/types/section';

export const hero1Default: SectionOption = {
  type: 'site_component',
  key: 'creatorHero',
  label: 'Creator Hero',
  classes: { width_all: 'w-full', padding_all: 'p-1' },

  preferences: {
    default: [
      { type: 'image', key: 'upperImage', value: '/images/circle3-yellow.svg' },
      { type: 'image', key: 'heroImage', value: '/images/header.png' },
      { type: 'image', key: 'lowerImage', value: '/images/dots3-blue.svg' },
      {
        type: 'link',
        key: 'heroLink1',
        value: route_public_page({ paths: ['login'] }),
      },
      {
        type: 'link',
        key: 'heroLink2',
        value: route_public_page({ paths: ['signup'] }),
      },
    ],
  },
};
