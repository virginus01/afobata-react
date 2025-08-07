import { SectionOption } from '@/app/types/section';

export const steps: SectionOption = {
  type: 'site_component',
  key: 'steps',
  label: 'Steps',
  classes: {},
  preferences: {
    default: [
      { type: 'text', key: 'title', value: 'It’s simple and easy to set up your platforms on {{siteName}}', title: 'Title' },
      { type: 'text', key: 'description', value: '' },
      { type: 'image', key: 'image', value: '/images/components/steps_mobile_app.png' },
      { type: 'text', key: 'link', value: '#' },
      { type: 'text', key: 'linkText', value: 'Find Out More', title: 'Link Text' },
      { type: 'radio', key: 'style', value: '1', title: 'Style', data: [{ value: '1', label: 'Style 1' }, { value: '2', label: 'Style 2' }] },
      { type: 'lists', key: 'steps', value: [
        [{ type: 'image', key: 'image', value: '/images/components/get_started_steps_1_img1.png' }, { type: 'text', key: 'title', value: 'Sign up and set up your bank details.' }, { type: 'text', key: 'description', value: '' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '' }],
        [{ type: 'image', key: 'image', value: '/images/components/get_started_steps_1_img2.png' }, { type: 'text', key: 'title', value: 'Set up your store and upload your products.' }, { type: 'text', key: 'description', value: '' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '' }],
        [{ type: 'image', key: 'image', value: '/images/components/get_started_steps_1_img3.png' }, { type: 'text', key: 'title', value: 'Share your store link with customers and start getting paid right away!' }, { type: 'text', key: 'description', value: '' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '' }]
      ] },
    ],
    utility: [
      { type: 'text', key: 'title', value: '3 Simple Steps to Enjoy <br> <span class="text-primary font-briston">{{siteName}}.</span>', title: 'Title' },
      { type: 'text', key: 'description', value: '' },
      { type: 'image', key: 'image', value: '/images/components/steps_mobile_app.png' },
      { type: 'text', key: 'link', value: '#' },
      { type: 'text', key: 'linkText', value: 'Find Out More', title: 'Link Text' },
      { type: 'radio', key: 'style', value: '2', title: 'Style', data: [{ value: '1', label: 'Style 1' }, { value: '2', label: 'Style 2' }] },
      { type: 'lists', key: 'steps', value: [
        [{ type: 'image', key: 'image', value: '/images/components/get_started_steps_1_img1.png' }, { type: 'text', key: 'title', value: 'Download and Install the App' }, { type: 'text', key: 'description', value: 'Visit your app store, search for "{{siteName}}" and download and install the app on your mobile device.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '' }],
        [{ type: 'image', key: 'image', value: '/images/components/get_started_steps_1_img2.png' }, { type: 'text', key: 'title', value: 'Sign Up on {{siteName}} for free' }, { type: 'text', key: 'description', value: 'Open the app and follow the quick and easy sign-up process. All you need is your basic personal information.' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '' }],
        [{ type: 'image', key: 'image', value: '/images/components/get_started_steps_1_img3.png' }, { type: 'text', key: 'title', value: 'Add Funds and Pay Bills' }, { type: 'text', key: 'description', value: 'Once you\'re signed in, you can add funds to your account and start paying your bills. It\'s that simple!' }, { type: 'tw_color', key: 'color', value: 'gray-600' }, { type: 'tw_color', key: 'bg_color', value: 'gray-50' }, { type: 'text', key: 'link', value: '' }]
      ] },
    ],
  },
};

const prefs = {};
