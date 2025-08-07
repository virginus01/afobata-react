import { trnx_page } from "@/app/src/constants";

export function createTrnxNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes | null;
}): NavItem[] {
  let navMenu: any = [];

  let navs: NavItem[] = [
    {
      name: "Transactions",
      href: "",
      position: 15,
      id: "transactions",
      sub: [
        {
          name: "All Transactions",
          href: trnx_page({ subBase: siteInfo.slug!, status: "", type: "" }),
          position: 1,
          id: "all_trnx",
          base: "transactions",
          action: "overview",
          type: "",
          status: "",
        },
        {
          name: "Deposits",
          href: trnx_page({
            subBase: siteInfo.slug!,
            status: "paid",
            type: "deposit",
          }),
          position: 1,
          id: "deposit",
          base: "transactions",
          action: "overview",
          status: "paid",
          type: "deposit",
        },
        {
          name: "Payouts",
          href: trnx_page({
            subBase: siteInfo.slug!,
            status: "paid",
            type: "payout",
          }),
          position: 1,
          id: "payout",
          base: "transactions",
          action: "overview",
          status: "paid",
          type: "payout",
        },
      ],
    },
  ];

  navs.map((item: NavItem) => {
    navMenu.push(item);
  });

  return navMenu;
}
