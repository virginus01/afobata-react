export const generateConfig = (
  user?: UserTypes,
  type?: string,
  status?: string
): Record<
  string,
  {
    columns: string[];
    conditions: Record<string, any>;
  }
> => {
  const defaultColumns = ["id", "title", "slug", "price", "status", "action"];
  const defaultConditions = { type, userId: user?.id };

  return {
    products: {
      columns: ["id", "title", "slug", "price", "status", "action"],
      conditions: defaultConditions,
    },
    pages: {
      columns: ["id", "title", "slug", "status", "action"],
      conditions: defaultConditions,
    },
    posts: {
      columns: ["id", "title", "slug", "status", "action"],
      conditions: defaultConditions,
    },
    categories: {
      columns: defaultColumns,
      conditions: defaultConditions,
    },
    tags: {
      columns: defaultColumns,
      conditions: defaultConditions,
    },
    orders: {
      columns: [
        "id",
        "title",
        "sellerBrandId",
        "productId",
        ...(user?.selectedProfile === "creator" ? ["revenue"] : []),
        "referenceId",
        "amount",
        "status",
        "action",
      ],
      conditions: {
        ...(status ? { status } : {}),
        ...(user?.selectedProfile === "creator"
          ? { sellerBrandId: user?.brand?.id || "" }
          : { userId: user?.id }),
      },
    },
  };
};
