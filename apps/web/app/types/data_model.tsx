interface DataType {
  /** Unique identifier for the product */
  id?: string;

  /** Name or title of the product */
  title?: string;

  /** Brief description or summary of the product */
  description?: string;
  readTime?: number;

  /** URL-friendly identifier for the product, usually derived from the title */
  slug?: string;
  canonicalSlug?: string;
  parentData?: DataType;
  reseller_discount?: number;
  currencySymbol?: string;
  monthly_price?: number;
  quarterly_price?: number;
  biannual_price?: number;
  isFree?: boolean;
  reseller_monthly_price?: number;
  reseller_quarterly_price?: number;
  reseller_biannual_price?: number;
  discount?: number;
  profit_margin?: number;
  parentBrandId?: string;
  level?: number;
  priceMode?: 'fixed' | 'multiply';
  orderValue?: string;
  product_files?: FileType[];
  canonical?: string;
  bodyType?: string;
  rules?: any;
  bg_image?: FileType;
  pageData?: PageBuilderData;
  topics?: TopicType[];
  sellerProfit?: number;
  addons?: AddonType[];
  originalPrice?: number;
  currency?: string;
  /** Array of related items or options associated with the product (e.g., sections in a course) */
  multiple?: MultipleType[];
  orignalPrice?: number;
  ownerData?: UserTypes;

  parentBrandData?: BrandType;

  /** Identifier for the brand associated with the product */
  brandId?: string;

  /** Number of cash views (if applicable) */
  cashViews?: number;

  /** Total number of views for the product */
  views?: number;

  /** Category to which the product belongs */
  category?: string;

  /** Tags associated with the product for easy searching or categorization */
  tags?: string;

  /** Detailed description or content of the product */
  body?: string;

  /** Identifier for the user who added the product */
  userId?: string;

  /** URL or path to the product's image */
  image?: string;

  /** Current status of the product */
  status?: 'live' | 'draft' | 'archived' | 'published' | 'unpublished';

  /** Availability count for the product */
  available?: number;

  /** Identifier or tag for premium products */
  premiumPin?: string;

  /** Identifier or tag for free products */
  freePin?: string;

  /** Type of the product (e.g., data, course, digital) */
  type?: string;

  /** Type of service offered by the product */
  serviceType?: string;

  /** Information about the free view availability */
  freeView?: string;

  /** Price of the product */
  price?: number;

  /** Partner-specific price of the product */
  partnerPrice?: number;

  /** Previous price of the product for showing discounts */
  formerPrice?: number;

  /** Information about the user associated with the product */
  user?: any;

  /** Subtitle or secondary title of the product */
  subTitle?: string;

  /** Metadata for SEO: title */
  metaTitle?: string;

  /** Metadata for SEO: description */
  metaDescription?: string;

  /** Partner or affiliate associated with the product */
  partner?: string;

  /** Identifier for the service provider */
  spId?: string;

  /** Name of the service provider */
  spName?: string;

  /** Minimum amount applicable for the product */
  minimumAmount?: string;

  /** Maximum amount applicable for the product */
  maximumAmount?: string;

  /** Discount amount for the product */
  discountAmount?: string;

  /** Type of discount applied (e.g., percentage or fixed) */
  discountType?: string;

  /** Adjustment amount for the product */
  adjustment?: number;

  /** Type of adjustment (e.g., percentage or fixed) */
  adjustmentType?: string;

  /** Direction of the adjustment (e.g., increase or decrease) */
  adjustmentDirection?: string;

  /** Fixed additional amount applicable to the product */
  fixedAdditionalAmount?: number;

  /** Partner-specific adjustment rate */
  partnerAdjustmentRate?: number;

  /** Notes or additional remarks about the product */
  note?: string;

  /** Creation timestamp of the product */
  createdAt?: string;

  /** Additional miscellaneous information */
  others?: any;

  /** Author of the product, if applicable */
  author?: string;

  /** Publication date of the product */
  date?: string;

  /** Recent posts or related content */
  recentPosts?: { title: string; link: string }[];

  index?: boolean;

  monetize?: boolean;

  dataType?: string;

  parentId?: string;

  chapters?: ChapterType[];

  images?: FileType[];

  meta?: MetaType;

  allowedPlateforms?: string[];
}
