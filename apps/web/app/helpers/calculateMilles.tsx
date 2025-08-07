export function calculateMilles(value: string) {
  const number = parseFloat(value);
  const milles = Math.floor(number / 1000);
  return milles;
}
