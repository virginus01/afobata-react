import { getSiteKeys } from '@/app/helpers/getSiteKeys';
import { isNull } from '@/app/helpers/isNull';

// Configuration constants
const VERCEL_API_BASE = 'https://api.vercel.com';
const TEAM_SLUG = 'afobatas-projects';
const projectId = 'prj_kJwUnflNEZcl3iXYfVA1zPExUiaP';

async function fetchVercelAPI<T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  apiVersion: 'v9' | 'v10' | 'v4' = 'v10',
): Promise<any> {
  try {
    const siteKeys = await getSiteKeys();
    const vercelToken = siteKeys.vercelToken;

    // Construct the URL for the API request

    const url = `${VERCEL_API_BASE}/${apiVersion}${endpoint}`;

    // Make the API call
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: !isNull(body) ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorBody = await response.json();

      return {
        status: false,
        msg: `Vercel API responded with ${response.status}`,
        data: errorBody,
      };
    }

    const data = await response.json();
    return { status: true, msg: 'sucess', data };
  } catch (error: any) {
    console.error('Error interacting with Vercel API:', error);
    return {
      status: false,
      msg: `Vercel API responded with ${error.message}`,
      data: {},
    };
  }
}

export const DomainOperations = {
  async listDomains(): Promise<VercelModel> {
    return fetchVercelAPI<VercelModel>(`/projects/${projectId}/domains/`, 'GET', {}, 'v9');
  },

  async getDomain(domain: string): Promise<VercelModel> {
    return fetchVercelAPI<VercelModel>(`/projects/${projectId}/domains/${domain}`, 'GET', {}, 'v9');
  },

  async addDomain(domain: string): Promise<VercelModel> {
    return fetchVercelAPI<VercelModel>(`/projects/${projectId}/domains`, 'POST', {
      name: domain,
    });
  },

  async removeDomain(domain: string): Promise<any> {
    return fetchVercelAPI<{}>(`/projects/${projectId}/domains/${domain}`, 'DELETE');
  },

  async verifyDomain(domain: string): Promise<VercelModel> {
    return fetchVercelAPI<VercelModel>(`/projects/${projectId}/domains/${domain}/verify`, 'POST');
  },

  async getDomainStatus(domain: string): Promise<VercelModel> {
    return fetchVercelAPI<VercelModel>(`/domains/status?name=${domain}`, 'GET');
  },

  // New method: Fetch domain configuration including nameservers
  async getDomainInfo(domain: string): Promise<VercelModel> {
    return fetchVercelAPI<VercelModel>(
      `/domains/${domain}/config?slug=${TEAM_SLUG}&strict=true&teamId=${TEAM_SLUG}`,
      'GET',
    );
  },

  // New method: Fetch domain configuration including nameservers
  async getDomainConfig(domain: string): Promise<VercelModel> {
    return fetchVercelAPI<VercelModel>(
      `/domains/${domain}/config?slug=${TEAM_SLUG}&strict=true&teamId=${TEAM_SLUG}`,
      'GET',
    );
  },

  // New method: Fetch domain configuration including nameservers
  async getDNSRecords(domain: string): Promise<any> {
    return fetchVercelAPI<any>(
      `/domains/${domain}/records?slug=${TEAM_SLUG}&strict=true&teamId=${TEAM_SLUG}`,
      'GET',
      {},
      'v4',
    );
  },

  //end
};
