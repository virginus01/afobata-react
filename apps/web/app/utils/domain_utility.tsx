const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "afobata.com";

type DomainType = "subdomain" | "customDomain" | "primaryDomain";

interface DomainInfo {
  type: DomainType;
  value: string;
}

export function getDomainInfo(host: string | null): DomainInfo {
  if (!host) {
    return { type: "primaryDomain", value: BASE_DOMAIN };
  }

  // Remove port if present
  const hostname = host.split(":")[0];

  // Check if it's a subdomain of the base domain
  const subdomainRegex = new RegExp(
    `^(?<subdomain>[^.]+)\\.${BASE_DOMAIN.replace(".", "\\.")}$`
  );
  const subdomainMatch = hostname.match(subdomainRegex);

  if (subdomainMatch && subdomainMatch.groups) {
    return { type: "subdomain", value: subdomainMatch.groups.subdomain };
  }

  // Check if it's the primary domain
  if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`) {
    return { type: "primaryDomain", value: BASE_DOMAIN };
  }

  // If it's neither a subdomain nor the primary domain, it's a custom domain
  return { type: "customDomain", value: hostname };
}
