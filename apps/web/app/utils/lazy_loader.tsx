// Persistent component cache
const componentCache = new Map<string, any>();

// Async loader with cache
export const loadComponentAsync = async (
  componentName: string,
  importFn: () => Promise<any>,
): Promise<any | null> => {
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName);
  }

  try {
    const component = await importFn();
    const defaultExport = component?.default || component;
    componentCache.set(componentName, defaultExport);
    return defaultExport;
  } catch (error) {
    console.error(`Failed to load component "${componentName}":`, error);
    return null;
  }
};
