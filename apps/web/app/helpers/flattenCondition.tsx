export function flattenCondition(obj: any): string {
  const parts: string[] = [];

  function recurse(value: any) {
    if (Array.isArray(value)) {
      value.forEach(recurse);
    } else if (value !== null && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        const cleanedKey = key.startsWith('$') ? key.slice(1) : key;
        parts.push(cleanedKey);
        recurse(value[key]);
      }
    } else {
      parts.push(String(value));
    }
  }

  recurse(obj);
  return parts.join('_');
}
