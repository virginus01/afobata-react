import {

  order_overview_page,

} from "@/app/src/constants";

export function createOrderNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes;
}): NavItem[] {
  const slug = siteInfo.slug || "";

  const navs: any[] = [
    {
      name: `Orders`,
      href: "#",
      position: 14,
      id: "sales",
      sub: [
        {
          name: "All Orders",
          href: order_overview_page({ status: "", subBase: slug }),
          position: 1,
          id: "all_orders",
          action: "overview",
          base: "orders",
          searchParams: { status: "" },
        },
        {
          name: "Completed Sales",
          href: order_overview_page({ status: "completed", subBase: slug }),
          position: 1,
          id: "completed_sales",
          action: "overview",
          base: "orders",
          searchParams: { status: "completed" },
        },

        {
          name: "Processed Orders",
          href: order_overview_page({ status: "processed", subBase: slug }),
          position: 1,
          id: "processed_orders",
          action: "overview",
          base: "orders",
          searchParams: { status: "processed" },
        },
        {
          name: "Abandoned Orders",
          href: order_overview_page({
            status: "abandoned",
            subBase: slug,
          }),
          position: 2,
          id: "abandoned_orders",
          action: "overview",
          base: "orders",
          searchParams: { status: "abandoned" },
        },
        {
          name: "Paid Orders",
          href: order_overview_page({ status: "paid", subBase: slug }),
          position: 3,
          id: "paid_orders",
          action: "overview",
          base: "orders",
          searchParams: { status: "paid" },
        },
        {
          name: "Pending Orders",
          href: order_overview_page({ status: "pending", subBase: slug }),
          position: 3,
          id: "pending_orders",
          action: "overview",
          base: "orders",
          searchParams: { status: "pending" },
        },
      ],
    },
  ].filter(Boolean) as NavItem[]; // Remove false values

  return navs as any;
}
