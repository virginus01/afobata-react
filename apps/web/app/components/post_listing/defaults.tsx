import { SectionOption } from "@/app/types/section";

export const newsListing1: SectionOption = {
  type: "site_component",
  key: "newsListing1",
  label: "News Listing 1",
  essentials: ["blog_posts"],
  classes: { width_all: "w-auto", padding_all: "p-1" },
};

export const blogListing1: SectionOption = {
  type: "site_component",
  key: "blogListing1",
  label: "Blog Listing 1",
  essentials: ["blog_posts"],
  classes: { width_all: "w-auto", padding_all: "p-1" },
};

export const recentPosts: SectionOption = {
  type: "site_component",
  key: "recentPosts",
  label: "Recent Posts",
  essentials: ["blog_posts"],
  classes: { width_all: "w-auto", padding_all: "p-1" },
};

export const recentPosts2: SectionOption = {
  type: "site_component",
  key: "recentPosts2",
  label: "Recent Posts 2",
  essentials: ["blog_posts"],
  classes: { width_all: "w-auto", padding_all: "p-1" },
};
