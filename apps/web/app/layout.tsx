//"use cache";
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/app/globals.css';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { GlobalEssentialProvider } from '@/app/contexts/global_essential_context';
import { getEssentials } from '@/app/helpers/getEssentials';
import { hexToHSL } from '@/app/helpers/hexToHSL';
import { colorKeys, defaultColors } from '@/app/src/constants';
import { BaseContextProvider } from '@/app/contexts/base_context';
import { CartProvider } from '@/app/contexts/cart_context';
import { StatusBarInit } from '@/app/components/statusbarInit';
import { DynamicContextProvider } from '@/app/contexts/dynamic_context';
import { camelToKebab } from '@/app/helpers/text';

const dmSans = localFont({
  src: [
    {
      path: '/fonts/dm-sans-v16-latin-300.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '/fonts/dm-sans-v16-latin-regular.woff2',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
});

const briston = localFont({
  src: '/fonts/Briston_Regular.ttf',
  variable: '--font-briston',
  display: 'swap',
});

function mergeTranslations(defaultMessages: any, brandTranslations: any): any {
  if (!brandTranslations) return defaultMessages;

  function deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] &&
          typeof target[key] === 'object'
        ) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          // Brand translation overrides default
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  return deepMerge(defaultMessages, brandTranslations);
}

// Optional: Add validation
function validateTranslationStructure(translations: any): boolean {
  try {
    // Add your validation logic here
    return typeof translations === 'object' && translations !== null;
  } catch {
    return false;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Plateform',
    description: `Welcome to our platform`,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale: any = await getLocale();
  const { brand } = await getEssentials();
  const defaultMessages = await getMessages();

  const resolvedColors = Object.fromEntries(
    colorKeys.map((key) => [
      `--${camelToKebab(key)}`,
      hexToHSL(brand?.colors?.[key] ?? '') || defaultColors[key],
    ]),
  );

  let mergedMessages = defaultMessages;

  if (brand?.translations && validateTranslationStructure(brand.translations)) {
    mergedMessages = mergeTranslations(defaultMessages, brand.translations[locale ?? 'en']);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <GlobalEssentialProvider siteInfo={brand as any} messages={mergedMessages}>
        <head>
          <meta
            name="google-site-verification"
            content="oobKfCYoHNF-mF-PqL9n3iub7eHu1JTqQz8zpgz1GeM"
          />
          <meta name="theme-color" content="#F3F4F6" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
          />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="my site" />
          <meta name="csrf-token" content={''} />
        </head>
        <body
          className={`${dmSans.className} ${dmSans.variable} ${briston.variable} text-xs sm:text-sm md:text-sm`}
          style={{
            ...resolvedColors,
          }}
        >
          <DynamicContextProvider>
            <BaseContextProvider>
              <CartProvider>
                <NextIntlClientProvider messages={mergedMessages}>
                  <div className="brand-bg brand-text "> {children}</div>
                </NextIntlClientProvider>
              </CartProvider>
            </BaseContextProvider>
          </DynamicContextProvider>
          <Toaster
            position="bottom-right"
            className="text-xs"
            visibleToasts={1}
            richColors={true}
          />
        </body>
      </GlobalEssentialProvider>
    </html>
  );
}
