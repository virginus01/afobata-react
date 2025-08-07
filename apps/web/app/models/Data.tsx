import { getDynamicData } from '@/app/helpers/getDynamicData';
import { isNull } from '@/app/helpers/isNull';

export class Data {
  id: string = '';
  title: string = '';
  description: string = '';
  readTime: number = 0;
  slug: string = '';
  canonicalSlug: string = '';
  parentData: Partial<Data> = {};
  reseller_discount: number = 0;
  currencySymbol: string = '';
  monthly_price: number = 0;
  quarterly_price: number = 0;
  biannual_price: number = 0;
  isFree: boolean = false;
  reseller_monthly_price: number = 0;
  reseller_quarterly_price: number = 0;
  reseller_biannual_price: number = 0;
  discount: number = 0;
  revenue: number = 0;
  sales: number = 0;
  profit_margin: number = 0;
  parentBrandId: string = '';
  level: number = 0;
  priceMode: 'fixed' | 'multiply' = 'fixed';
  orderValue: string = '';
  product_files: FileType[] = [];
  canonical: string = '';
  bodyType: string = '';
  rules: any = {};
  bg_image: FileType = {} as FileType;
  pageData: PageBuilderData = {} as PageBuilderData;
  topics: TopicType[] = [];
  sellerProfit: number = 0;
  addons: AddonType[] = [];
  originalPrice: number = 0;
  currency: string = '';
  multiple: MultipleType[] = [];
  orignalPrice: number = 0;
  ownerData: UserTypes = {} as UserTypes;
  parentBrandData: BrandType = {} as BrandType;
  brandId: string = '';
  cashViews: number = 0;
  views: number = 0;
  category: string = '';
  tags: string = '';
  body: string = '';
  userId: string = '';
  image: FileType = {} as FileType;
  status: 'live' | 'draft' | 'archived' | 'published' | 'unpublished' = 'published';
  available: number = 0;
  premiumPin: string = '';
  freePin: string = '';
  type: string = '';
  serviceType: string = '';
  freeView: string = '';
  price: number = 0;
  partnerPrice: number = 0;
  formerPrice: number = 0;
  user: any = {};
  subTitle: string = '';
  metaTitle: string = '';
  metaDescription: string = '';
  partner: string = '';
  spId: string = '';
  spName: string = '';
  minimumAmount: string = '';
  maximumAmount: string = '';
  discountAmount: string = '';
  discountType: string = '';
  adjustment: number = 0;
  adjustmentType: string = '';
  adjustmentDirection: string = '';
  fixedAdditionalAmount: number = 0;
  partnerAdjustmentRate: number = 0;
  note: string = '';
  createdAt: string = '';
  others: any = {};
  author: string = '';
  date: string = '';
  recentPosts: { title: string; link: string }[] = [];
  index: boolean = false;
  monetize: boolean = false;
  dataType: string = '';
  parentId: string = '';
  chapters: ChapterType[] = [];
  images: FileType[] = [];
  meta: MetaType = {} as MetaType;
  allowedPlateforms: string[] = [];
  redirectUrl?: string = '';
  fulFilmentType?: string = '';
  subCourses?: any[] = [];
  subCoursesIds?: any[] = [];
  password?: number | string = '';

  // Fetch live product data
  async fetchLiveProduct(id: string, parentId: string, baseData: any, siteInfo: any) {
    if (isNull(id) && isNull(parentId)) return null;

    try {
      const res = await getDynamicData({
        subBase: siteInfo.slug!,
        table: baseData.table ?? 'products',
        conditions: { $or: [{ id: id }, { id: parentId }] },
        tag: 'liveData',
        cache: false,
      });

      return res.status && res.data ? res.data : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  getFormattedPrice(): string {
    return `${this.currencySymbol ?? ''}${this.price?.toFixed(2) ?? '0.00'}`;
  }
}
