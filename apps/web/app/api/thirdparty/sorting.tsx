const getIndexById = async (id: string): Promise<number> => {
  switch (id) {
    case "mtn":
      return 1;
    case "glo":
      return 2;
    case "airtel":
      return 3;
    case "9mobile":
      return 4;
    default:
      return 100;
  }
};

export default getIndexById;
