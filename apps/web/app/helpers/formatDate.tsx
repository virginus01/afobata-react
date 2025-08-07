export const formatDate = (date: any) => {
  try {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const getOrdinal = (day: any) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };
    const ordinal = getOrdinal(day);
    return `${day}${ordinal} ${month} ${year}`;
  } catch (error) {
    console.error(error);
    return date;
  }
};
