export function numToCur(amount: any, symbol: any) {
  const formattedPrice = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: symbol,
    minimumFractionDigits: 0, // Ensures no decimal points are displayed
    maximumFractionDigits: 0, // Ensures no decimal points are displayed
  }).format(amount);
  return formattedPrice;
}
