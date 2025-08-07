import { useState } from 'react';
import Image from 'next/image';
import { getImgUrl } from '@/app/helpers/getImgUrl';

const shimmer = (w: number, h: number) => `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <rect width="${w}" height="${h}" fill="#f6f7f8"/>
    <rect id="r" width="${w}" height="${h}" fill="#eee"/>
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
  </svg>
`;

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

const CustomImage = ({
  link = '',
  imgFile,
  className = '',
  width = 100,
  height = 100,
  alt = 'Image',
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  priority = false,
  limitAlt = 50,
}: {
  link?: string;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  imgFile?: FileType;
  priority?: boolean;
  limitAlt?: number;
}) => {
  const [hasError, setHasError] = useState(false);

  let imgSrc = link;
  if (imgFile) {
    imgSrc = getImgUrl({
      id: `${imgFile?.path ?? imgFile?.id}`,
      height,
      width,
    });
  }

  const truncatedAlt = alt.slice(0, limitAlt);

  return (
    <>
      {!hasError && imgSrc ? (
        <Image
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          quality={quality}
          placeholder={width && height > 40 && placeholder ? placeholder : 'empty'}
          blurDataURL={
            blurDataURL || `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`
          }
          priority={priority}
          onError={() => setHasError(true)}
        />
      ) : (
        <span
          className={`flex items-center justify-center text-center  text-xs font-semibold text-gray-700 dark:text-white ${className}`}
          style={{ width, height }}
        >
          {truncatedAlt}
        </span>
      )}
    </>
  );
};

export default CustomImage;
