import { isNull } from '@/app/helpers/isNull';

export function beforeUpdate(updateData: any, strict = false) {
  try {
    let uData: any = {};
    for (const key in updateData) {
      const value = updateData[key];
      if (!isNull(value)) {
        uData[key] = value;
      } else {
        if (!strict) {
          uData[key] = value;
        }
      }
    }
    delete uData._id;
    delete uData.createdFrom;
    delete uData.lastUpdatedFrom;
    delete uData.mode;
    delete uData.createdAt;
    delete uData.updatedAt;
    return uData;
  } catch (error) {
    console.error(error);
    return updateData;
  }
}
