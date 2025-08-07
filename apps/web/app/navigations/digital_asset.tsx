import { digi_asset_page } from "@/app/routes/page_routes";

export function createDigitalAssetNavigation({
  slug,
}: {
  slug: string;
}): NavItem[] {
  return [
    {
      name: "Crypto Trading",
      href: "#",
      position: 13,
      sub: [
        {
          name: "Bitcoin to Cash",
          href: `${digi_asset_page({
            subBase: slug,
            action: "trade",
            type: "btc",
          })}`,
          action: "trade",
          title: "Receive Crypto and Get Cash",
          type: "btc",
          base: "assets",
          position: 1,
          sub: [],
        },
      ],
    },
  ];
}
