export const readableDate = (isoDate: any, dayonly = true) => {
  const date = new Date(isoDate);
  let humanReadableDate = isoDate;
  if (dayonly) {
    humanReadableDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } else {
    humanReadableDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }
  return humanReadableDate;
};
