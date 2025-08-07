export function generateWalletId({
  userId,
  brandId,
  identifier,
  currency,
}: {
  userId: string;
  brandId: string;
  identifier: string;
  currency: string;
}): string {
  return `${userId}${brandId}${identifier}${currency}`.toLowerCase();
}
