import { revenue_page, trnx_page, wallet_page } from "@/app/src/constants";

export function createWalletNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes | null;
}): NavItem[] {
  let navMenu: any = [];

  let navs: NavItem[] = [
    {
      name: "My Wallet",
      href: "#",
      position: 31,
      sub: [
        {
          name: "Fund Wallet",
          href: `${wallet_page({
            action: "fund-wallet",
            subBase: siteInfo.slug!,
          })}`,
          title: "Fund Wallet",
          base: "wallet",
          action: "fund-wallet",
          position: 1,
        },
        {
          name: "Withdraw Fund",
          href: `${wallet_page({
            action: "withdraw-fund",
            subBase: siteInfo.slug!,
          })}`,
          base: "wallet",
          action: "withdraw-fund",
          position: 1,
        },
        {
          name: "Convert Mille",
          href: `${revenue_page({
            subBase: siteInfo.slug!,
            action: "withdraw",
            type: "blog",
          })}`,
          action: "withdraw",
          type: "blog",
          base: "revenue",
          position: 1,
        },
        {
          name: "Transfer Fund",
          href: `${wallet_page({
            action: "transfer-fund",
            subBase: siteInfo.slug!,
          })}`,
          base: "wallet",
          action: "transfer-fund",
          position: 1,
        },
        {
          name: "Bank Details",
          href: `${wallet_page({
            action: "bank-details",
            subBase: siteInfo.slug!,
          })}`,
          base: "wallet",
          action: "bank-details",
          title: "Bank Details",
          position: 1,
        },
        {
          name: "Wallet History",
          href: trnx_page({ subBase: siteInfo.slug!, status: "", type: "" }),
          position: 1,
          base: "wallet",
          action: "history",
        },
      ],
    },
  ];

  navs.map((item: NavItem) => {
    navMenu.push(item);
  });

  return navMenu;
}
