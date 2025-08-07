import axios, { AxiosError } from 'axios';

interface CloudflareRequestBody {
  domain: string;
  records: DNSRecord[];
}

interface CloudflareResponse {
  status: boolean;
  msg: string;
  name_servers?: string[];
  error?: any;
}

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const NEXT_PUBLIC_BASE_EMAIL = process.env.NEXT_PUBLIC_BASE_EMAIL || '';
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || '';

// Types
interface DNSRecord {
  type: string;
  name: string;
  content: any;
  ttl?: number;
  proxied?: boolean;
  priority?: number;
}

interface CloudflareRequestBody {
  domain: string;
  records: DNSRecord[];
}

interface CloudflareResponse {
  msg: string;
  status: boolean;
  error?: any;
  name_servers?: string[];
}

// Create axios instance helper
function createCloudflareAxiosInstance() {
  return axios.create({
    baseURL: CLOUDFLARE_API_BASE,
    headers: {
      'X-Auth-Email': NEXT_PUBLIC_BASE_EMAIL,
      'X-Auth-Key': CLOUDFLARE_API_KEY,
      'Content-Type': 'application/json',
    },
  });
}

// Get or create zone
async function getOrCreateZone(axiosInstance: any, domain: string) {
  // Get existing zones
  const zonesResponse = await axiosInstance.get('/zones', {
    params: { name: domain },
  });

  if (!zonesResponse.data.success) {
    throw new Error('Failed to fetch zones');
  }

  let zone = zonesResponse.data.result.find((z: { name: string }) => z.name === domain);

  if (!zone) {
    // Get account ID first
    const accountsResponse = await axiosInstance.get('/accounts');
    if (!accountsResponse.data.success || !accountsResponse.data.result[0]) {
      throw new Error('Failed to fetch account information');
    }

    // Create zone
    const createZoneResponse = await axiosInstance.post('/zones', {
      name: domain,
      account: { id: accountsResponse.data.result[0].id },
    });

    if (!createZoneResponse.data.success) {
      throw new Error(`Failed to create zone for domain "${domain}"`);
    }

    zone = createZoneResponse.data.result;
  }

  return zone;
}

// Clear existing DNS records
async function clearExistingRecords(axiosInstance: any, zoneId: string) {
  const existingRecordsResponse = await axiosInstance.get(`/zones/${zoneId}/dns_records`);

  if (existingRecordsResponse.data.success && existingRecordsResponse.data.result.length > 0) {
    const deletePromises = existingRecordsResponse.data.result.map((record: any) =>
      axiosInstance.delete(`/zones/${zoneId}/dns_records/${record.id}`),
    );
    await Promise.all(deletePromises);
  }
}

// Build record payload based on record type
function buildRecordPayload(record: DNSRecord) {
  const recordPayload: any = {
    type: record.type,
    name: record.name,
    ttl: record.ttl || 1,
  };

  // Handle different content types based on record type
  if (record.type === 'CAA') {
    // CAA records need structured data
    recordPayload.data = record.content;
  } else {
    // All other records use content field
    recordPayload.content = record.content;
  }

  // Add proxied field only for record types that support it
  if (record.type === 'A' || record.type === 'AAAA' || record.type === 'CNAME') {
    recordPayload.proxied = record.proxied || false;
  }

  // Add priority field only for record types that require it
  if (record.type === 'MX' || record.type === 'SRV') {
    recordPayload.priority = record.priority;
  }

  return recordPayload;
}

// Update DNS records for a zone

// Main function to add domain to Cloudflare
export async function addDomainToCloudflare({
  body,
}: {
  body: CloudflareRequestBody;
}): Promise<CloudflareResponse> {
  const { domain, records } = body;

  if (!domain || !records?.length) {
    return { msg: 'Missing required parameters', status: false };
  }

  const axiosInstance = createCloudflareAxiosInstance();

  try {
    // Get or create zone
    const zone = await getOrCreateZone(axiosInstance, domain);

    // Clear existing DNS records
    await clearExistingRecords(axiosInstance, zone.id);

    // Update DNS records
    const { success, results } = await updateDNSRecords({
      zoneId: zone.id,
      records,
      axiosInstance,
    });

    // Get final nameservers
    const updatedZoneResponse = await axiosInstance.get(`/zones/${zone.id}`);

    if (!success) {
      const failedRecords = results.filter((r) => !r.success);
      return {
        status: false,
        msg: 'Some DNS records failed to update',
        error: failedRecords,
        name_servers: updatedZoneResponse.data.result.name_servers,
      };
    }

    return {
      msg: 'DNS records updated successfully',
      name_servers: updatedZoneResponse.data.result.name_servers,
      status: true,
    };
  } catch (error) {
    console.error('Error updating DNS records:', error);

    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data
      ? JSON.stringify(axiosError.response.data)
      : axiosError.message;

    return {
      status: false,
      msg: `An error occurred: ${errorMessage}`,
      error: axiosError.response?.data || error,
    };
  }
}

export async function updateDNSRecords({
  zoneId,
  records,
  axiosInstance,
}: {
  zoneId: string;
  records: DNSRecord[];
  axiosInstance?: any;
}): Promise<{ success: boolean; results: any[] }> {
  const axios = axiosInstance || createCloudflareAxiosInstance();
  const results = [];

  for (const record of records) {
    try {
      const recordPayload = buildRecordPayload(record);
      const response = await axios.post(`/zones/${zoneId}/dns_records`, recordPayload);

      results.push({
        success: response.data.success,
        record: record.name,
        result: response.data.result,
      });
    } catch (error: any) {
      const errorData = error.response?.data;

      // Check if the error is "identical record already exists" (code 81058)
      const isDuplicateRecord = errorData?.errors?.some((err: any) => err.code === 81058);

      if (isDuplicateRecord) {
        // Silently skip duplicate records - no error logging
        results.push({
          success: true, // Treat as success since record exists
          record: record.name,
          result: 'Record already exists - skipped',
          skipped: true,
        });
      } else {
        console.error(`Error adding record ${record.name}:`, errorData || error);
        results.push({
          success: false,
          record: record.name,
          error: errorData || error,
        });
      }
    }
  }

  // Only count actual failures (not skipped duplicates)
  const failedRecords = results.filter((r) => !r.success && !r.skipped);
  return {
    success: failedRecords.length === 0,
    results,
  };
}

export async function updateRecordsForZone({
  domain,
  records,
  clearExisting = true,
}: {
  domain: string;
  records: DNSRecord[];
  clearExisting?: boolean;
}): Promise<CloudflareResponse> {
  if (!domain || !records?.length) {
    return { msg: 'Missing required parameters', status: false };
  }

  const axiosInstance = createCloudflareAxiosInstance();

  try {
    // Get existing zone
    const zonesResponse = await axiosInstance.get('/zones', {
      params: { name: domain },
    });

    if (!zonesResponse.data.success) {
      return {
        status: false,
        msg: 'Failed to fetch zones',
        error: zonesResponse.data,
      };
    }

    const zone = zonesResponse.data.result.find((z: { name: string }) => z.name === domain);
    if (!zone) {
      return {
        status: false,
        msg: `Zone for domain "${domain}" not found`,
      };
    }

    // Clear existing records if requested
    if (clearExisting) {
      await clearExistingRecords(axiosInstance, zone.id);
    }

    // Update DNS records
    const { success, results } = await updateDNSRecords({
      zoneId: zone.id,
      records,
      axiosInstance,
    });

    // Get final nameservers
    const updatedZoneResponse = await axiosInstance.get(`/zones/${zone.id}`);

    if (!success) {
      const failedRecords = results.filter((r) => !r.success);
      return {
        status: false,
        msg: 'Some DNS records failed to update',
        error: failedRecords,
        name_servers: updatedZoneResponse.data.result.name_servers,
      };
    }

    return {
      msg: 'DNS records updated successfully',
      name_servers: updatedZoneResponse.data.result.name_servers,
      status: true,
    };
  } catch (error) {
    console.error('Error updating DNS records:', error);

    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data
      ? JSON.stringify(axiosError.response.data)
      : axiosError.message;

    return {
      status: false,
      msg: `An error occurred: ${errorMessage}`,
      error: axiosError.response?.data || error,
    };
  }
}

export async function removeDomainFromCloudflare(domain: string): Promise<CloudflareResponse> {
  if (!domain) {
    return { msg: 'Missing domain parameter', status: false };
  }

  const axiosInstance = axios.create({
    baseURL: CLOUDFLARE_API_BASE,
    headers: {
      'X-Auth-Email': NEXT_PUBLIC_BASE_EMAIL,
      'X-Auth-Key': CLOUDFLARE_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  try {
    // Fetch the zone ID for the domain
    const zonesResponse = await axiosInstance.get('/zones', {
      params: { name: domain },
    });

    if (!zonesResponse.data.success) {
      return {
        status: false,
        msg: 'Failed to fetch zones',
        error: zonesResponse.data,
      };
    }

    const zone = zonesResponse.data.result.find((z: { name: string }) => z.name === domain);

    if (!zone) {
      return {
        status: false,
        msg: `Domain "${domain}" not found in Cloudflare zones`,
      };
    }

    // Delete the zone
    const deleteZoneResponse = await axiosInstance.delete(`/zones/${zone.id}`);

    if (!deleteZoneResponse.data.success) {
      return {
        status: false,
        msg: `Failed to remove domain "${domain}" from Cloudflare`,
        error: deleteZoneResponse.data,
      };
    }

    return {
      msg: `Domain "${domain}" successfully removed from Cloudflare`,
      status: true,
    };
  } catch (error) {
    console.error('Error removing domain from Cloudflare:', error);

    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data
      ? JSON.stringify(axiosError.response.data)
      : axiosError.message;

    return {
      status: false,
      msg: `An error occurred: ${errorMessage}`,
      error: axiosError.response?.data || error,
    };
  }
}

// Function to set SSL mode to Full (Strict) for a Cloudflare zone
export async function setSSLModeToFullStrict(domain: string): Promise<any> {
  const axiosInstance = axios.create({
    baseURL: CLOUDFLARE_API_BASE,
    headers: {
      'X-Auth-Email': NEXT_PUBLIC_BASE_EMAIL,
      'X-Auth-Key': CLOUDFLARE_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  try {
    // Get Cloudflare zones
    const zonesResponse = await axiosInstance.get('/zones', {
      params: { name: domain },
    });

    if (!zonesResponse.data.success) {
      return {
        status: false,
        msg: 'Failed to fetch zones',
        error: zonesResponse.data,
      };
    }

    // Find the zone for the domain
    let zone = zonesResponse.data.result.find((z: { name: string }) => z.name === domain);

    if (!zone) {
      // Zone doesn't exist, so create it
      const accountsResponse = await axiosInstance.get('/accounts');
      if (!accountsResponse.data.success || !accountsResponse.data.result[0]) {
        return {
          status: false,
          msg: 'Failed to fetch account information',
          error: accountsResponse.data,
        };
      }

      // Create zone if it doesn't exist
      const createZoneResponse = await axiosInstance.post('/zones', {
        name: domain,
        account: { id: accountsResponse.data.result[0].id },
      });

      if (!createZoneResponse.data.success) {
        return {
          status: false,
          msg: `Failed to create zone for domain "${domain}"`,
          error: createZoneResponse.data,
        };
      }

      zone = createZoneResponse.data.result;
    }

    // Check current SSL setting for the zone
    const sslSettingsResponse = await axiosInstance.get(`/zones/${zone.id}/settings/ssl`);

    if (sslSettingsResponse.data.success) {
      //do nothing
    } else {
      return {
        status: false,
        msg: 'Failed to fetch SSL settings',
        error: sslSettingsResponse.data.errors,
      };
    }

    // Make the API request to update SSL mode to Full (Strict)
    const sslResponse = await axiosInstance.patch(`/zones/${zone.id}/settings/ssl`, {
      value: 'strict', // Changed from 'full_strict' to 'strict'
    });

    if (sslResponse.data.success) {
      return {
        status: true,
        msg: 'SSL mode successfully set to Full (Strict)',
        data: sslResponse.data.result,
      };
    } else {
      return {
        status: false,
        msg: `Failed to set SSL mode: ${JSON.stringify(sslResponse.data.errors)}`,
        error: sslResponse.data,
      };
    }
  } catch (error: any) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data
      ? JSON.stringify(axiosError.response.data)
      : axiosError.message;

    return {
      status: false,
      msg: `An error occurred while setting SSL mode: ${errorMessage}`,
      error: axiosError.response?.data || error,
    };
  }
}

export async function checkDomainStatus(domain: string): Promise<{
  status: boolean;
  isActive: boolean;
  isPaused: boolean;
  activatedOn: string | null;
  msg: string;
  error?: any;
}> {
  const axiosInstance = axios.create({
    baseURL: CLOUDFLARE_API_BASE,
    headers: {
      'X-Auth-Email': NEXT_PUBLIC_BASE_EMAIL,
      'X-Auth-Key': CLOUDFLARE_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  try {
    // Get Cloudflare zones
    const zonesResponse = await axiosInstance.get<{
      success: boolean;
      result: Array<{
        name: string;
        status: string;
        activated_on: string | null;
        paused: boolean;
      }>;
      errors: Array<{
        code: number;
        message: string;
      }>;
    }>('/zones', {
      params: { name: domain },
    });

    if (!zonesResponse.data.success) {
      return {
        status: false,
        isActive: false,
        isPaused: false,
        activatedOn: null,
        msg: 'Failed to fetch domain information',
        error: zonesResponse.data.errors,
      };
    }

    // Find the zone for the domain
    const zone = zonesResponse.data.result.find((z) => z.name === domain);

    if (!zone) {
      return {
        status: true,
        isActive: false,
        isPaused: false,
        activatedOn: null,
        msg: `${domain} not found on Cloudflare`,
      };
    }

    // Check if the domain is active
    const isActive = zone.status === 'active';
    const isPaused = zone.paused;
    const activatedOn = zone.activated_on;

    let statusMessage = '';
    if (isActive && !isPaused) {
      statusMessage = `Domain is active and was activated on ${new Date(
        activatedOn!,
      ).toLocaleDateString()}`;
    } else if (isPaused) {
      statusMessage = 'Domain is paused';
    } else {
      statusMessage = `Domain status is: ${zone.status}`;
    }

    return {
      status: true,
      isActive,
      isPaused,
      activatedOn,
      msg: statusMessage,
    };
  } catch (error: any) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data
      ? JSON.stringify(axiosError.response.data)
      : axiosError.message;

    return {
      status: false,
      isActive: false,
      isPaused: false,
      activatedOn: null,
      msg: `An error occurred while checking domain status: ${errorMessage}`,
      error: axiosError.response?.data || error,
    };
  }
}
