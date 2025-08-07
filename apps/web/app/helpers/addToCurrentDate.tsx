export function addToCurrentDate({
  days = 0,
  months = 0,
  years = 0,
}: {
  days?: number;
  months?: number;
  years?: number;
}): Date {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() + years);
  currentDate.setMonth(currentDate.getMonth() + months);
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate;
}
