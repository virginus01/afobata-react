export function findMissingFields(obj: Record<string, any>): string | null {
  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
      return key;
    }
  }
  return null;
}
