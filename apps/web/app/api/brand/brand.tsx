'use server';

import { fetchDataWithConditions, upsert } from '@/app/api/database/mongodb';
import { get_user } from '@/app/api/user';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { response } from '@/app/helpers/response';
import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { isNull } from '@/app/helpers/isNull';
import { centralDomain, liveDomain } from '@/app/src/constants';
import { headers } from 'next/headers';
import { parseUrl } from '@/middleware/requestDomain';
import { NextRequest } from 'next/server';
import { Brand } from '@/app/models/Brand';
import { cache } from 'react';
import { httpStatusCodes } from '@/app/helpers/status_codes';
import slugify from 'slugify';
import { revalidatePath } from 'next/cache';
import { globalCacheDelete, globalCacheSave } from '@/app/helpers/cdn';
import { lowercase } from '@/app/helpers/lowercase';
import { randomNumber } from '@/app/helpers/randomNumber';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { getDId } from '@/app/helpers/getDId';

export async function server_create_update_user_brand({
  data,
  siteInfo,
}: {
  data: BrandType;
  siteInfo: BrandType;
}) {
  try {
    const finalData = beforeUpdate(data, true);

    const update = await upsert(finalData, 'brands', true, siteInfo!);

    if (!isNull(update.status)) {
      const domain = slugify(
        process.env.NODE_ENV === 'production' ? finalData.domain : 'localhost',
        {
          lower: true,
          strict: true,
        },
      );

      let slugs: string[] = [`${finalData.slug}-brand`];

      if (domain) {
        slugs.push(`${domain}-brand`);
      }

      globalCacheDelete({ slugs });

      revalidatePath('/');
      return api_response({
        status: true,
        success: true,
        data: {},
      });
    } else {
      return invalid_response('brand not updated try again', 200);
    }
  } catch (error) {
    console.error('Error updating brand:', error);
    return invalid_response('Error updating brand', 401);
  }
}

export async function server_get_user_brand({ userId }: { userId: string }) {
  try {
    let conditions: any = { userId: userId };
    let code = 'user';

    const isUserAdmin = userId === 'admin';

    if (isUserAdmin) {
      conditions = { userId: 'admin' };
      code = 'admin';
    }

    let response = await fetchDataWithConditions('brands', conditions);
    let brand = response[0];

    if (!isNull(brand)) {
      return api_response({
        status: true,
        success: true,
        data: brand || null,
        code,
      });
    } else {
      return invalid_response('no brand found', 200);
    }
  } catch (error) {
    console.error('Error fetching brand:', error);
    return invalid_response('Error getting brand', 401);
  }
}

export async function get_site_info(
  context: any,
  tenantId?: string,
  request?: NextRequest,
): Promise<BrandType> {
  try {
    if (tenantId) {
      context = {
        context: {
          params: {
            tenant: tenantId,
          },
        },
      };
    }
    const siteInfoRes = await server_get_site_info(context, false, request);
    const siteInfoRR = await siteInfoRes.json();
    return siteInfoRR.data || {};
  } catch (error) {
    console.error(error);
    return {};
  }
}

export async function server_get_site_info(context: any, cdn?: boolean, request?: NextRequest) {
  try {
    let siteInfo = await getBrandInfo(context, false);

    if (isNull(siteInfo)) {
      return response({
        skipCookies: true,
        skipCSRF: true,
        statusCode: httpStatusCodes[500],
        msg: 'Brand not found',
        status: false,
      });
    }

    if (cdn) {
      globalCacheSave({ slug: 'brand', data: siteInfo });
    }

    return response({
      skipCookies: true,
      skipCSRF: true,
      status: true,
      data: siteInfo || {},
      cacheControl: 'public, max-age=3600, stale-while-revalidate=3600, s-maxage=120',
    });
  } catch (error) {
    console.error('Error fetching brand:', error);

    return invalid_response('Error fetching brand');
  }
}

export async function server_get_brand_parents({ context }: { context: any }) {
  let siteInfo = await getBrandInfo(context);

  if (!isNull(siteInfo)) {
    let conditions: any = { isDefault: true };

    const [masterBrandData] = await fetchDataWithConditions('brands', conditions);

    if (isNull(masterBrandData)) {
      return invalid_response('master brand not fetched');
    }

    const { data: masterBrandOwner } = await get_user(masterBrandData.id);

    if (isNull(masterBrandOwner)) {
      //  return invalid_response("master brand owner not fetched");
    }

    siteInfo.masterBrandData = {
      ...masterBrandData,
      ownerData: masterBrandOwner,
    };

    if (siteInfo.brandId) {
      conditions = { id: siteInfo.brandId };
      const [parentBrand]: BrandType[] = await fetchDataWithConditions('brands', conditions);

      conditions = { id: parentBrand.brandId };
      const [parentParentBrand]: BrandType[] = await fetchDataWithConditions('brands', conditions);

      if (isNull(parentParentBrand)) {
        return invalid_response('parent brand not fetched');
      }

      const parentBrandBrand = await fetchDataWithConditions('brands', {
        id: parentParentBrand.brandId,
      });
      const { data: parentBrandOwner } = await get_user({
        id: parentParentBrand.userId!,
        siteInfo: parentBrandBrand,
      });

      if (isNull(parentBrandOwner)) {
        //  return invalid_response("parent brand owner not fetched");
      }

      siteInfo.parentBrandData = {
        ...parentBrand,
        ownerData: parentBrandOwner,
      };
    }

    return api_response({ data: siteInfo, status: true, success: true });
  } else {
    return invalid_response('no brand info');
  }
}

export async function server_ping_brand(id: string) {
  const siteInfo: BrandType = await getBrandInfo();

  let response: any = {};

  if (siteInfo && [siteInfo.id, siteInfo.slug].includes(id)) {
    response.status = true;
    response.data = {
      domain: siteInfo.domain || siteInfo.subDomain || siteInfo.slug,
    };
  } else {
    response.status = false;
    response.data = {};
  }

  return api_response(response);
}

export async function server_get_parents({ brandId }: { brandId: string }): Promise<BrandType> {
  try {
    if (isNull(brandId)) {
      return invalid_response('brandId missing at get parents', 200);
    }

    const data = await getBrandParents({ brandId });

    return api_response({
      data,
      status: true,
      sucess: true,
    });
  } catch (error) {
    console.error(error);
    return invalid_response('error while geting parent brands');
  }
}

export async function getBrandParents({
  brandId,
}: {
  brandId: string;
}): Promise<{ master: BrandType; parent: BrandType; others: BrandType[] }> {
  try {
    if (!brandId) {
      throw Error('brand Id missing in get parents');
    }

    let others: BrandType[] = [];
    const [brand]: BrandType[] = await fetchDataWithConditions('brands', {
      $or: [{ id: brandId }, { slug: brandId }],
    });

    const master: BrandType = await getMasterBrandInfo();
    const parent: BrandType = await getParentBrandInfo(brand);

    if (isNull(master)) {
      throw Error("can't get master Brand");
    }

    if (isNull(parent)) {
      throw Error("can't get parent Brand");
    }

    return { master, parent, others };
  } catch (error) {
    throw Error(error as string);
  }
}
export async function getParentBrandInfo(brand: BrandType): Promise<BrandType> {
  let response: BrandType = {};

  try {
    if (!isNull(brand.brandId)) {
      [response] = await fetchDataWithConditions('brands', {
        id: brand.brandId,
      });

      if (!isNull(response)) {
        const { data: owner } = await get_user({
          id: response.userId!,
          siteInfo: response,
        });
        if (owner) {
          response = { ...response, ownerData: owner };
        }
      }
    }

    return response || {};
  } catch (error) {
    console.error('Error in getParentBrandInfo:', error);
    return response;
  }
}

export async function getMasterBrandInfo(): Promise<BrandType> {
  let response: BrandType = {};

  try {
    [response] = await fetchDataWithConditions('brands', {
      isDefault: true,
    });

    if (!isNull(response) && !isNull(response.id)) {
      const { data: owner } = await get_user({
        id: response.userId!,
        siteInfo: response,
      });
      if (!isNull(owner)) {
        response = { ...response, ownerData: owner };
      }
    }

    return response;
  } catch (error) {
    console.error('Error in getMasterBrandInfo:', error);
    return response;
  }
}

export const getBrandInfo = cache(
  async (context?: any, withUser = false, request?: NextRequest): Promise<Brand | any> => {
    let brand: BrandType = {};

    try {
      const params = context?.params ? await context.params : {};
      const tenantId = params?.tenant ?? '';

      const headersList = await headers();
      const domain = parseUrl(headersList, request);

      if (isNull(domain.hostname)) {
        console.error('Host name not found in domain:', domain);
        throw new Error('Host name not found');
      }

      const brandQueryParams = [
        ...(tenantId && tenantId !== 'none' ? [{ slug: tenantId }, { id: tenantId }] : []),
        ...(domain.firstParam ? [{ slug: domain.firstParam }, { id: domain.firstParam }] : []),
        ...(domain.subdomain
          ? [{ subDomain: domain.subdomain }, { slug: domain.subdomain }, { id: domain.subdomain }]
          : []),
        ...(domain.hostname ? [{ domain: domain.hostname }] : []),
        ...(domain.hostname ? [{ domains: { $in: [domain.hostname] } }] : []),
        ...(['localhost', 'local'].includes(domain.hostname) ? [{ domain: liveDomain }] : []),
      ];

      if (brandQueryParams.length > 0) {
        const brandR = await fetchBrand({ $or: brandQueryParams }, withUser);
        if (!isNull(brandR)) {
          brand = brandR;
        }
      }

      if (isNull(brand)) {
        console.error('Error fetching brand with', { $or: brandQueryParams });
      }

      return brand;
    } catch (error: any) {
      console.error('Error in getBrandInfo:', error.message, error.stack);
      return brand;
    }
  },
);

export async function fetchBrand(
  conditions: Record<string, any>,
  withUser: boolean = false,
): Promise<BrandType> {
  let response: BrandType = {};
  try {
    const res = await fetchDataWithConditions('brands', conditions, {}, true);

    if (Array.isArray(res)) {
      response = res[0];
    }

    if (!isNull(response) && response.userId && withUser) {
      const { data: userData } = await get_user({
        id: response.userId!,
        siteInfo: response,
      });

      if (isNull(userData)) {
        console.error('brand owner not fetched', response);
      }

      if (userData) {
        const shareValue = Number(userData?.wallet?.shareValue ?? 0);
        const childrenMille = Number(response.childrenMille ?? 1);

        let costPerUnit = Math.max(0, shareValue / childrenMille);

        let costPerMille = Math.max(0, costPerUnit * 1000);

        response.ownerData = userData;
        response.costPerUnit = costPerUnit;
        response.costPerMille = costPerMille;
      }
    }
    return response;
  } catch (error) {
    console.error(error);
    return response;
  }
}

export async function server_brand_setup({ body }: { body: any }) {
  try {
    const siteInfo: BrandType = await getBrandInfo();

    const existingBrand = await fetchDataWithConditions('brands', { slug: lowercase(body.slug) });

    if (!isNull(existingBrand)) {
      return response({ status: false, msg: 'Brand with the url already exist' });
    }

    const domain = lowercase(`${body.slug}.${siteInfo?.addonForSubDomains || centralDomain || ''}`);
    const existingDomain = await fetchDataWithConditions('domains', { domain });

    if (!isNull(existingDomain)) {
      return response({ status: false, msg: 'Brand with the sub domain already exist' });
    }

    const session: AuthModel = await getAuthSessionData();
    const hash = getDId({ userId: session?.userId ?? '', brandId: siteInfo.id! });

    const createB = await createBrand({ session, siteInfo, hash, domain, body });
    return response(createB);
  } catch (error) {
    console.error(error);
    return invalid_response('Error creating brand');
  }
}

export async function createBrand({
  domain,
  hash,
  body,
  siteInfo,
  session,
}: {
  domain: string;
  hash: string;
  body: any;
  siteInfo: BrandType;
  session: AuthModel;
}) {
  const data = {
    id: randomNumber(10),
    domain,
    hash,
    name: body.name,
    slug: lowercase(body.slug),
    brandId: siteInfo.id,
    userId: session.userId,
    uid: session.id,
    profiles: ['custom'],
    logo: siteInfo.logo,
    icon: siteInfo.icon,
    email: session.email,
    parentCompanyId: body?.parentCompanyId ?? '',
    subscriptionId: body?.subscriptionId ?? '',
    type: body.type, //todo: check if user is eligible for type
  };

  const result = await upsert(data, 'brands', true, {});
  return {
    data,
    status: result.status,
    msg: result.status ? 'Business Account Created' : 'Error: Please try again or contact us',
  };
}
