'use server';
import {
  fetchDataWithConditions,
  fetchPaginatedData,
  upsert,
  fetchMultiplePaginatedData,
} from '@/app/api/database/mongodb';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { response } from '@/app/helpers/response';
import { determineEssentials } from '@/app/helpers/determineEssentials';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import slugify from 'slugify';
import { modProduct, server_create_or_update_product } from '@/api/product';
import { get_site_info, getBrandInfo } from '@/api/brand/brand';
import { server_create_or_update_post } from '@/api/blog/blog';
import { server_create_or_update_category } from '@/api/category/category';
import { MASTER_BRAND_ID } from '@/src/constants';
import { NextRequest } from 'next/server';
import { geo } from '@/api/geo';
import { creditDebitMille } from '@/api/mille';
import { Data } from '@/app/models/Data';
import { Brand } from '@/app/models/Brand';
import { getCountries } from '@/helpers/country_helper';
import { getCookie } from '@/app/actions';
import { httpStatusCodes } from '@/helpers/status_codes';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { globalCacheSave } from '@/helpers/cdn';

export async function server_dynamic_get_data({
  table,
  page,
  tables = [],
  limit,
  context,
  ignore_brand_add = 'no',
  conditions = {},
  sortOptions = { createdAt: -1 },
  renderPage = '',
  essentials = [],
}: {
  table?: any;
  renderPage?: string;
  page?: string;
  tables?: string[];
  essentials?: string[];
  limit?: string;
  ignore_brand_add?: 'no' | 'yes';
  context?: any;
  conditions?: any;
  sortOptions?: any;
}) {
  try {
    if ((isNull(tables) || (Array.isArray(tables) && tables.length == 0)) && isNull(table)) {
      return invalid_response(
        `table or array of tables must be passed: ${tables} ${conditions}`,
        200,
      );
    }

    if (tables.includes('users') || table === 'users') {
      return invalid_response('you can not dynamically query users', 200);
    }

    if (tables.includes('auth') || table === 'auth') {
      return invalid_response('you can not dynamically query auth', 200);
    }

    let data: any[] = [];
    let meta: any = {};

    let brand = await get_site_info(context);

    let items: any = {};

    if (!isNull(table)) {
      items = await fetchPaginatedData({
        collectionName: table,
        conditions,
        limit: limit!,
        page: page!,
        sortOptions: sortOptions,
      });

      meta = items.meta;
    } else if (!isNull(tables)) {
      items = await fetchMultiplePaginatedData({
        collectionNames: tables,
        conditions,
        limit: limit!,
        page: page!,
        sortOptions,
      });
      meta = items.meta;
    }

    if (items.data) {
      for (const item of items.data) {
        if (item.table === 'products' || table === 'products') {
          const productData = await modProduct({
            product: item,
            siteInfo: brand,
          });

          data.push({ ...productData, dataType: item.table });
        } else {
          data.push({ ...item, dataType: item.table });
        }
      }
    }

    let essentialsData: string[] = essentials ?? [];

    let renderData: any = {};
    let pageEssentials = {};

    try {
      if (Array.isArray(items.data) && items.data.length === 1) {
        const focusTableData = items.data[0];
        const focusTable = focusTableData.table;
        let rPage = renderPage;

        if (!rPage) {
          switch (focusTable) {
            case 'pages':
              renderData = focusTableData.pageData ?? focusTableData.body ?? {};
              break;

            case 'posts':
              rPage = 'blog-post-details';
              break;

            case 'products':
              rPage = 'product-details';
              break;

            default:
              break;
          }
        }

        if (rPage && isNull(renderData)) {
          const slug1 = `user-${rPage}`;
          const slug2 = `default-${rPage}`;
          const slug3 = `default-${rPage}`;

          const renderConditions = {
            $or: [
              { brandId: brand.id, slug: slug1 },
              { brandId: brand.brandId, slug: slug2 },
              { brandId: MASTER_BRAND_ID, slug: slug3 },
            ],
          };

          const [rData] = await fetchDataWithConditions('pages', renderConditions);

          renderData = focusTableData.pageData ?? rData?.pageData ?? rData?.body ?? {};
        }

        const dEssentials: any[] = determineEssentials({ pageData: renderData.sections });

        essentialsData = [...essentialsData, ...dEssentials];

        pageEssentials = await process_page_essentials({
          focusTableData,
          pageData: data as any,
          essentialsData: essentialsData ?? [],
          siteInfo: brand,
        });
      }
    } catch (error) {
      console.error('renderData', error);
    }

    let response: any = {};

    if (data.length > 0) {
      response.msg = 'data fetched';
      response.code = 'success';
      response.success = true;
      response.data = data;
      response.meta = meta;
      response.renderData = renderData;
      response.pageEssentials = pageEssentials;
    } else {
      response.msg = 'data not fetched';
      response.code = 'error';
      response.success = false;
      response.meta = {};
      response.data = [];
    }

    return api_response(response);
  } catch (error) {
    console.error(error);
    return api_response('error fetching products');
  }
}

export async function server_update_views({
  data,
  request,
}: {
  data: any;
  request: NextRequest;
}): Promise<any> {
  try {
    const geoData = await geo(request);
    const ipInfo: any = (await getCookie('ipInfo')) ?? geoData.data;

    const missing = findMissingFields({ id: data.id, title: data.title, ip: ipInfo.ip });

    if (missing) {
      const msg = `${missing} are required`;
      console.error(msg);
      return api_response({ data: {}, status: false, msg });
    }

    const slug = slugify(`${data.id}-${ipInfo.ip}`, {
      lower: true,
      trim: true,
    });

    const [existingAnalytic] = await fetchDataWithConditions('analytics', {
      slug,
    });

    const analyticsData = {
      ...ipInfo,
      slug,
      id: slug,
      type: data.type,
      dataId: data.id,
      title: data.title,
    };

    if (isNull(existingAnalytic)) {
      await creditDebitMille({
        userId: data.userId,
        brandId: data.brandId,
        action: 'credit',
        value: 0.001,
      });
      await upsert({ ...analyticsData, views: 1 }, 'analytics', true, {});
    }

    return api_response({
      status: true,
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error updating views:', error);
    return invalid_response('Error updating views', 401);
  }
}

export async function server_dynamic_create_or_update(formData: any, siteInfo: Brand) {
  if (['posts', 'blog'].includes(formData.table)) {
    return await server_create_or_update_post(formData);
  }

  if (['products'].includes(formData.table)) {
    return await server_create_or_update_product(formData, siteInfo);
  }

  if (['categories', 'tags'].includes(formData.table)) {
    return await server_create_or_update_category(formData);
  }

  return invalid_response('no table to update');
}

export async function verifySlug(slug: string) {
  const res = await server_dynamic_get_data({
    conditions: { slug: slug },
    tables: ['blog', 'posts', 'products'],
  });
  const resP = await res.json();
  const data = resP.data;
  return data || null;
}

export async function server_refresh_views({ userId }: { userId?: string }) {
  try {
    return api_response({ status: true });
  } catch (error) {}
}

async function process_page_essentials({
  focusTableData,
  pageData,
  essentialsData,
  siteInfo,
}: {
  focusTableData: Data;
  pageData?: any;
  essentialsData: string[];
  siteInfo: BrandType;
}) {
  let data: any = {};

  try {
    for (let j = 0; j < essentialsData.length; j++) {
      switch (essentialsData[j]) {
        case 'packages':
          const defaultPackages: any = await fetchPaginatedData({
            collectionName: 'products',
            conditions: { brandId: siteInfo.id, status: 'published', type: 'package' },
            limit: '50',
          });

          let packs: any[] = [];

          if (Array.isArray(defaultPackages.data)) {
            for (let k = 0; k < defaultPackages.data.length; k++) {
              const pack = await modProduct({
                product: defaultPackages.data[k],
                siteInfo,
              });
              packs.push(pack);
            }
          }

          data['packages'] = packs;
          break;

        case 'blog_posts':
          const blogPosts: any = await fetchPaginatedData({
            collectionName: 'posts',
            conditions: { brandId: siteInfo.id, status: 'published' },
          });
          data['blog_posts'] = blogPosts;
          break;

        case 'countries':
          const countries: any = await getCountries();
          data['countries'] = countries;
          break;

        case 'subCourses':
          if (focusTableData.fulFilmentType === 'subCourses') {
            if (!isNull(focusTableData.subCoursesIds)) {
              const courseIds = focusTableData?.subCoursesIds?.map((course: Data) => course.id);

              const subCourses: any = await fetchDataWithConditions('products', {
                $or: courseIds?.map((id) => ({ id })),
              });

              data['subCourses'] = subCourses;
            }
          }
          break;
      }
    }
    return data;
  } catch (error) {
    console.error(error);
    return data;
  }
}

export async function callback(target?: any) {
  return api_response({ status: true, data: { target } });
}

export async function server_get_views({ table, slug }: { table: string; slug: string }) {
  const brand = await getBrandInfo();
  const auth = await getAuthSessionData();
  let params = [slug];
  const seg1 = params[0] ?? 'home';

  let msg = '';

  let data: any = {};
  let rendererData: any = {};
  let pageEssentials: any = {};
  let tables = ['pages', 'posts', 'products'];

  if (seg1.replace(/-/g, '').length >= 3) {
    const isHome = seg1 === 'home';
    const slug1 = isHome ? `user-home-${brand.type}` : `user-${seg1}`;
    const slug2 = isHome ? `default-home-${brand.type}` : `default-${seg1}`;
    const slug3 = slug2;

    const finalConditions = {
      $or: [
        { brandId: brand.id, slug: slug1 },
        { brandId: brand.brandId, slug: slug2 },
        { brandId: MASTER_BRAND_ID, slug: slug3 },
        { brandId: brand.id, slug: seg1 },
      ],
    };

    const res = await server_dynamic_get_data({
      conditions: finalConditions,
      limit: '1',
      table: table ?? '',
      tables,
      renderPage: {} as any,
      essentials: [],
    });

    const pageData = await res.json();

    if (pageData?.status && pageData?.data) {
      data = pageData?.data[0] || {};
      rendererData = pageData.renderData || {};
      pageEssentials = pageData.pageEssentials || {};
    }
  }

  if (isNull(data)) {
    msg = 'Page data not found';
  } else if (isNull(rendererData)) {
    msg = 'Page rendererData not found';
  }

  const fullData = { data, pageEssentials, rendererData, brand, auth, seg1 };

  !isNull(data) && globalCacheSave({ slug, data: fullData });

  return response({
    skipCookies: true,
    skipCSRF: true,
    status: !isNull(data),
    statusCode: httpStatusCodes[!isNull(data) ? 200 : 404],
    data: fullData,
    msg,
    cacheControl: 'public, max-age=120, stale-while-revalidate=30',
  });
}
