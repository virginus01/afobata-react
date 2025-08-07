import { isNull } from '@/app/helpers/isNull';

export const getUserId = ({ userId, brandId }: { userId: string; brandId: string }): string => {
  if ([isNull(userId), isNull(brandId)].includes(true)) return '';
  const id = `${userId}${brandId}`;
  return id;
};
