import { crud_page } from "@/app/src/constants";

export function createBlogNavigation({
  siteInfo,
}: {
  siteInfo: BrandType;
}): NavItem[] {
  return [
    {
      name: "Blog Management",
      href: "#",
      position: 12,
      sub: [
        {
          name: "All Blog Posts",
          href: `${crud_page({
            subBase: siteInfo.slug!,
            action: "overview",
            base: "posts",
            type: "blog",
          })}`,
          action: "overview",
          base: "posts",
          type: "blog",
          position: 1,
          sub: [],
        },
        {
          name: "New Blog Post",
          href: `${crud_page({
            subBase: siteInfo.slug!,
            action: "add",
            base: "posts",
            type: "blog",
          })}`,
          action: "add",
          base: "posts",
          type: "blog",
          position: 2,
        },
      ],
    },
  ];
}
