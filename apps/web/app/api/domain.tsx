import { getAuthSessionData } from '@/app/controller/auth_controller';
import { invalid_response } from '@/helpers/invalid_response';
import { isNull } from '@/helpers/isNull';
import { response } from '@/helpers/response';
import { bgPs } from '@/src/constants';
import { updateRecordsForZone } from '@/api/cloudflare';
import { fetchDataWithConditions, updateDataWithConditions } from '@/api/database/connection';
import { server_refresh_domain_status } from '@/api/domains/domain';
import { getCurrentUser } from '@/api/user';
import { DomainOperations } from '@/api/vercel_v2';

export async function server_brand_domain_connection(body: any) {
  try {
    if (isNull(body.action) || !['add', 'remove'].includes(body.action)) {
      return response({ msg: 'action is missing', status: false });
    }

    const session = await getAuthSessionData();

    if (body.action === 'remove') {
      const { data, msg, status } = await brand_domain_connection_remove({ body, session });

      return response({ data, msg, status });
    }

    await server_refresh_domain_status();

    const domainData = await fetchDataWithConditions('domains', {
      domain: body.domain,
      userId: session.userId,
    });

    if (isNull(domainData)) {
      return response({
        status: false,
        msg: 'Domain not found',
      });
    }
    const domain: DomainTypes = domainData[0];

    if (domain.status !== 'active') {
      return response({
        status: false,
        msg: 'Only Active Domain can be connected',
      });
    }

    const { data, msg, status } = await brand_domain_connection_add({ body, session });

    return response({ data, msg, status });
  } catch (error) {
    console.error(error);
    return invalid_response('error connecting domain');
  }
}

export async function brand_domain_connection_remove({
  body,
  session,
}: {
  body: any;
  session: AuthModel;
}) {
  let result: any = {};

  const brands: BrandType[] = await fetchDataWithConditions('brands', { userId: session.userId });

  if (!isNull(brands[0])) {
    const brand = brands[0];

    // Ensure domains is an array
    const existingDomains = Array.isArray(brand.domains) ? brand.domains : [];

    // Remove the domain if it exists
    const updatedDomains = existingDomains.filter((d) => d !== body.domain);

    DomainOperations.removeDomain(body.domain);
    DomainOperations.removeDomain(`*.${body.domain}`);

    const update = await updateDataWithConditions({
      collectionName: 'brands',
      conditions: { userId: session.userId },
      updateFields: { id: brand.id, domains: updatedDomains },
    });

    const updateDomains = await updateDataWithConditions({
      collectionName: 'domains',
      conditions: { id: body.id },
      updateFields: { id: body.id, connected: false },
    });

    if (update.status) {
      result.status = true;
      result.msg = `${body.domain} removed`;
      return result;
    } else {
      result.status = false;
      result.msg = `Failed to remove ${body.domain}`;
      return result;
    }
  }

  result.status = false;
  result.msg = 'Brand not found';
  return result;
}

export async function brand_domain_connection_add({
  body,
  session,
}: {
  body: any;
  session: AuthModel;
}) {
  let result: any = {};

  const brands: BrandType[] = await fetchDataWithConditions('brands', { userId: session.userId });

  if (!isNull(brands[0])) {
    const brand = brands[0];

    if (body.type === 'addon') {
      const addResult = await addOrUpdateCustomDomain({
        domain: body,
        withWildcard: bgPs.includes(body.domain),
      });
      if (!addResult.verified) {
        console.error(addResult.msg);
        result.status = true;
        result.code = 'pending';
        result.msg = 'pending verification';
        return result;
      }
    }

    // Ensure domains is an array
    const existingDomains = Array.isArray(brand.domains) ? brand.domains : [];

    // Prevent duplicates
    const updatedDomains = Array.from(new Set([...existingDomains, body.domain]));

    const update = await updateDataWithConditions({
      collectionName: 'brands',
      conditions: { userId: session.userId },
      updateFields: { id: brand.id, domains: updatedDomains },
    });

    const updateDomains = await updateDataWithConditions({
      collectionName: 'domains',
      conditions: { id: body.id },
      updateFields: { id: body.id, connected: true },
    });

    if (update.status) {
      result.status = true;
      result.msg = `${body.domain} added`;
      return result;
    } else {
      result.status = false;
      result.msg = `Failed to add ${body.domain}`;
      return result;
    }
  }

  result.status = false;
  result.msg = 'Brand not found';
  return result;
}

export async function addOrUpdateCustomDomain({
  domain,
  withWildcard = false,
}: {
  domain: DomainTypes;
  withWildcard?: boolean;
}): Promise<{ status: boolean; data?: any; msg?: string; verified: boolean; error?: any }> {
  try {
    const domainName = domain?.domain;
    if (!domainName) {
      return { status: false, msg: 'Invalid domain provided', verified: false };
    }

    // Add the domain
    const addNew = await DomainOperations.addDomain(domainName);

    // Optionally add wildcard domain
    if (withWildcard) {
      await DomainOperations.addDomain(`*.${domainName}`);
    }

    const data: any = addNew?.data || {};
    const verifications = Array.isArray(data.verification) ? data.verification : [];

    const isVerified =
      data?.isVerified || (data?.error && data?.error.code === 'domain_already_in_use');

    if (isVerified) {
      return { status: true, data, msg: 'Domain added and verified successfully', verified: true };
    } else {
      let records: any[] = [];
      for (const v of verifications) {
        records.push({
          type: v.type,
          name: v.domain,
          content: v.value,
          proxied: false,
          reason: 'pending_domain_verification',
        });
      }

      const updateRecords = await updateRecordsForZone({
        domain: domainName,
        records,
        clearExisting: false,
      });

      return {
        status: updateRecords.status,
        data: { verifications },
        verified: false,
        msg: 'pending verification',
      };
    }
  } catch (error: any) {
    console.error('❌ Error in addOrUpdateCustomDomain:', error);
    return {
      status: false,
      msg: error?.message || 'Failed to add domain to Cloudflare',
      error,
      verified: false,
    };
  }
}

export async function server_custom_domain_actions(body: any) {
  try {
    if (isNull(body.action) || isNull(body.base) || isNull(body.domain)) {
      return response({ msg: 'action is missing', status: false });
    }

    const { brand } = await getCurrentUser();

    let newBrandData: BrandType = { id: brand?.id };

    if (body.base === 'primary') {
      newBrandData.domain = body?.domain?.domain;
    } else if (body.base === 'addonForSubDomains') {
      newBrandData.addonForSubDomains = body.action === 'add' ? body?.domain?.domain : '';
    }

    const result = await updateDataWithConditions({
      collectionName: 'brands',
      conditions: { id: brand?.id },
      updateFields: newBrandData,
    });

    return response({ status: result.status, msg: result.status ? 'success' : 'error' });
  } catch (error) {
    console.error(error);
    return invalid_response('error setting domain action domain');
  }
}
