export const convertDays = (days: number): string => {
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  } else if (days < 91) {
    // Less than a quarter
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (days < 182.5) {
    // Less than half a year
    const quarters = Math.floor(days / 91);
    return `${quarters} quarter${quarters > 1 ? 's' : ''}`;
  } else if (days < 365) {
    const biannual = Math.floor(days / 182.5);
    return `${biannual} biannual${biannual > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
};
