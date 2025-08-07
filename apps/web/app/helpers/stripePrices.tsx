export const stripePrices = (str: string): string => {
  if (typeof str !== 'string') {
    return '';
  }
  const pricePattern = / - \d{1,3}(,\d{3})* Naira/g;
  return str.replace(pricePattern, '');
};
