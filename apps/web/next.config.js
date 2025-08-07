/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    // logging: {
    //     fetches: {
    //         fullUrl: true,
    //     },
    // },
    async headers() {
        return [
            // Cache all non-API routes at root level for 60 seconds
            {
                source: '/((?!api/).*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: process.env.NODE_ENV === 'development'
                            ? 'public, max-age=1' : 'public, max-age=60, stale-while-revalidate=60'
                    },
                ],
            },

            // Cache images aggressively (overrides root-level caching)
            {
                source: '/images/:all*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },

            // Cache manifest briefly (overrides root-level caching)
            {
                source: '/manifest.webmanifest',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: process.env.NODE_ENV === 'development'
                            ? 'public, max-age=0' : 'public, max-age=3600, stale-while-revalidate=60'
                    },
                ],
            },

            // Cache favicon for 1 day (overrides root-level caching)
            {
                source: '/favicon.ico',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, stale-while-revalidate=3600',
                    },
                ],
            },
        ];
    },
    reactStrictMode: true,
    images: {
        //unoptimized: true,
        domains: [
            'topingnow.s3.eu-north-1.amazonaws.com',
            'afobata.s3.eu-north-1.amazonaws.com',
            'upload.wikimedia.org',
            'localhost',
            '172.20.10.3',
            'topingnow.com',
            'lh5.googleusercontent.com',
            'streetviewpixels-pa.googleapis.com',
            'lh3.googleusercontent.com',
            'prnt.sc',
            'i.imgur.com',
            'afobata.com',
            'imgur.com',
            'via.placeholder.com',
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'date-fns',
            'lodash',
            'react-icons',
            'framer-motion',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            '@heroicons/react',
            '@tremor/react',
            'clsx',
            'classnames',
            'zod',
            'yup',
            'dexie',
            'swr',
            'tailwind-merge',
            'sonner',
            'cmdk',
            'bignumber.js',
        ],
    },
};

export default bundleAnalyzer(withNextIntl(nextConfig));