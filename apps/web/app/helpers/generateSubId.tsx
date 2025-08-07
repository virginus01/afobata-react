export function generateSubId({
  userId,
  brandId,
  planId,
}: {
  userId: string;
  brandId: string;
  planId: string;
}): string {
  return `${userId}${brandId}${planId}`.toLowerCase();
}
