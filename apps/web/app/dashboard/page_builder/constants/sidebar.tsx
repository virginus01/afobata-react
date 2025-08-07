import { recentPosts, recentPosts2 } from "@/app/components/post_listing/defaults";
import { SectionOption } from "@/app/types/section";

export const SIDEBAR_SECTIONS: SectionOption[] = [
  ...[recentPosts as any],
  ...[recentPosts2 as any],
];
