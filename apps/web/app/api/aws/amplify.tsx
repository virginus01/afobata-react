import { getSiteKeys } from '@/app/helpers/getSiteKeys';

const AMPLIFY_API_BASE_URL = 'https://amplify.amazonaws.com'; // Amplify REST API endpoint

async function fetchAmplifyAPI(appId: string, method: string, endpoint: string, body?: any) {
  try {
    const siteKeys = await getSiteKeys();
    const awsToken = siteKeys.awsToken;

    const response = await fetch(`${AMPLIFY_API_BASE_URL}/apps/${appId}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${awsToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred with AWS Amplify API');
    }

    return data;
  } catch (error) {
    console.error('Error interacting with AWS Amplify API:', error);
    throw error;
  }
}

// List domains
export async function listDomains(appId: string) {
  return await fetchAmplifyAPI(appId, 'GET', '/domains');
}

// Add a new domain
export async function addDomain(appId: string, domain: string) {
  return await fetchAmplifyAPI(appId, 'POST', '/domains', {
    domainName: domain,
    enableAutoSubDomain: true,
  });
}

// Remove a domain
export async function removeDomain(appId: string, domain: string) {
  return await fetchAmplifyAPI(appId, 'DELETE', `/domains/${domain}`);
}

// Verify domain ownership
export async function verifyDomain(appId: string, domain: string) {
  const domains = await listDomains(appId);
  const domainDetails = domains.domainAssociations.find(
    (assoc: any) => assoc.domainName === domain,
  );
  if (!domainDetails) {
    throw new Error(`Domain ${domain} is not associated with the app.`);
  }
  return domainDetails.status;
}
