export function extractAndFormatNumbers(
  text: string,
  separator = ', ',
  countryCode = '234',
): string {
  const regex = /\b(\d{11}|\d{13})\b/g;
  const matches = text.match(regex) || [];
  const uniqueMatches = Array.from(new Set(matches)).map((num) => {
    if (num.length === 11) {
      return `${countryCode}${num.substring(1)}`;
    }
    return num;
  });
  return uniqueMatches.join(separator);
}
