import { useEffect, useState } from "react";

interface Params {
  base: string;
  action: string;
}

interface BaseData {
  table: string;
  title: string;
}

interface ReturnData {
  baseData: BaseData;
  tag: string;
  table: string;
  conditions: any;
}

const useBaseData = ({
  params,
  user,
  siteInfo,
}: {
  params: Params;
  user: UserTypes;
  siteInfo: BrandType;
}): ReturnData => {
  let baseData: BaseData = {
    table: "",
    title: "",
  };

  let tag: string = `${user?.selectedProfile ?? ""}_${siteInfo?.id}`;
  let table: string = "";
  let initialConditions = { userId: user.id };
  let conditions: any = { ...initialConditions };

  const baseConfig: Record<string, { table: string; title: string }> = {
    tag: { table: "category", title: "Category" },
    category: { table: "category", title: "Category" },
    blog: { table: "posts", title: "Blog Post" },
    posts: { table: "posts", title: "Blog Post" },
    products: { table: "products", title: "Product" },
    categories: { table: "categories", title: "Category" },
    tags: { table: "categories", title: "Category" },
    pages: { table: "pages", title: "Page" },
    page: { table: "pages", title: "Page" },
    order: { table: "orders", title: "Order" },
    orders: { table: "orders", title: "Order" },
    utility: { table: "products", title: "Order" },
    payments: { table: "payments", title: "Invoices" },
  };

  if (params.base in baseConfig) {
    baseData = {
      table: baseConfig[params.base].table,
      title:
        params.action === "overview"
          ? `${baseConfig[params.base].title}`
          : baseConfig[params.base].title,
    };

    table = baseData.table;

    if (params.base === "products" && params.action === "drop") {
      conditions = {
        price: { $exists: true, $ne: null },
        parentId: "",
        userId: { $ne: user.id },
      };
      tag = "drop";
    } else if (params.base === "orders" && user?.selectedProfile === "creator") {
      conditions = {
        $or: [{ sellerId: user.id }, { userId: user.id }],
      };
    } else if (params.base === "utility") {
      conditions = {
        serviceType: "utility",
      };
    } else if (params.base === "utility") {
      conditions = {
        serviceType: "utility",
      };
    }
  } else {
    baseData = { table: "", title: "" };
  }

  return { baseData, tag, table, conditions };
};

export default useBaseData;
