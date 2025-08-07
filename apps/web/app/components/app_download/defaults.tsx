import { SectionOption } from '@/app/types/section';

export const appDownloadHero1: SectionOption = {
  type: 'site_component',
  key: 'appDownloadHero1',
  label: 'App Download Hero',
  classes: { width_all: 'w-full', padding_all: 'p-1' },

  preferences: {
    default: [
      { type: 'image', key: 'mockup', value: '/images/app-mockup.png' },
      { type: 'text', key: 'theBestBill', value: 'The Best Bill-Paying Platform' },
      {
        type: 'text',
        key: 'ourplatformmakes',
        value: 'Our platform makes paying bills easy and hassle-free.',
      },
      {
        type: 'link',
        key: 'apkLink',
        value: '',
      },
      {
        type: 'link',
        key: 'iosLink',
        value: '',
      },
    ],
  },
};
