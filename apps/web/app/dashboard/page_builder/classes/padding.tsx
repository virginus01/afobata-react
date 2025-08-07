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

// Base padding types
export type PaddingAll = `p-${(typeof baseValues)[number]}`;
export type PaddingX = `px-${(typeof baseValues)[number]}`;
export type PaddingY = `py-${(typeof baseValues)[number]}`;
export type PaddingTop = `pt-${(typeof baseValues)[number]}`;
export type PaddingBottom = `pb-${(typeof baseValues)[number]}`;
export type PaddingLeft = `pl-${(typeof baseValues)[number]}`;
export type PaddingRight = `pr-${(typeof baseValues)[number]}`;

// sm: prefix types
export type PaddingAllLarge = `sm:p-${(typeof baseValues)[number]}`;
export type PaddingXLarge = `sm:px-${(typeof baseValues)[number]}`;
export type PaddingYLarge = `sm:py-${(typeof baseValues)[number]}`;
export type PaddingTopLarge = `sm:pt-${(typeof baseValues)[number]}`;
export type PaddingBottomLarge = `sm:pb-${(typeof baseValues)[number]}`;
export type PaddingLeftLarge = `sm:pl-${(typeof baseValues)[number]}`;
export type PaddingRightLarge = `sm:pr-${(typeof baseValues)[number]}`;

// md: prefix types
export type PaddingAllMedium = `md:p-${(typeof baseValues)[number]}`;
export type PaddingXMedium = `md:px-${(typeof baseValues)[number]}`;
export type PaddingYMedium = `md:py-${(typeof baseValues)[number]}`;
export type PaddingTopMedium = `md:pt-${(typeof baseValues)[number]}`;
export type PaddingBottomMedium = `md:pb-${(typeof baseValues)[number]}`;
export type PaddingLeftMedium = `md:pl-${(typeof baseValues)[number]}`;
export type PaddingRightMedium = `md:pr-${(typeof baseValues)[number]}`;

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
  { key: 'p', label: 'padding' },
  { key: 'pt', label: 'padding top' },
  { key: 'pr', label: 'padding right' },
  { key: 'pb', label: 'padding bottom' },
  { key: 'pl', label: 'padding left' },
  { key: 'px', label: 'padding left and right' },
  { key: 'py', label: 'padding top and bottom' },
];

function generatePaddingObjects(prefix = '') {
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

export const objectPaddings = [
  ...generatePaddingObjects(), // base (no prefix)
  ...generatePaddingObjects('sm'), // sm: prefix
];
