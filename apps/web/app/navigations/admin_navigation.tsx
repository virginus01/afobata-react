import { addons_page, package_page } from "@/app/src/constants";

export function createAdminNavigation({ slug }: { slug: string }): NavItem[] {
  let navMenu: any = [];

  let navs: NavItem[] = [
    {
      name: "Packages",
      href: "#",
      position: 51,
      id: "packages",
      sub: [
        {
          name: "All Packages",
          href: `${package_page({
            action: "overview",
            subBase: slug!,
          })}`,
          action: "overview",
          base: "packages",
          position: 1,
          id: "all_packages",
        },
      ],
    },
  ];

  navs.map((item: NavItem) => {
    navMenu.push(item);
  });

  return navMenu;
}
