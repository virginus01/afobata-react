import {
  PaddingAll,
  PaddingX,
  PaddingY,
  PaddingTop,
  PaddingBottom,
  PaddingLeft,
  PaddingRight,
} from '@/app/dashboard/page_builder/classes/padding';
import {
  MarginAll,
  MarginX,
  MarginY,
  MarginTop,
  MarginBottom,
  MarginLeft,
  MarginRight,
} from '@/app/dashboard/page_builder/classes/margin';
import { widthAll, widthSm } from '@/app/dashboard/page_builder/classes/width';

export interface StyleProperties {
  padding_all?: PaddingAll;
  padding_x?: PaddingX;
  padding_y?: PaddingY;
  padding_top?: PaddingTop;
  padding_bottom?: PaddingBottom;
  padding_left?: PaddingLeft;
  padding_right?: PaddingRight;

  margin_all?: MarginAll;
  margin_x?: MarginX;
  margin_y?: MarginY;
  margin_top?: MarginTop;
  margin_bottom?: MarginBottom;
  margin_left?: MarginLeft;
  margin_right?: MarginRight;

  width_all?: widthAll;
  width_large_screen?: widthSm;

  height_all?:
    | 'h-0'
    | 'h-1'
    | 'h-2'
    | 'h-3'
    | 'h-4'
    | 'h-5'
    | 'h-6'
    | 'h-8'
    | 'h-10'
    | 'h-12'
    | 'h-16'
    | 'h-20'
    | 'h-24'
    | 'h-32'
    | 'h-40'
    | 'h-48'
    | 'h-56'
    | 'h-64'
    | 'h-72'
    | 'h-80'
    | 'h-96'
    | 'h-full'
    | 'h-screen'
    | 'h-auto'
    | 'h-min'
    | 'h-max'
    | 'h-fit'
    | 'h-1/2'
    | 'h-1/3'
    | 'h-2/3'
    | 'h-1/4'
    | 'h-3/4'
    | 'h-1/5'
    | 'h-2/5'
    | 'h-3/5'
    | 'h-4/5'
    | 'h-1/6'
    | 'h-5/6';

  flex_display?: 'flex' | 'inline-flex';
  flex_direction?: 'flex-row' | 'flex-row-reverse' | 'flex-col' | 'flex-col-reverse';
  flex_wrap?: 'flex-wrap' | 'flex-wrap-reverse' | 'flex-nowrap';
  flex_justifyContent?:
    | 'justify-start'
    | 'justify-end'
    | 'justify-center'
    | 'justify-between'
    | 'justify-around'
    | 'justify-evenly';
  flex_alignItems?:
    | 'items-start'
    | 'items-end'
    | 'items-center'
    | 'items-baseline'
    | 'items-stretch';
  flex_alignContent?:
    | 'content-start'
    | 'content-end'
    | 'content-center'
    | 'content-between'
    | 'content-around'
    | 'content-evenly';
  flex_alignSelf?: 'self-auto' | 'self-start' | 'self-end' | 'self-center' | 'self-stretch';
  flex_growShrink?: 'flex-grow-0' | 'flex-grow' | 'flex-shrink-0' | 'flex-shrink';
  flex_order?: 'order-first' | 'order-last' | 'order-none' | `order-${number}`;

  text_sizes?:
    | 'text-xs'
    | 'text-sm'
    | 'text-base'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
    | 'text-6xl'
    | 'text-7xl'
    | 'text-8xl'
    | 'text-9xl';

  text_alignments?:
    | 'text-left'
    | 'text-center'
    | 'text-right'
    | 'text-justify'
    | 'text-start'
    | 'text-end';
  text_weights?:
    | 'font-thin'
    | 'font-extralight'
    | 'font-light'
    | 'font-normal'
    | 'font-medium'
    | 'font-semibold'
    | 'font-bold'
    | 'font-extrabold'
    | 'font-black';
  text_styles?: 'italic' | 'not-italic';
  text_decorations?: 'underline' | 'overline' | 'line-through' | 'no-underline';
  text_spacings?:
    | 'tracking-tighter'
    | 'tracking-tight'
    | 'tracking-normal'
    | 'tracking-wide'
    | 'tracking-wider'
    | 'tracking-widest';
  text_leading?:
    | 'leading-none'
    | 'leading-tight'
    | 'leading-snug'
    | 'leading-normal'
    | 'leading-relaxed'
    | 'leading-loose';
  text_wrapping?:
    | 'truncate'
    | 'whitespace-nowrap'
    | 'whitespace-pre'
    | 'whitespace-pre-line'
    | 'whitespace-pre-wrap';

  colors_background?: `bg-${string}`;
  colors_text?: `text-${string}`;
  colors_border?: `border-${string}`;

  shadows_sizes?: 'shadow-sm' | 'shadow-md' | 'shadow-lg' | 'shadow-xl' | 'shadow-2xl';
  shadows_types?: 'shadow-inner' | 'shadow-outline' | 'shadow-none';

  grid_display?: 'grid' | 'inline-grid';
  grid_columns?: `grid-cols-${number}`;
  grid_gap?: `gap-${number}`;

  positions_position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  positions_edges?: `top-${string}` | `bottom-${string}` | `left-${string}` | `right-${string}`;
  positions_zIndex?: `z-${number}`;

  animations_animations?:
    | 'animate-none'
    | 'animate-spin'
    | 'animate-ping'
    | 'animate-pulse'
    | 'animate-bounce';
}
