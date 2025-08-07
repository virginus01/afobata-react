export function getAddonValue(addons: AddonType[], tag: string) {
  try {
    const [data]: any = addons?.filter((addon: AddonType) => addon.id === tag || addon.tag === tag);
    return data?.value || '0';
  } catch (error) {
    console.error(error);
    return '0';
  }
}
