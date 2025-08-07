function deepMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export function deepMergeAll(objects: any[]) {
  return objects.reduce((acc, obj) => deepMerge(acc, obj), {});
}
