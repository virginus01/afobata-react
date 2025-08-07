import type { MetadataRoute } from 'next';
import { getImgUrl } from '@/app/helpers/getImgUrl';
import { isNull } from '@/app/helpers/isNull';
import { getEssentials } from '@/app/helpers/getEssentials';

// Standard icon sizes for PWA
const ICON_SIZES = [
  { width: 72, height: 72 },
  { width: 96, height: 96 },
  { width: 180, height: 180 },
  { width: 128, height: 128 },
  { width: 144, height: 144 },
  { width: 152, height: 152 },
  { width: 192, height: 192 },
  { width: 384, height: 384 },
  { width: 512, height: 512 },
];

function generateIcons(iconId: string, usePng: boolean = true) {
  return ICON_SIZES.map((size) => ({
    src: getImgUrl({
      id: iconId,
      height: size.height,
      width: size.width,
      ext: usePng ? 'png' : 'webp',
    }),
    sizes: `${size.width}x${size.height}`,
    type: usePng ? 'image/png' : 'image/webp',
  }));
}

function fallbackManifest(): MetadataRoute.Manifest {
  return {
    name: 'Default App',
    short_name: 'Default App',
    description: 'All in one solution in one place',
    start_url: '/dashboard?platform=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#F3F4F6',
    theme_color: '#F3F4F6',
    icons: generateIcons('chrome.png'),
  };
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  try {
    const { brand } = await getEssentials();

    if (isNull(brand)) {
      return fallbackManifest();
    }

    const iconId = brand?.icon?.id;
    const hasValidIcon = iconId && iconId.trim() !== '';

    return {
      name: brand.name,
      short_name: brand.name,
      description: 'All in one solution in one place',
      start_url: `/${brand.id ?? 'none'}/dashboard?platform=pwa`,
      scope: '/',
      display: 'standalone',
      background_color: '#F3F4F6',
      theme_color: '#F3F4F6',
      icons: hasValidIcon ? generateIcons(iconId) : generateIcons('chrome.png'),
    };
  } catch (error) {
    console.error('Failed to generate manifest:', error);
    return fallbackManifest();
  }
}