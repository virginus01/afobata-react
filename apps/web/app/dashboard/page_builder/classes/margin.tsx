const baseValues = [
  0,
  0.5,
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  12,
  16,
  20,
  24,
  32,
  40,
  48,
  56,
  64,
  72,
  80,
  96,
  'auto',
] as const;

// Base margin types
export type MarginAll = `m-${(typeof baseValues)[number]}`;
export type MarginX = `mx-${(typeof baseValues)[number]}`;
export type MarginY = `my-${(typeof baseValues)[number]}`;
export type MarginTop = `mt-${(typeof baseValues)[number]}`;
export type MarginBottom = `mb-${(typeof baseValues)[number]}`;
export type MarginLeft = `ml-${(typeof baseValues)[number]}`;
export type MarginRight = `mr-${(typeof baseValues)[number]}`;

// sm: prefix types
export type MarginAllLarge = `sm:m-${(typeof baseValues)[number]}`;
export type MarginXLarge = `sm:mx-${(typeof baseValues)[number]}`;
export type MarginYLarge = `sm:my-${(typeof baseValues)[number]}`;
export type MarginTopLarge = `sm:mt-${(typeof baseValues)[number]}`;
export type MarginBottomLarge = `sm:mb-${(typeof baseValues)[number]}`;
export type MarginLeftLarge = `sm:ml-${(typeof baseValues)[number]}`;
export type MarginRightLarge = `sm:mr-${(typeof baseValues)[number]}`;

// md: prefix types
export type MarginAllMedium = `md:m-${(typeof baseValues)[number]}`;
export type MarginXMedium = `md:mx-${(typeof baseValues)[number]}`;
export type MarginYMedium = `md:my-${(typeof baseValues)[number]}`;
export type MarginTopMedium = `md:mt-${(typeof baseValues)[number]}`;
export type MarginBottomMedium = `md:mb-${(typeof baseValues)[number]}`;
export type MarginLeftMedium = `md:ml-${(typeof baseValues)[number]}`;
export type MarginRightMedium = `md:mr-${(typeof baseValues)[number]}`;

const fractionValues = [
  { value: '50%', classSuffix: '1/2' },
  { value: '33.33%', classSuffix: '1/3' },
  { value: '66.67%', classSuffix: '2/3' },
  { value: '25%', classSuffix: '1/4' },
  { value: '75%', classSuffix: '3/4' },
  { value: '20%', classSuffix: '1/5' },
  { value: '40%', classSuffix: '2/5' },
  { value: '60%', classSuffix: '3/5' },
  { value: '80%', classSuffix: '4/5' },
  { value: '16.67%', classSuffix: '1/6' },
  { value: '83.33%', classSuffix: '5/6' },
];

const directions = [
  { key: 'm', label: 'margin' },
  { key: 'mt', label: 'margin top' },
  { key: 'mr', label: 'margin right' },
  { key: 'mb', label: 'margin bottom' },
  { key: 'ml', label: 'margin left' },
  { key: 'mx', label: 'margin left and right' },
  { key: 'my', label: 'margin top and bottom' },
];

function generateMarginObjects(prefix = '') {
  const prefixClass = prefix ? `${prefix}:` : '';
  const titlePrefix = prefix ? `for Large Screen` : '';

  const items = [];

  // base values
  for (const dir of directions) {
    for (const val of baseValues) {
      items.push({
        value: val,
        class: `${prefixClass}${dir.key}-${val}`,
        title: `${dir.label} ${val} ${titlePrefix}`.trim(),
      });
    }
  }

  // fractional values
  for (const dir of directions) {
    for (const frac of fractionValues) {
      items.push({
        value: frac.value,
        class: `${prefixClass}${dir.key}-${frac.classSuffix}`,
        title: `${dir.label} ${frac.value} ${titlePrefix}`.trim(),
      });
    }
  }

  return items;
}

export const objectMargins = [
  ...generateMarginObjects(), // base (no prefix)
  ...generateMarginObjects('sm'), // sm: prefix
];
