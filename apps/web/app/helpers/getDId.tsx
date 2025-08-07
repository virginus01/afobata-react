import { isNull } from '@/app/helpers/isNull';

export const getDId = ({
  userId,
  brandId,
  tag = '',
}: {
  userId: string;
  brandId: string;
  tag?: 'U' | 'B' | '';
}): string => {
  if ([isNull(userId), isNull(brandId)].includes(true)) return '';
  const id = `${tag}${userId}${brandId}`;
  return id;
};
