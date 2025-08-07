import { NextRequest, NextResponse } from 'next/server';
import { ipAddress } from '@vercel/functions';

// Stores
const blockedIps = new Map<string, number>(); // IP -> unblock timestamp
const rateLimits = new Map<string, { count: number; reset: number }>();

const LONG_BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SHORT_BLOCK_DURATION = 60 * 1000; // 1 minute

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 50;

const BLOCKED_IP_PREFIXES = ['114.119.13', '216.244.66', '3.83.185'];
const BLOCKED_CIDRS = ['114.119.139.0/24', '216.244.64.0/19', '3.0.0.0/9', '3.80.0.0/12'];

const SUSPICIOUS_PATH_PARTS = [
  'wp-content',
  '.php',
  'xmlrpc',
  'wp-includes',
  '.env',
  '.sql',
  '.git',
];

// --- Helpers ---
function blockIp(ip: string, duration: number) {
  blockedIps.set(ip, Date.now() + duration);
}

function isBlocked(ip: string) {
  const until = blockedIps.get(ip);
  if (!until) return false;
  if (Date.now() > until) {
    blockedIps.delete(ip);
    return false;
  }
  return true;
}

function ipToLong(ip: string) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

function isInCidr(ip: string, cidr: string) {
  const [range, bits] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  return (ipToLong(ip) & mask) === (ipToLong(range) & mask);
}

// --- Middleware ---
export async function rateLimitMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') || ipAddress(request) || 'unknown';

  if (isBlocked(ip)) {
    console.warn(`Blocked request from ${ip} to ${pathname}`);
    return new NextResponse('Your IP is temporarily blocked.', { status: 403 });
  }

  // 24h block for bad CIDRs or suspicious path
  if (
    BLOCKED_IP_PREFIXES.some((prefix) => ip.startsWith(prefix)) ||
    BLOCKED_CIDRS.some((cidr) => isInCidr(ip, cidr)) ||
    SUSPICIOUS_PATH_PARTS.some((part) => pathname.toLowerCase().includes(part))
  ) {
    blockIp(ip, LONG_BLOCK_DURATION);
    console.warn(`Blocking IP ${ip} for suspicious activity on path ${pathname}`);
    return new NextResponse('Your IP has been blocked for 24 hours due to suspicious activity.', {
      status: 403,
    });
  }

  // Rate limit for /api/ routes
  if (pathname.startsWith('/api/')) {
    const now = Date.now();
    const entry = rateLimits.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW };

    if (entry.reset < now) {
      // Reset the window
      rateLimits.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    } else {
      entry.count++;
      if (entry.count > MAX_REQUESTS_PER_MINUTE) {
        blockIp(ip, SHORT_BLOCK_DURATION); // block for 1 minute
        return new NextResponse('Too many requests. IP temporarily blocked for 1 minute.', {
          status: 429,
        });
      }
      rateLimits.set(ip, entry);
    }
  }

  return;
}
