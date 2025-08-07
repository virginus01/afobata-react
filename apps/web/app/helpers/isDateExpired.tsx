export function isDateExpired(expireDate: string): boolean {
  const expire = new Date(expireDate);
  const now = new Date();
  return now > expire;
}
