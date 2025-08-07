export function mergeMatchingKeys<T extends object>(
  base: T,
  source: Partial<Record<keyof T, any>>,
): T {
  return Object.keys(base).reduce(
    (acc, key) => {
      if (key in source) {
        (acc as any)[key] = source[key as keyof T];
      }
      return acc;
    },
    { ...base },
  );
}
