import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { bulkUpsert, fetchDataWithConditions, upsert } from '@/app/api/database/mongodb';
import { addToCurrentDate } from '@/app/helpers/addToCurrentDate';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { isNull } from '@/app/helpers/isNull';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import slugify from 'slugify';
import { lowercase } from '@/app/helpers/lowercase';
import { addDomainToCloudflare, checkDomainStatus } from '@/api/cloudflare';
import { generateDNSCNAMERecords } from '@/api/domains/helper';
import { verifyDomain } from '@/api/vercel';

export async function server_add_or_update_domain(formData: any) {
  try {
    const id = slugify(formData.domain, { lower: true, trim: true, strict: true });
    const domain = lowercase(formData.domain);
    const exist = await fetchDataWithConditions(
      'domains',
      { $or: [{ id }, { domain }] },
      { limit: 1 },
    );

    if (!isNull(exist)) {
      return invalid_response('Domain already exists.', 200);
    }

    if (formData.type === 'sub') {
      const vercelStatus = await verifyDomain(`*.${formData.apexDomain}`);
      if (!vercelStatus?.verified) {
        return invalid_response('Parent domain cannot accept sub domain', 200);
      }
    }

    const session = await getAuthSessionData();

    const expiresAt = formData.type === 'sub' ? addToCurrentDate({ days: 36500 }) : '';
    formData.expiresAt = convertDateTime(expiresAt);
    formData.status = formData.type === 'sub' ? 'active' : 'pending';
    formData.id = id;
    formData.userId = session.userId;
    formData.domain = domain;

    if (formData.type === 'addon') {
      let records: any[] = generateDNSCNAMERecords({ domain: domain! }) || [];
      const clfResult = await addDomainToCloudflare({
        body: { domain: domain!, records },
      });
      if (clfResult.status) {
        formData.nameservers = clfResult.name_servers ?? [];
      } else {
        return api_response({
          status: false,
          data: formData,
          message: clfResult.msg || 'failed to add domain to Cloudflare',
        });
      }
    }

    const result = await upsert({ ...formData }, 'domains', true, {});

    if (!result || !result.status) {
      console.error('Failed to add or update domain:', result.msg || 'Unknown error');
    }

    return api_response({
      status: result.status,
      data: formData,
      message: result.status ? 'Domain updated successfully.' : 'Failed to update domain.',
    });
  } catch (error) {
    console.error('Error updating domain:', error);
    return invalid_response('An error occurred while updating the domain.');
  }
}

export async function server_refresh_domain_status() {
  try {
    let response: any = {};

    const session = await getAuthSessionData();

    const pendingUserDomains = await fetchDataWithConditions('domains', {
      $or: [
        {
          userId: session.userId,
          status: 'pending',
        },
        {
          userId: session.userId,
          connected: false,
        },
      ],
    });

    let domains: any[] = [];

    if (!isNull(pendingUserDomains)) {
      await Promise.all(
        pendingUserDomains.map(async (domain: any) => {
          const domainStatus = await checkDomainStatus(domain.domain);
          if (domainStatus.status && domainStatus.isActive) {
            const vercelStatus = await verifyDomain(domain.domain);
            domains.push({
              ...domain,
              id: domain.id,
              status: 'active',
              connected: vercelStatus.verified ?? false,
              connectionData: { ...vercelStatus, host: 'vercel' },
            });
          }
        }),
      );
    }

    if (domains.length > 0) {
      response = await bulkUpsert(domains, 'domains', false, {});
    } else {
      response = { status: true, data: [], message: 'No domains to update.' };
    }

    return api_response(response);
  } catch (error) {
    console.error('Error updating domain:', error);
    return invalid_response('An error occurred while updating the domain.');
  }
}
