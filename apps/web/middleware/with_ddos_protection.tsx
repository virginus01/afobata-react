import { NextRequest, NextResponse } from 'next/server';
import { ipAddress } from '@vercel/functions';
import { invalid_response } from '@/app/helpers/invalid_response';

// In-memory store - could be replaced with Redis in production
const rateLimitStore = new Map<string, RateLimitEntry>();

// More detailed rate limit entry
interface RateLimitEntry {
  count: number; // Request count
  resetTime: number; // When the window resets
  consecutiveFailures: number; // Track suspicious behavior
  suspiciousScore: number; // Higher = more suspicious
  blockedUntil?: number; // Block time if applicable
  requestPattern?: {
    // Track request patterns
    timestamps: number[]; // Recent request timestamps
    urls: string[]; // Recent URLs accessed
  };
}

// Dynamic rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // Basic rate limiting
  standardWindow: 60 * 1000, // 1 minute
  maxRequestsPerMinute: 50, // Standard limit

  // Burst detection
  burstWindow: 10 * 1000, // 10 seconds
  maxBurstRequests: 20, // Max in burst window

  // Progressive penalties
  shortBlockDuration: 2 * 60 * 1000, // 2 minutes
  mediumBlockDuration: 10 * 60 * 1000, // 10 minutes
  longBlockDuration: 60 * 60 * 1000, // 1 hour

  // IP reputation
  maxConsecutiveFailures: 5, // Failures before penalty
  suspiciousThreshold: 100, // Score that triggers blocking

  // Pattern detection
  patternTrackingLimit: 20, // Max patterns to store

  // Cleanup
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
};

// Suspicious behavior flags
const SUSPICIOUS_PENALTIES = {
  consecutiveFailure: 20, // Points per 4xx/5xx response
  unusualUserAgent: 30, // Missing or suspicious UA
  knownMaliciousPatterns: 50, // Known attack signatures
  rapidSuccessiveRequests: 15, // Too many requests in short time
  highEntropyParams: 25, // Random-looking URL params
  rateLimitHit: 40, // Hit rate limit
};

// Known attack signatures (simplified)
const ATTACK_SIGNATURES = [
  /wp-login\.php/i, // WordPress login attempts
  /\.env/i, // Environment file probing
  /eval\(/i, // Code injection attempts
  /\/etc\/passwd/i, // Path traversal
  /select.*from/i, // SQL injection attempts
  /\<script\>/i, // XSS attempts
];

// Whitelist for trusted IPs/services (add your trusted IPs here)
const WHITELIST = new Set([
  '127.0.0.1',
  // Add your office IPs, monitoring services, etc.
]);

// Setup cleanup interval to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if ((!data.blockedUntil || data.blockedUntil < now) && data.resetTime < now) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_CONFIG.cleanupInterval);

/**
 * Generate a request fingerprint (beyond just IP)
 */
function generateRequestFingerprint(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || ipAddress(request) || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Create a fingerprint from multiple signals
  const fingerprint = `${ip}|${userAgent.substring(0, 100)}`;

  // Optional: Use a crypto hash for privacy
  // return hashFn('sha256').update(fingerprint).digest('hex');

  return fingerprint;
}

/**
 * Check for suspicious patterns in the request
 */
function detectSuspiciousPatterns(request: NextRequest): number {
  let suspiciousScore = 0;

  // Check user agent
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent || userAgent.length < 10) {
    suspiciousScore += SUSPICIOUS_PENALTIES.unusualUserAgent;
  }

  // Check for known attack signatures
  const url = request.url || '';
  for (const pattern of ATTACK_SIGNATURES) {
    if (pattern.test(url) || pattern.test(request.headers.get('referer') || '')) {
      suspiciousScore += SUSPICIOUS_PENALTIES.knownMaliciousPatterns;
      break;
    }
  }

  // Check for high entropy parameters (potential scanning)
  const urlObj = new URL(request.url);
  const paramLength = Array.from(urlObj.searchParams.entries()).length;
  if (paramLength > 10) {
    suspiciousScore += SUSPICIOUS_PENALTIES.highEntropyParams;
  }

  return suspiciousScore;
}

/**
 * Analyze request pattern for this client
 */
function analyzeRequestPattern(entry: RateLimitEntry, request: NextRequest): number {
  let suspiciousScore = 0;
  const now = Date.now();

  // Initialize pattern tracking if needed
  if (!entry.requestPattern) {
    entry.requestPattern = {
      timestamps: [],
      urls: [],
    };
  }

  // Add current request to patterns
  entry.requestPattern.timestamps.push(now);
  entry.requestPattern.urls.push(request.url);

  // Limit the size of tracking arrays
  if (entry.requestPattern.timestamps.length > RATE_LIMIT_CONFIG.patternTrackingLimit) {
    entry.requestPattern.timestamps.shift();
    entry.requestPattern.urls.shift();
  }

  // Check for burst patterns (many requests in short time)
  const recentTimestamps = entry.requestPattern.timestamps.filter(
    (ts) => now - ts < RATE_LIMIT_CONFIG.burstWindow,
  );

  if (recentTimestamps.length > RATE_LIMIT_CONFIG.maxBurstRequests) {
    suspiciousScore += SUSPICIOUS_PENALTIES.rapidSuccessiveRequests;
  }

  // Check for API scanning (accessing many different endpoints)
  const uniqueUrls = new Set(entry.requestPattern.urls).size;
  if (uniqueUrls > 10 && uniqueUrls === entry.requestPattern.urls.length) {
    suspiciousScore += SUSPICIOUS_PENALTIES.highEntropyParams;
  }

  return suspiciousScore;
}

/**
 * Determine appropriate blocking period based on suspicious score
 */
function getBlockDuration(suspiciousScore: number): number {
  if (suspiciousScore >= 200) {
    return RATE_LIMIT_CONFIG.longBlockDuration;
  } else if (suspiciousScore >= 100) {
    return RATE_LIMIT_CONFIG.mediumBlockDuration;
  }
  return RATE_LIMIT_CONFIG.shortBlockDuration;
}

/**
 * Main middleware for enhanced DDoS protection
 */
export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | undefined> {
  const now = Date.now();

  // Get client identifier (IP + potentially other signals)
  const clientId = generateRequestFingerprint(request);
  const ip = request.headers.get('x-forwarded-for') || ipAddress(request) || 'unknown';

  // Skip checks for whitelisted IPs
  if (WHITELIST.has(ip)) {
    return;
  }

  // Check if already blocked
  if (rateLimitStore.has(clientId)) {
    const entry = rateLimitStore.get(clientId)!;

    if (entry.blockedUntil && entry.blockedUntil > now) {
      const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      return invalid_response(
        `Too many requests. Please try again in ${remainingSeconds} seconds.`,
        429,
      ) as any;
    }
  }

  // Detect suspicious behavior
  const initialSuspiciousScore = detectSuspiciousPatterns(request);

  // Initialize or update rate limit entry
  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.standardWindow,
      consecutiveFailures: 0,
      suspiciousScore: initialSuspiciousScore,
    });
    return;
  }

  // Update existing entry
  const entry = rateLimitStore.get(clientId)!;

  // Reset if window expired
  if (entry.resetTime < now) {
    entry.count = 1;
    entry.resetTime = now + RATE_LIMIT_CONFIG.standardWindow;
    // Note: we don't reset suspicious score or consecutive failures
    // Those should persist longer than the rate window
    return;
  }

  // Check pattern-based suspicious behavior
  const patternScore = analyzeRequestPattern(entry, request);
  entry.suspiciousScore += patternScore;

  // Apply dynamic rate limiting based on suspicion level
  let effectiveRateLimit = RATE_LIMIT_CONFIG.maxRequestsPerMinute;

  // Reduce rate limit for suspicious clients
  if (entry.suspiciousScore >= 50) {
    effectiveRateLimit = Math.floor(effectiveRateLimit / 2);
  }
  if (entry.suspiciousScore >= 80) {
    effectiveRateLimit = Math.floor(effectiveRateLimit / 4);
  }

  // Check if over the limit
  if (entry.count >= effectiveRateLimit) {
    // Increase suspicious score when hitting rate limits
    entry.suspiciousScore += SUSPICIOUS_PENALTIES.rateLimitHit;

    // Block based on suspicious score
    if (entry.suspiciousScore >= RATE_LIMIT_CONFIG.suspiciousThreshold) {
      const blockDuration = getBlockDuration(entry.suspiciousScore);
      entry.blockedUntil = now + blockDuration;

      // Log potential attack
      console.warn(
        `Potential attack detected from ${clientId}. Blocking for ${
          blockDuration / 1000
        }s. Score: ${entry.suspiciousScore}`,
      );

      const remainingSeconds = Math.ceil(blockDuration / 1000);
      return NextResponse.json(
        { message: `Access temporarily blocked due to suspicious activity. Try again later.` },
        { status: 403 },
      );
    }

    // Standard rate limit response
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000).toString();
    const response = await invalid_response('Too many requests, please try again later.', 429);
    response.headers.set('Retry-After', retryAfter);
    return response as any;
  }

  // Increment request count
  entry.count++;

  // Return original response and track failures in a response handler
  // This requires wrapping your route handler
  return;
}

/**
 * Track failed responses to detect scanning/brute-forcing
 * Use this after your route handler
 */
export function trackResponseOutcome(request: NextRequest, response: NextResponse): NextResponse {
  const clientId = generateRequestFingerprint(request);

  if (!rateLimitStore.has(clientId)) {
    return response;
  }

  const entry = rateLimitStore.get(clientId)!;
  const status = response.status;

  // Track consecutive failures (4xx/5xx responses)
  if (status >= 400) {
    entry.consecutiveFailures++;

    // Penalize for consecutive failures (potential scanning)
    if (entry.consecutiveFailures >= RATE_LIMIT_CONFIG.maxConsecutiveFailures) {
      entry.suspiciousScore += SUSPICIOUS_PENALTIES.consecutiveFailure;

      // If highly suspicious, block immediately
      if (entry.suspiciousScore >= RATE_LIMIT_CONFIG.suspiciousThreshold) {
        const blockDuration = getBlockDuration(entry.suspiciousScore);
        entry.blockedUntil = Date.now() + blockDuration;

        console.warn(
          `Blocking ${clientId} for suspicious activity. Score: ${entry.suspiciousScore}, Block Duration: ${blockDuration / 1000}s`,
        );
        return NextResponse.json(
          { message: `Access temporarily blocked due to suspicious activity. Try again later.` },
          { status: 403 },
        );
      }
    }
  } else {
    // Reset consecutive failures on success
    entry.consecutiveFailures = 0;
  }

  return response;
}

/**
 * Middleware wrapper for your route handlers
 */
export function withDDoSProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function (request: NextRequest): Promise<NextResponse> {
    // Apply rate limiting first
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Process the request if allowed
    const response = await handler(request);

    // Track the outcome to update client reputation
    return trackResponseOutcome(request, response);
  };
}

// Usage example:
// export const GET = withDDoSProtection(async (request) => {
//   // Your normal route handling logic here
//   return NextResponse.json({ message: "Success" });
// });
