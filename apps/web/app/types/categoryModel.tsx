interface CategoryModel {
  /** Unique identifier for the product */
  id?: string;

  /** Name or title of the product */
  title?: string;

  parentId?: string;

  /** URL-friendly identifier for the product, usually derived from the title */
  slug?: string;

  /** Array of related items or options associated with the product like sections in course */
  multiple?: MultipleType[];

  /** Detailed description or content of the product */
  body?: string;

  /** Identifier for the user who added the product */
  userId?: string;

  marketerBrandId?: string;

  image?: string;

  /** Current status of the product (e.g., active, inactive) */
  status?: "live" | "draft" | "archived" | "unpublished";

  /** set product availability */
  available?: number;

  /** Identifier or tag for premium products */
  premiumPin?: string;

  /** Identifier or tag for free products */
  freePin?: string;

  /** Type of the product eg data, course, digital etc */
  type?: string;

  serviceType?: string;

  /** Information about the free view availability */
  freeView?: string;

  cashViews?: number;

  /** Price of the product */
  price?: number;

  partnerPrice?: number;

  currency?: string;

  /** Previous price of the product (for showing discounts) */
  formerPrice?: number;

  /** User-related information or object */
  user?: any;

  /** Brief description or summary of the product */
  description?: string;

  /** Partner or affiliate associated with the product */
  partner?: string;

  /** Identifier for the service provider */
  spId?: string;

  /** Name of the service provider */
  spName?: string;

  brandId?: string;

  /** Minimum amount applicable for the product (if any) */
  minimumAmount?: string;

  /** Maximum amount applicable for the product (if any) */
  maximumAmount?: string;

  /** Amount of discount on the product */
  discountAmount?: string;

  /** Percentage of the discount or if is fixed */
  discountType?: string;

  adjustment?: number;

  adjustmentType?: string;

  adjustmentDirection?: string;

  fixedAdditionalAmount?: number;

  partnerAdjustmentRate?: number;

  note?: string;

  /** Another format for the creation timestamp */
  createdAt?: string;

  createdFrom?: string;

  brandAdditionalAmount?: number;

  allValue?: number;

  parentBrandRevenueRate?: number;

  brandRevenueRate?: number;

  /** Additional miscellaneous information */
  others?: any;

  category?: string;

  tags?: string[];
}
