import { profile_page } from "@/app/src/constants";

export function createProfileNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes | null;
}): NavItem[] {
  let navMenu: any = [];

  let navs: NavItem[] = [
    {
      name: "Profile",
      href: "",
      position: 41,
      sub: [
        {
          name: "Profile Settings",
          href: `${profile_page({
            action: "settings",
            subBase: siteInfo.slug!,
          })}`,
          title: "Profile Settings",
          action: "settings",
          base: "profile",
          position: 1,
        },

        {
          name: "Verifications",
          href: `${profile_page({
            action: "kyc",
            subBase: siteInfo.slug!,
          })}`,
          title: "KYC Verification",
          action: "kyc",
          base: "profile",
          position: 1,
        },
      ],
    },
  ];

  navs.map((item: NavItem) => {
    navMenu.push(item);
  });

  return navMenu;
}
