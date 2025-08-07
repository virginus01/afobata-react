import { ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import Image from 'next/image';
import { getImgUrl } from '@/app/helpers/getImgUrl';

interface CustomHeaderProps {
  color?: string;
  children?: ReactNode;
  className?: string;
  silverImage?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  color = '#F3F4F6',
  children,
  className,
  silverImage,
}) => {
  return (
    <>
      {silverImage ? (
        <>
          <div className="relative w-full h-48">
            <Image
              src={getImgUrl({
                id: silverImage ?? '',
                height: 500,
                width: 500,
              })}
              alt={''}
              objectFit="fill"
              className="z-[-1] h-48 w-full"
              width={500}
              height={500}
              style={{
                filter: 'brightness(0.8)',
              }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
            {/* Header content overlaying the image */}
            <div className="absolute inset-0  text-white">{children}</div>
          </div>
        </>
      ) : Capacitor.isNativePlatform() ? (
        <>{children}</>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default CustomHeader;
