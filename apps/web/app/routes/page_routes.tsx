export const PRIMARY_COLOR = 'red-500';

export const product_overview_page = ({
  productType,
  subBase,
}: {
  productType: string;
  subBase: string;
}): string => {
  return `/${subBase}/dashboard/products/overview?type=${productType}`;
};

export const add_product_page = ({
  productType,
  subBase,
}: {
  productType: string;
  subBase: string;
}): string => {
  return `/${subBase}/dashboard/products/add?type=${productType}`;
};

export const edit_product_page = ({
  productId,
  subBase,
}: {
  productId: string;
  subBase: string;
}): string => {
  return `/${subBase}/dashboard/products/edit?id=${productId}`;
};

export const order_overview_page = ({
  status,
  subBase,
}: {
  status: string;
  subBase: string;
}): string => {
  return `/${subBase}/dashboard/orders/overview?status=${status}`;
};

export const brand_page = ({ action, subBase }: { action: string; subBase: string }): string => {
  return `/${subBase}/dashboard/brand/${action}`;
};

export const revenue_page = ({
  action,
  type,
  subBase,
}: {
  action: string;
  type: string;
  subBase: string;
}): string => {
  return `/${subBase}/dashboard/revenue/${action}?type=${type}`;
};

export const blog_page = ({
  action,
  subBase,
  id,
  type,
}: {
  action: string;
  subBase: string;
  id?: string;
  type?: string;
}): string => {
  return `/${subBase}/dashboard/monetize/${action}${id ? `?id=${id}` : ''}${
    type ? `${id ? '&' : '?'}type=${type}` : ''
  }`;
};

export const drop_page = ({
  action,
  subBase,
  type,
}: {
  action: 'shipping' | 'servicing';
  subBase: string;
  type: 'inhouse_servicing' | 'inhouse_shipping';
}): string => {
  return `/${subBase}/dashboard/drop/${action}?type=${type}`;
};

export const product_page = ({
  action,
  subBase,
  id,
  type,
}: {
  action: string;
  subBase: string;
  id?: string;
  type?: string;
}): string => {
  return `/${subBase}/dashboard/products/${action}${id ? `?id=${id}` : ''}${
    type ? `${id ? '&' : '?'}type=${type}` : ''
  }`;
};
// Wallet Page
export const wallet_page = ({ action, subBase }: { action: string; subBase: string }): string => {
  return `/${subBase}/dashboard/wallet/${action}`;
};

export const digi_asset_page = ({
  action,
  subBase,
  type,
}: {
  action: string;
  subBase: string;
  type: string;
}): string => {
  return `/${subBase}/dashboard/assets/${action}?type=${type}`;
};

export const trnx_page = ({
  status,
  subBase,
  type,
}: {
  status?: string;
  subBase: string;
  type?: string;
}): string => {
  return `/${subBase}/dashboard/transactions/overview?status=${status}&type=${type}`;
};

// Profile Page
export const profile_page = ({ action, subBase }: { action: string; subBase: string }): string => {
  return `/${subBase}/dashboard/profile/${action}`;
};

export const cat_page = ({ action, subBase }: { action: string; subBase: string }): string => {
  return `/${subBase}/dashboard/category/${action}`;
};

export const crud_page = ({
  action,
  subBase,
  base,
  id,
  type,
  searchParams,
}: {
  action: 'add' | 'overview' | 'edit' | 'drop';
  subBase: string;
  base: string;
  id?: string;
  type?: string;
  searchParams?: Record<string, string | number | boolean>;
}): string => {
  const queryParams = new URLSearchParams();

  if (id) queryParams.append('id', id);
  if (type) queryParams.append('type', type);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
  }

  return `/${subBase}/dashboard/${base}/${action}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;
};

export const appearance_page = ({
  action,
  subBase,
  base,
  id,
  type,
  searchParams,
}: {
  action: 'menus' | 'translations';
  subBase: string;
  base: string;
  id?: string;
  type?: string;
  searchParams?: Record<string, string | number | boolean>;
}): string => {
  const queryParams = new URLSearchParams();

  if (id) queryParams.append('id', id);
  if (type) queryParams.append('type', type);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
  }

  return `/${subBase}/dashboard/${base}/${action}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;
};

// Welcome Page
export const welcome_page = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/welcome`;
};

// Receipt Page
export const receipt_page = ({ id, subBase }: { id: string; subBase: string }): string => {
  return `/${subBase}/receipt?ref=${id}`;
};

// Login Page
export const login_page = ({
  subBase,
  plateform = 'web',
}: {
  subBase: string;
  plateform?: string;
}): string => {
  return `/login?plateform=${plateform}`;
};

// Signup Page
export const signup_page = ({ plateform = 'web' }: { plateform?: string }): string => {
  return `/signup?plateform=${plateform}`;
};

// Logout Page
export const logout_page = ({ plateform = 'web' }: { plateform?: string }): string => {
  return `/logout?plateform=${plateform}`;
};

// Dashboard Page
export const dashboard_page = ({
  subBase,
  plateform = 'web',
  action,
}: {
  subBase: string;
  plateform?: string;
  action?: string;
}): string => {
  return `/${subBase}/dashboard?plateform=${plateform}${action ? `&action=${action}` : ''}`;
};

// App Page
export const app_page = ({
  subBase,
  params = [],
}: {
  subBase: string;
  params?: Record<string, string | number | boolean>[];
}): string => {
  const combinedParams = [{ plateform: 'app' }, ...params];

  const queryString = combinedParams
    .flatMap((param) =>
      Object.entries(param).map(
        ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      ),
    )
    .join('&');

  return `/${subBase}/dashboard?${queryString}`;
};

// Dashboard Page
export const password_reset = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/reset`;
};

export const contact_us = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/contact-us`;
};

export const route_user_page = ({
  subBase,
  base,
  action,
  params = [],
}: {
  subBase: string;
  base: string;
  action: string;
  params?: Record<string, string>[];
}): string => {
  const queryString = params
    .flatMap((param) =>
      Object.entries(param).map(
        ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      ),
    )
    .join('&');
  const basePath = `/${subBase}/dashboard/${base}/${action}`;
  return queryString ? `${basePath}?${queryString}` : `${basePath}`;
};

export const route_public_page = ({
  paths,
  params = [],
}: {
  paths: string[];
  params?: Record<string, string>[];
}): string => {
  const basePath = paths.length > 0 ? paths.join('/') : '';
  const queryString = params
    .flatMap((param) =>
      Object.entries(param).map(
        ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      ),
    )
    .join('&');

  return queryString ? `/${basePath}?${queryString}` : `/${basePath}`;
};

export const privacy = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/privacy-policy`;
};

export const terms = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/terms`;
};

export const pricing = ({ subBase }: { subBase: string }): string => {
  return `/${subBase}/pricing`;
};

export const kyc = ({
  subBase,
  type,
  level,
  country,
}: {
  subBase: string;
  type: string;
  level: string;
  country: string;
}): string => {
  return `/${subBase}/dashboard/profile/kyc?type=${type}&level=${level}&country=${country}`;
};
