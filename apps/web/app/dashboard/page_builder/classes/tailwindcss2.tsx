import {
  animationOptions,
  objectAnimationOptions,
} from '@/dashboard/page_builder/classes/animation';
import { borders, objectBorders } from '@/dashboard/page_builder/classes/border';
import { bordersRadius, objectBorderRadius } from '@/dashboard/page_builder/classes/border_radius';
import { objectColorOptions } from '@/dashboard/page_builder/classes/colors';
import { flexOptions, objectFlexOptions } from '@/dashboard/page_builder/classes/flex';
import { gridOptions, objectGridOptions } from '@/dashboard/page_builder/classes/grid';
import { height, objectHeights } from '@/dashboard/page_builder/classes/height';
import { objectMargins } from '@/dashboard/page_builder/classes/margin';
import { objectPaddings } from '@/dashboard/page_builder/classes/padding';
import { objectPositionOptions, positionOptions } from '@/dashboard/page_builder/classes/positions';
import { objectShadowOptions, shadowOptions } from '@/dashboard/page_builder/classes/shadow';
import { objectTextOptions, textOptions } from '@/dashboard/page_builder/classes/text';
import { objectWidths, width } from '@/dashboard/page_builder/classes/width';

export const configurationsSelections: {
  category: string;
  options: any;
  detailed: { value: string | number; class: string; title: string }[];
}[] = [
  {
    category: 'width',
    options: width,
    detailed: objectWidths,
  },
  {
    category: 'height',
    options: height,
    detailed: objectHeights,
  },
  {
    category: 'padding',
    options: {},
    detailed: objectPaddings,
  },
  {
    category: 'margin',
    options: {},
    detailed: objectMargins,
  },
  {
    category: 'borders',
    options: borders,
    detailed: objectBorders,
  },

  {
    category: 'borderRadius',
    options: bordersRadius,
    detailed: objectBorderRadius,
  },

  {
    category: 'flex',
    options: flexOptions,
    detailed: objectFlexOptions,
  },
  {
    category: 'text',
    options: textOptions,
    detailed: objectTextOptions,
  },
  {
    category: 'colors',
    options: {},
    detailed: objectColorOptions,
  },

  {
    category: 'shadows',
    options: shadowOptions,
    detailed: objectShadowOptions,
  },
  {
    category: 'grid',
    options: gridOptions,
    detailed: objectGridOptions,
  },
  {
    category: 'positions',
    options: positionOptions,
    detailed: objectPositionOptions,
  },
  {
    category: 'animations',
    options: animationOptions,
    detailed: objectAnimationOptions,
  },
];
