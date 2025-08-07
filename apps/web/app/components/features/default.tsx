import { SectionOption } from '@/app/types/section';

export const features: SectionOption = {
  type: 'site_component',
  key: 'features',
  label: 'Features',
  thumbnail: '/images/sections/features.png',
  classes: {},
  preferences: {
    default: [
      { type: 'text', key: 'title', value: 'Sell any kind of product, service or subscription', title: 'Title' },
      { type: 'text', key: 'description', value: '' },
      { type: 'text', key: 'link', value: '' },
      { type: 'text', key: 'linkText', value: 'See all features', title: 'Link Text' },
      { type: 'radio', key: 'style', value: '1', title: 'Style', data: [{ value: 1, label: 'Style 1' }, { value: 2, label: 'Style 2' }] },
      { type: 'lists', key: 'features', value: [
        [{ type: 'icon', key: 'icon', value: 'Monitor' }, { type: 'text', key: 'title', value: 'Digital Products' }, { type: 'text', key: 'description', value: 'Sell any and every kind of digital product, from content packs to designs to bundles and more without stress.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '/products/digital' }],
        [{ type: 'icon', key: 'icon', value: 'BookOpen' }, { type: 'text', key: 'title', value: 'Ebooks' }, { type: 'text', key: 'description', value: '{{siteName}} is the best platform to sell your ebooks both downloadable and non-downloadable in any format.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '/products/ebooks' }],
        [{ type: 'icon', key: 'icon', value: 'GraduationCap' }, { type: 'text', key: 'title', value: 'Courses & Memberships' }, { type: 'text', key: 'description', value: 'You can host your courses & membership sites with unlimited videos & files, unlimited storage, and have unlimited students, plus you get content security to prevent theft.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '/products/courses' }],
        [{ type: 'icon', key: 'icon', value: 'Ticket' }, { type: 'text', key: 'title', value: 'Event Tickets & Training' }, { type: 'text', key: 'description', value: 'Sell tickets for all kinds of events and access to masterclasses, events, workshops, training, webinars, and even more.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '/products/events' }],
        [{ type: 'icon', key: 'icon', value: 'Stars' }, { type: 'text', key: 'title', value: 'Services' }, { type: 'text', key: 'description', value: 'Sell any kind of service, from coaching services to consultations to counseling sessions to design services and more.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '/products/services' }],
        [{ type: 'icon', key: 'icon', value: 'Package' }, { type: 'text', key: 'title', value: 'Physical Goods' }, { type: 'text', key: 'description', value: 'You can also use {{siteName}} to sell your physical product from clothing to books to electronics and appliances and more.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '/products/physical' }]
      ] }
    ],
  },
};
