import { NextRequest } from 'next/server';

interface ParsedUrlInfo {
  hostname: string;
  fullHostName?: string;
  subdomain: string | null;
  firstParam: string | null;
  fullCleanedUrl: string;
}

function removePort(url: string) {
  // Use a regular expression to match the domain and strip the port
  return url.replace(/(:\d+)(?=\/|$)/, '');
}

/**
 * Parses x-forwarded-host header to extract hostname, subdomain, and first path parameter.
 * Strips protocols (http://, https://), 'www', 'api' prefixes, and handles any subdomain.
 * @param headersList Headers object containing x-forwarded-host header
 * @returns Object containing hostname, subdomain, firstParam, and cleaned full URL
 */
export function parseUrl(headersList: Headers, request?: NextRequest): ParsedUrlInfo {
  try {
    let url = headersList.get('x-url') || headersList.get('url') || ''; // Get the x-url header
    let host = headersList.get('host') || headersList.get('x-forwarded-host') || ''; // Get the host header

    if (!url) {
      if (request) {
        const { pathname } = request.nextUrl;
        const protocol =
          (host &&
            (host.includes('localhost') ||
              host.includes('127.0.0.1') ||
              host.includes('172.20.10.3') ||
              host.includes('local'))) ||
          process.env.NODE_ENV === 'development'
            ? 'http://'
            : 'https://';

        const searchParams = request.nextUrl.search;
        url = `${protocol}${host}${pathname}${searchParams}`;
      } else {
        const p = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
        url = p + host;
      }
    }

    const urlPath = new URL(url); // This will now be safe with a valid URL string

    // Strip protocols (http://, https://)
    url = url.replace(/^https?:\/\//, '');

    // Remove port if any
    url = removePort(url);

    // Remove "www" and "api" if they exist at the beginning of the host
    url = url.replace(/^www\./, '').replace(/^api\./, '');

    // Split the host into hostname and path parts
    const [fullHost, ...pathParts] = url.split('/');
    const cleanHostname = fullHost.split(':')[0]; // Remove port if any
    const cleanHost = host.split(':')[0]; // Remove port if any

    let subdomain: string | null = null;
    let firstParam: string | null = null;

    // Extract subdomain if the hostname has more than 2 parts (e.g., sub.example.com)
    const hostParts = cleanHost.split('.');

    if (hostParts.length > 2) {
      // Treat the first part as the subdomain, unless it's an IP address
      subdomain = hostParts[0] || null;
    }

    // Remove 'api' and 'favicon.ico' from the path parts
    const cleanedPathParts = pathParts.filter((part) => part !== 'api' && part !== 'favicon.ico');

    // Extract the first path parameter after cleaning
    if (cleanedPathParts.length > 0 && cleanedPathParts[0]) {
      firstParam = cleanedPathParts[0];
    }

    // Reconstruct the cleaned full URL (without 'api' and 'favicon.ico')
    const fullCleanedUrl = [cleanHostname, ...cleanedPathParts].join('/');

    const fullHostName = urlPath.hostname + (urlPath.port ? `:${urlPath.port}` : '');

    return {
      hostname: cleanHost,
      fullHostName,
      subdomain,
      firstParam,
      fullCleanedUrl,
    };
  } catch (error) {
    console.error('Error in parseUrl:', error);
    return {
      hostname: '',
      fullHostName: '',
      subdomain: '',
      firstParam: '',
      fullCleanedUrl: '',
    };
  }
}
