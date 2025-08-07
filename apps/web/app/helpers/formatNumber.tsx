export const formatNumber = (value: number): string => {
  // Handle numbers less than 1000
  if (value < 1000) {
    return value.toString();
  }

  // Handle thousands (K)
  if (value < 1000000) {
    const formattedValue = (value / 1000).toFixed(1).replace(/\.?0+$/, '');
    return `${formattedValue}K`;
  }

  // Handle millions (M)
  if (value < 1000000000) {
    const formattedValue = (value / 1000000).toFixed(1).replace(/\.?0+$/, '');
    return `${formattedValue}M`;
  }

  // Handle billions (B) if needed
  if (value < 1000000000000) {
    const formattedValue = (value / 1000000000).toFixed(1).replace(/\.?0+$/, '');
    return `${formattedValue}B`;
  }

  // Fallback for extremely large numbers
  return value.toString();
};
