export function removeUnserializable(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeUnserializable);
  } else if (obj && typeof obj === 'object') {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      const value = obj[key];
      if (
        typeof value !== 'function' &&
        typeof value !== 'symbol' &&
        typeof value !== 'undefined'
      ) {
        newObj[key] = removeUnserializable(value);
      }
    }
    return newObj;
  }
  return obj;
}
