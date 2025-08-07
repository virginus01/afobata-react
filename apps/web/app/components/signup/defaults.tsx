import { SectionOption } from '@/app/types/section';

export const signUpDefault: SectionOption = {
  type: 'site_component',
  key: 'signUp',
  label: 'Signup Widget',
  essentials: ['countries'],
  classes: [
    {
      class: 'flex',
      category: 'flex',
    },
    {
      class: 'mx-auto',
      category: 'margin',
    },
    {
      class: 'justify-center',
      category: 'flex',
    },
    {
      class: 'w-auto',
      category: 'width',
    },
    {
      class: 'h-auto',
      category: 'height',
    },
  ],
};
