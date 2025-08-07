import { blog_page, cat_page, crud_page } from "@/app/src/constants";

export function createCatNavigation({
  siteInfo,
  user,
}: {
  siteInfo: BrandType;
  user: UserTypes;
}): NavItem[] {
  return [
    {
      name: "Category",
      href: "#",
      position: 12,
      sub: [
        {
          name: "All",
          href: `${crud_page({
            type: "category",
            subBase: siteInfo.slug!,
            action: "overview",
            base: "categories",
          })}`,
          position: 1,
        },
        {
          name: "New",
          href: `${crud_page({
            type: "category",
            subBase: siteInfo.slug!,
            action: "add",
            base: "categories",
          })}`,
          position: 2,
        },
      ],
    },

    {
      name: "Tag",
      href: "#",
      position: 12,
      sub: [
        {
          name: "All",

          href: `${crud_page({
            type: "tag",
            subBase: siteInfo.slug!,
            action: "overview",
            base: "categories",
          })}`,
          position: 1,
        },
        {
          name: "New",
          href: `${crud_page({
            type: "tag",
            subBase: siteInfo.slug!,
            action: "add",
            base: "categories",
          })}`,
          position: 2,
        },
      ],
    },
  ];
}
