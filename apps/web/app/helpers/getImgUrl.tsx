import { isNull } from '@/app/helpers/isNull';

export function getImgUrl({
  id,
  height,
  width,
  ext = 'webp',
}: {
  id: string;
  width: number;
  height: number;
  ext?: string;
}): string {
  if (isNull(id)) return '';
  return `/api/image?id=${id}&width=${width}&height=${height}&ext=${ext}`;
}
