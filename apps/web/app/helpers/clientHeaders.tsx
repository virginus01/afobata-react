import { isNull } from '@/app/helpers/isNull';

export const clientHeaders = ({
  method = 'get',
  isMultipart = false,
  customHeaders = [],
  auth,
  secure = true,
}: {
  method?: 'get' | 'delete' | 'post' | 'put' | 'patch';
  isMultipart?: boolean;
  customHeaders?: { name: string; value: any }[];
  auth: AuthModel;
  secure?: boolean;
}): HeadersInit => {
  const headersObj: HeadersInit = {};

  if (typeof document === 'undefined') {
    return headersObj;
  }

  headersObj['x-trust-code'] = process.env.NEXT_PUBLIC_TRUST_CODE || '';

  if (!isMultipart) {
    headersObj['Content-Type'] = 'application/json';
  }

  try {
    // ✅ Read CSRF token from document.cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('CSRF-Token='))
      ?.split('=')[1];

    if (csrfToken) {
      headersObj['CSRF-Token'] = csrfToken;
    }

    // ✅ Add Authorization header from external auth
    if (auth?.accessToken && secure) {
      headersObj['Authorization'] = `Bearer ${auth.accessToken}`;
    }

    // ✅ Set Referer
    headersObj['Referer'] = window.location.origin + '/';

    // ✅ Append custom headers
    if (!isNull(customHeaders)) {
      for (const { name, value } of customHeaders) {
        const safeName = name.trim().toLowerCase();
        if (safeName && typeof value === 'string') {
          headersObj[safeName] = value.trim();
        }
      }
    }

    return headersObj;
  } catch (error) {
    console.error('clientHeaders error:', error);
    return headersObj;
  }
};
