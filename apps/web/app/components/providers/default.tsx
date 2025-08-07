import { SectionOption } from '@/app/types/section';

export const providers: SectionOption = {
  type: 'site_component',
  key: 'providers',
  label: 'Service Providers',
  classes: {},
  preferences: {
    default: [
      { type: 'text', key: 'title', value: '  service providers brands connected to {{siteName}}', title: 'Title' },
      { type: 'text', key: 'description', value: 'making the lives of users much easier' },
      { type: 'number', key: 'providersNumber', value: 55 },
      { type: 'image', key: 'image', value: '/images/components/providers.png' },
      { type: 'text', key: 'link', value: '#' },
      { type: 'text', key: 'linkText', value: 'Find Out More', title: 'Link Text' },
      { type: 'radio', key: 'style', value: '1', title: 'Style', data: [{ value: '1', label: 'Style 1' }] },
    ],

  },
};

const prefs = {};
