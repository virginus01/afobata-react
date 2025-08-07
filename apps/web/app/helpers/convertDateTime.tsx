export const convertDateTime = (dateTime: string | Date = new Date()): Date => {
  if (typeof dateTime === 'string') {
    return new Date(dateTime);
  }
  return dateTime;
};
