import { blog_page, drop_page, revenue_page, route_user_page } from "@/app/src/constants";

export function createDropNavigation({ siteInfo }: { siteInfo: BrandType }): NavItem[] {
  return [
    {
      name: "Drop Servicing",
      href: "#",
      position: 12,
      sub: [
        {
          name: "In-House Products",
          href: `${route_user_page({
            subBase: siteInfo.slug!,
            action: "drop",
            base: "products",
            params: [{ source: "inhouse", type: "digital" }],
          })}`,
          base: "products",
          action: "drop",
          type: "digital",
          searchParams: { source: "inhouse", type: "digital" },
          position: 1,
          sub: [],
        },
      ],
    },

    {
      name: "Drop Shipping",
      href: "#",
      position: 12,
      sub: [
        {
          name: "In-House Products",
          href: `${route_user_page({
            subBase: siteInfo.slug!,
            action: "drop",
            base: "products",
            params: [{ source: "inhouse", type: "physical" }],
          })}`,
          base: "products",
          action: "drop",
          type: "physical",
          searchParams: { source: "inhouse", type: "physical" },
          position: 1,
          sub: [],
        },
      ],
    },

    // {
    //   name: "Affiliate Marketing",
    //   href: "#",
    //   position: 12,
    //   sub: [
    //     {
    //       name: "Digital Products",
    //       href: `${drop_page({
    //         subBase: siteInfo.slug!,
    //         action: "shipping",
    //         type: "inhouse_shipping",
    //       })}`,
    //       position: 1,
    //       sub: [],
    //     },
    //     {
    //       name: "Physical Products",
    //       href: `${drop_page({
    //         subBase: siteInfo.slug!,
    //         action: "shipping",
    //         type: "inhouse_shipping",
    //       })}`,
    //       position: 1,
    //       sub: [],
    //     },
    //   ],
    // },
  ];
}
