import { isNull } from '@/app/helpers/isNull';

export function setClientCookie(name: string, value: any, options = {}) {
  // Default options
  const defaultOptions = {
    path: '/',
    maxAge: 10,
    httpOnly: false, // Note: httpOnly can only be set by the server
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  };

  // Merge default options with provided options
  const cookieOptions: any = { ...defaultOptions, ...options };

  // Start building the cookie string
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Add cookie options
  if (cookieOptions.path) cookieString += `; path=${cookieOptions.path}`;
  if (cookieOptions.domain) cookieString += `; domain=${cookieOptions.domain}`;
  if (cookieOptions.maxAge) cookieString += `; max-age=${cookieOptions.maxAge}`;
  if (cookieOptions.expires) cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
  if (cookieOptions.secure) cookieString += '; secure';
  if (cookieOptions.sameSite) cookieString += `; samesite=${cookieOptions.sameSite}`;

  // Set the cookie
  document.cookie = cookieString;
}

export function getPackagePrice({
  discount,
  price,
  duration,
}: {
  discount: number;
  price: number;
  duration: PlanDuration;
}) {
  let finalPrice = 0;

  if ([isNull(duration.value), isNull(price)].includes(true)) {
    return { price: finalPrice, ok: false };
  }

  const prePrice = (price ?? 0) * duration.value;
  const durationDiscount = ((duration.discount ?? 0) / 100) * Number(prePrice);
  finalPrice = Number(prePrice) - durationDiscount;

  return { price: finalPrice, ok: true };
}
