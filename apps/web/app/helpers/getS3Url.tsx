import { isNull } from '@/app/helpers/isNull';

export const getS3Url = (path: any) => {
  if (isNull(path) || path == 'undefined/undefined' || path == '/') {
    const s3FileUrl = `/images/placeholder.png`;
    return s3FileUrl;
  }
  const s3FileUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${path}`;
  return s3FileUrl;
};
