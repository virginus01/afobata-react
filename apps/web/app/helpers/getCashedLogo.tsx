export const getCashedLogo = (): string => {
  if (typeof window !== 'undefined') {
    const c: any = localStorage.getItem('brand');
    return c?.logo || '/logo.png';
  }
  return '/images/logo.png';
};
