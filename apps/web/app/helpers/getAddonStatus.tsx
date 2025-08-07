import { isNull } from '@/app/helpers/isNull';
export function getAddonStatus(addons: AddonType[], tag: string) {
  try {
    let data: any = { available: false };

    [data] = addons?.filter((addon: AddonType) => addon.id === tag || addon.tag === tag);

    if (isNull(data)) {
      return false;
    }

    return isNull(data.available) ? false : true;
  } catch (error) {
    console.error('getAddonStatus Error:', error);
    return false;
  }
}
