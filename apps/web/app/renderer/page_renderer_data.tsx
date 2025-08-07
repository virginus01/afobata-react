import { getDynamicData } from '@/app/helpers/getDynamicData';
import { MASTER_BRAND_ID } from '@/src/constants';

export default async function PageRendererData({
  page,
  isHome = false,
  brand,
}: {
  page: string;
  isHome?: boolean;
  brand: BrandType;
}): Promise<PageModel> {
  try {
    let conditions = {};
    if (isHome) {
      const slug1 = `user-${page}-${brand.type}`;
      const slug2 = `default-${page}-${brand.type}`;
      const slug3 = `default-${page}-${brand.type}`;

      conditions = {
        $or: [
          { brandId: brand.id, slug: slug1 },
          { brandId: brand.brandId, slug: slug2 },
          { brandId: MASTER_BRAND_ID, slug: slug3 },
        ],
      };
    } else {
      const slug1 = `user-${page}`;
      const slug2 = `default-${page}`;
      const slug3 = `default-${page}`;
      conditions = {
        $or: [
          { brandId: brand.id, slug: slug1 },
          { brandId: brand.brandId, slug: slug2 },
          { brandId: MASTER_BRAND_ID, slug: slug3 },
        ],
      };
    }

    const data = await getDynamicData({
      subBase: brand.slug!,
      conditions,
      table: 'pages',
    });

    let pageData = data.data ? data.data[0] : {};

    return pageData;
  } catch (error) {
    console.error(error);
    return {};
  }
}
