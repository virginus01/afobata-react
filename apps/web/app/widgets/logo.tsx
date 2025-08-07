'use client';
import React from 'react';
import Link from 'next/link';
import CustomImage from '@/app/widgets/optimize_image';
import { Brand } from '@/app/models/Brand';

interface LogoProps {
  logoClass?: string;
  link?: string;
  imageUrl?: string;
  alt?: string;
  brand: Brand;
  plateform?: string;
}

export const Logo: React.FC<LogoProps> = ({
  logoClass = 'w-20 h-10',
  link = '/',
  imageUrl = 'logo.png',
  alt = '',
  brand,
  plateform = 'web',
}) => {
  return (
    <Link href={`${plateform === 'web' ? link : '#'}`}>
      <CustomImage height={20} width={100} imgFile={brand.logo ?? {}} alt={alt ?? brand.name} />
    </Link>
  );
};
