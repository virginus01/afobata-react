import { SIDEBAR_SECTIONS } from '@/dashboard/page_builder/constants/sidebar';
import { SectionOption } from '@/app/types/section';
import { blogHeaderDeafult } from '@/app/components/blog_headers/defaults';
import { blogBody3, postBodyDeafult } from '@/app/components/post_body/defaults';
import { loginDefault } from '@/app/components/login/defaults';
import { signUpDefault } from '@/app/components/signup/defaults';
import { introDefault } from '@/app/components/intro/defaults';
import { utility1Default } from '@/app/components/utility/defaults';
import { hero1Default } from '@/app/components/heros/default';
import { newsListing1, blogListing1 } from '@/app/components/post_listing/defaults';
import { productListDefault } from '@/app/components/product_listing/defaults';
import { pricingDefault } from '@/app/components/pricing/defaults';
import { pdh } from '@/app/components/product_detail_header/defaults';
import { productBodyContent } from '@/app/components/product_body_content/defaults';
import { descCard } from '@/app/components/desc_card/defaults';
import { appDownloadHero1 } from '@/app/components/app_download/defaults';
import { purchasedView } from '@/app/components/purchased_view/defaults';
import { features } from '@/app/components/features/default';
import { steps } from '@/app/components/steps/default';
import { providers } from '@/app/components/providers/default';

export const MAIN_SECTIONS: SectionOption[] = [
  ...[hero1Default as SectionOption],

  ...[newsListing1 as SectionOption],

  ...[blogListing1 as SectionOption],

  ...[productListDefault as SectionOption],

  ...[pdh as SectionOption],

  ...[productBodyContent as SectionOption],

  ...[descCard as SectionOption],

  ...[utility1Default as SectionOption],

  ...[blogHeaderDeafult as SectionOption],

  ...[postBodyDeafult as SectionOption],

  ...[blogBody3 as SectionOption],

  ...[loginDefault as SectionOption],

  ...[signUpDefault as SectionOption],

  ...[introDefault as SectionOption],

  ...[pricingDefault as SectionOption],

  ...[appDownloadHero1 as SectionOption],

  ...[purchasedView as SectionOption],

  ...[features as SectionOption],

  ...[steps as SectionOption],

  ...[providers as SectionOption],

  ...SIDEBAR_SECTIONS,
];
