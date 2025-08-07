import { isNull } from '@/app/helpers/isNull';

export const extractServiceData = (serviceSettings: any, brandKey: string): ServiceSettings => {
  try {
    if (!isNull(serviceSettings)) {
      const data = serviceSettings.find((p: any) => p[brandKey]);
      return data?.[brandKey] || {};
    } else {
      return {};
    }
  } catch (error) {
    console.error(error);
    return {};
  }
};
