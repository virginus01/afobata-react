import { extractAndFormatNumbers } from '@/app/helpers/extractAndFormatNumbers';
export function convertCommaToArray(cleanedNumbers: string, clean = true): string[] {
  let numbersArray = cleanedNumbers;
  if (clean) {
    numbersArray = extractAndFormatNumbers(cleanedNumbers, ', ');
  }
  const finalNumbersArray = numbersArray
    .split(',')
    .map((num) => num.trim())
    .filter((num) => num.length > 0);
  return finalNumbersArray;
}
