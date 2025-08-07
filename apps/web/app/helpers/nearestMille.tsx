export function nearestThousandBelow(number: number) {
  return Math.floor(number / 1000) * 1000;
}

export function nearestMille(number: number) {
  return Math.floor(number / 1000);
}
