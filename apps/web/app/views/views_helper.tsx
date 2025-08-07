'use server';
import { cache } from 'react';
import { api_get_views } from '@/src/constants';
import { Brand } from '@/app/models/Brand';
import { Data } from '@/app/models/Data';
import { Metadata } from 'next';
import { isNull } from '@/app/helpers/isNull';
import { getImgUrl } from '@/app/helpers/getImgUrl';
import { getGlobalCacheLink } from '@/helpers/getGlobalCacheLink';
import { modHeaders } from '@/helpers/modHeaders';
import { baseUrl } from '@/helpers/baseUrl';

interface ViewData {
  brand: any;
  auth: any;
  seg1: string;
  data: any;
  rendererData: any;
  pageEssentials: any;
}

interface GetViewDataParams {
  params: string[];
  table?: string;
  renderPage?: string;
  conditions?: any[];
  auth?: AuthModel;
  siteInfo?: Brand;
  slug?: string;
}

export const pageView = cache(
  async ({ slug, table, siteInfo }: GetViewDataParams): Promise<ViewData> => {
    const url = await api_get_views({ table, slug });
    const finalUrl = await baseUrl(url ?? '');

    let data = { brand: {}, auth: {}, seg1: {}, data: {}, rendererData: {}, pageEssentials: {} };

    try {
      const gcsLink = await getGlobalCacheLink({ slug: slug ?? '' });

      if (gcsLink) {
        const resGC = await fetch(gcsLink, {
          method: 'GET',
          cache: 'force-cache',
          headers: await modHeaders('get', false, {} as any, false),
        });

        if (resGC.ok) {
          const result = await resGC.text();

          if (!isNull(result)) {
            const jsonData = JSON.parse(result);
            data = jsonData ?? {};
            console.info('✅ Hit Cache CDN: ', gcsLink);
            return data as any;
          } else {
            console.warn('⚠️ Global Cache fetch returned null:', gcsLink);
          }
        } else {
          console.warn('⚠️ Global Cache fetch failed:', resGC.statusText, gcsLink);
        }
      }
    } catch (error) {
      console.error('Global Caching error: ', error);
    }

    const res = await fetch(finalUrl, {
      method: 'GET',
      credentials: 'include',
      cache: 'force-cache',
      headers: await modHeaders('get', false, {} as any, false),
      next: {
        revalidate: process.env.NODE_ENV === 'production' ? 3600 : 1,
        tags: [slug ?? '', 'all'],
      },
    });

    if (!res.ok) {
      console.error(res.statusText);
    }

    const result = await res.json();
    data = result?.data ?? {};

    return data as any;
  },
);

interface BuildMetadataOptions {
  data?: Data;
  brand?: Brand;
  seg1?: string;
  includeOpenGraph?: boolean;
  forceAwaitingMeta?: boolean;
}

interface BuildMetadataOptions {
  data?: Data;
  brand?: Brand;
  seg1?: string;
  includeOpenGraph?: boolean;
  forceAwaitingMeta?: boolean;
}

// Apple icon sizes for different devices
const APPLE_ICON_SIZES = [
  { width: 57, height: 57 }, // iPhone non-retina
  { width: 60, height: 60 }, // iPhone iOS 7+
  { width: 72, height: 72 }, // iPad non-retina
  { width: 76, height: 76 }, // iPad iOS 7+
  { width: 114, height: 114 }, // iPhone retina
  { width: 120, height: 120 }, // iPhone retina iOS 7+
  { width: 144, height: 144 }, // iPad retina
  { width: 152, height: 152 }, // iPad retina iOS 7+
  { width: 180, height: 180 }, // iPhone 6 Plus
];

// Standard favicon sizes
const FAVICON_SIZES = [
  { width: 16, height: 16 },
  { width: 32, height: 32 },
  { width: 48, height: 48 },
  { width: 64, height: 64 },
  { width: 96, height: 96 },
  { width: 128, height: 128 },
  { width: 192, height: 192 },
  { width: 256, height: 256 },
];

function generateAppleIcons(iconId: string) {
  return APPLE_ICON_SIZES.map((size) => ({
    url: getImgUrl({
      id: iconId,
      height: size.height,
      width: size.width,
      ext: 'png',
    }),
    sizes: `${size.width}x${size.height}`,
    type: 'image/png',
  }));
}

function generateFavicons(iconId: string) {
  return FAVICON_SIZES.map((size) => ({
    url: getImgUrl({
      id: iconId,
      height: size.height,
      width: size.width,
      ext: 'png',
    }),
    sizes: `${size.width}x${size.height}`,
    type: 'image/png',
  }));
}

function generateOtherIcons(iconId: string) {
  return [
    // Microsoft tile icon
    {
      url: getImgUrl({
        id: iconId,
        height: 144,
        width: 144,
        ext: 'png',
      }),
      sizes: '144x144',
      type: 'image/png',
    },
    // Android Chrome icon
    {
      url: getImgUrl({
        id: iconId,
        height: 192,
        width: 192,
        ext: 'png',
      }),
      sizes: '192x192',
      type: 'image/png',
    },
    // Large Android Chrome icon
    {
      url: getImgUrl({
        id: iconId,
        height: 512,
        width: 512,
        ext: 'png',
      }),
      sizes: '512x512',
      type: 'image/png',
    },
  ];
}

export async function buildDefaultMetadata({
  data = {} as Data,
  brand = {} as Brand,
  seg1 = 'home',
  includeOpenGraph = true,
  forceAwaitingMeta = false,
}: BuildMetadataOptions): Promise<Metadata> {
  const brandTitle = brand?.name || 'Our Platform';

  const defaultTitle = data.title ?? brand?.name ?? 'Page';
  const defaultDescription = `Welcome to ${brandTitle}.`;

  const metadata: Metadata = {
    title: defaultTitle,
    description: defaultDescription,
    authors: [{ name: brand?.name || 'Site Owner' }],
    creator: brand?.name || 'Site Owner',
    publisher: brand?.name || 'Site Owner',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'),
  };

  // Add icons if brand has icon or logo
  const iconId = brand?.icon?.id;
  const logoId = brand?.logo?.id;
  const hasValidIcon = iconId && iconId.trim() !== '';
  const hasValidLogo = logoId && logoId.trim() !== '';

  if (hasValidIcon || hasValidLogo) {
    const selectedIconId = hasValidIcon ? iconId : logoId;

    // Add Apple touch icons
    metadata.appleWebApp = {
      title: brand?.name || 'App',
      statusBarStyle: 'default',
      capable: true,
    };

    // Add various icon types
    metadata.icons = {
      // Standard favicons
      icon: generateFavicons(selectedIconId ?? ''),

      // Apple touch icons
      apple: generateAppleIcons(selectedIconId ?? ''),

      // Other icons (Microsoft, Android, etc.)
      other: generateOtherIcons(selectedIconId ?? ''),
    };

    // Add specific Apple icon sizes as individual entries
    metadata.icons.apple = [
      ...generateAppleIcons(selectedIconId ?? ''),
      // Add specific Apple startup images if needed
      {
        url: getImgUrl({
          id: selectedIconId ?? '',
          height: 180,
          width: 180,
          ext: 'png',
        }),
        sizes: '180x180',
        type: 'image/png',
      },
    ];

    // Add Microsoft tile configuration
    metadata.other = {
      'msapplication-TileColor': '#F3F4F6',
      'msapplication-TileImage': getImgUrl({
        id: selectedIconId ?? '',
        height: 144,
        width: 144,
        ext: 'png',
      }),
      'msapplication-config': '/browserconfig.xml',
    };
  }

  const shouldUseOpenGraph = !forceAwaitingMeta && !isNull(data);

  if (shouldUseOpenGraph && includeOpenGraph) {
    metadata.openGraph = {
      title: metadata.title as string,
      description: metadata.description as string,
      siteName: brand?.name || 'Website',
      type: 'website',
      locale: 'en_US',
      images:
        data?.image && data?.image?.publicUrl
          ? [
              {
                url: data.image.publicUrl,
                alt: data.title ?? brand.name,
              },
            ]
          : undefined,
    };

    metadata.twitter = {
      card: 'summary_large_image',
      title: metadata.title as string,
      description: metadata.description as string,
      creator: brand?.name ? `@${brand.name.replace(/\s+/g, '').toLowerCase()}` : undefined,
      images: data?.image && data?.image?.publicUrl ? [data.image.publicUrl] : undefined,
    };

    metadata.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    };
  } else {
    metadata.title = brand?.name ? `Welcome to ${brand.name}` : 'Welcome';
    metadata.description = brand?.name
      ? `Welcome to ${brand.name}. We're setting up your experience.`
      : "Welcome! We're setting up your experience.";
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}
