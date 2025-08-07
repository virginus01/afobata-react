import { isNull } from '@/app/helpers/isNull';

export function getAddonValue(addons: AddonType[], tag: string) {
  try {
    const [data]: any = addons?.filter((addon: AddonType) => addon.id === tag || addon.tag === tag);
    return data?.value || '0';
  } catch (error) {
    console.error(error);
    return '0';
  }
}

export function getAvailableAddonsStatus(addons: AddonType[]) {
  return addons.reduce<Record<string, AddonType>>((acc, addon) => {
    if (addon.available) {
      acc[`${addon?.id!}_status`] = addon?.available! as any;
    }
    return acc;
  }, {});
}

export function getAvailableAddonsValues(addons: AddonType[]) {
  return addons.reduce<Record<string, AddonType>>((acc, addon) => {
    if (addon.value !== 0) {
      acc[`${addon?.id!}`] = addon.value as any;
    }
    return acc;
  }, {});
}

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
