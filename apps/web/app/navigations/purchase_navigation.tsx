import { route_user_page } from "@/app/src/constants";

export function createPurchaseNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes;
}): NavItem[] {
  const slug = siteInfo.slug || "";

  const navs: any[] = [
    {
      name: `Purchases`,
      href: "#",
      position: 15,
      id: "purchases",
      sub: [
        {
          name: "Invoices",
          href: route_user_page({ base: "purchases", action: "invoices", subBase: slug }),
          position: 1,
          id: "invoices",
          action: "invoices",
          base: "purchases",
          searchParams: {},
        },
        {
          name: "Products",
          href: route_user_page({ base: "purchases", action: "products", subBase: slug }),
          position: 1,
          id: "products",
          action: "products",
          base: "purchases",
          searchParams: {},
        },
      ],
    },
  ].filter(Boolean) as NavItem[];
  return navs as any;
}
