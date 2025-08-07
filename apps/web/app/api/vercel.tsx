// utils/vercelDomainHelper.ts
import { getSiteKeys } from "@/app/helpers/getSiteKeys";
import { invalid_response } from "@/app/helpers/invalid_response";

const VERCEL_API_BASE_URL = "https://api.vercel.com/v10/projects";
const projectId = "prj_kJwUnflNEZcl3iXYfVA1zPExUiaP";

async function fetchVercelAPI(endpoint: string, method: string, body?: any) {
  try {
    const siteKeys = await getSiteKeys();
    const vercelToken = siteKeys.vercelToken;
    const url = `${VERCEL_API_BASE_URL}/${projectId}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error interacting with Vercel API:", error);
    return invalid_response("Error interacting with Vercel API");
  }
}

// List domains
export async function listDomains() {
  return await fetchVercelAPI("/domains", "GET");
}

// Add a new domain
export async function addDomain(domain: string) {
  return await fetchVercelAPI("/domains", "POST", { name: domain });
}

// Remove a domain
export async function removeDomain(domain: string) {
  return await fetchVercelAPI(`/domains/${domain}`, "DELETE");
}

// Verify domain ownership
export async function verifyDomain(domain: string) {
  return await fetchVercelAPI(`/domains/${domain}/verify`, "POST");
}

// Verify domain ownership
export async function domainInfo(domain: string) {
  return await fetchVercelAPI(`/domains/status?name=${domain}`, "GET");
}
