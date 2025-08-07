import colors from 'tailwindcss/colors';
import { animationOptions } from '@/dashboard/page_builder/classes/animation';
import { borders } from '@/dashboard/page_builder/classes/border';
import { bordersRadius } from '@/dashboard/page_builder/classes/border_radius';
import { flexOptions } from '@/dashboard/page_builder/classes/flex';
import { gridOptions } from '@/dashboard/page_builder/classes/grid';
import { height } from '@/dashboard/page_builder/classes/height';
import { positionOptions } from '@/dashboard/page_builder/classes/positions';
import { shadowOptions } from '@/dashboard/page_builder/classes/shadow';
import { textOptions } from '@/dashboard/page_builder/classes/text';
import { width } from '@/dashboard/page_builder/classes/width';
import { objectPaddings } from '@/dashboard/page_builder/classes/padding';
import { objectMargins } from '@/dashboard/page_builder/classes/margin';

export const configurationsSelections = [
  {
    category: 'width',
    options: width,
  },
  {
    category: 'height',
    options: height,
  },
  {
    category: 'padding',
    options: objectPaddings,
  },
  {
    category: 'margin',
    options: objectMargins,
  },
  {
    category: 'borders',
    options: borders,
  },

  {
    category: 'borderRadius',
    options: bordersRadius,
  },

  {
    category: 'flex',
    options: flexOptions,
  },
  {
    category: 'text',
    options: textOptions,
  },
  {
    category: 'colors',
    options: colors,
  },

  {
    category: 'shadows',
    options: shadowOptions,
  },
  {
    category: 'grid',
    options: gridOptions,
  },
  {
    category: 'positions',
    options: positionOptions,
  },
  {
    category: 'animations',
    options: animationOptions,
  },
];
