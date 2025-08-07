import { centralDomain } from '@/app/src/constants';
import { isNull } from '@/app/helpers/isNull';

export const generateDNSRecords = ({ domain }: { domain: string }): DNSRecord[] => {
  const dnsRecords: DNSRecord[] = [
    {
      type: 'A',
      name: '@',
      content: '76.76.21.21',
      proxied: false, // disabled proxy
      ttl: 1,
    },
    {
      type: 'A',
      name: 'www',
      content: '76.76.21.21',
      proxied: false, // disabled proxy
      ttl: 1,
    },
    {
      type: 'A',
      name: '*',
      content: '76.76.21.21',
      proxied: false, // disabled proxy
      ttl: 1,
    },
    {
      type: 'MX',
      name: '@',
      content: 'mail.' + domain,
      priority: 10,
      proxied: false,
      ttl: 1,
    },
    {
      type: 'A',
      name: 'mail',
      content: '76.76.21.21',
      proxied: false,
      ttl: 1,
    },
    {
      type: 'TXT',
      name: '@',
      content: 'v=spf1 include:_spf.google.com ~all',
      proxied: false,
      ttl: 1,
    },
    {
      type: 'TXT',
      name: '_dmarc',
      content: 'v=DMARC1; p=none;',
      proxied: false,
      ttl: 1,
    },
    {
      type: 'CAA',
      name: '@',
      content: {
        flags: 0,
        tag: 'issue',
        value: 'letsencrypt.org',
      },
      proxied: false,
      ttl: 1,
    },
  ];

  return dnsRecords;
};

export const generateDNSCNAMERecords = ({ domain }: { domain: string }): DNSRecord[] => {
  const dnsRecords: DNSRecord[] = [
    {
      type: 'CNAME',
      name: '@',
      content: 'cname.vercel-dns.com',
      proxied: false,
      ttl: 1,
    },
    {
      type: 'CNAME',
      name: '*',
      content: 'cname.vercel-dns.com',
      proxied: false,
      ttl: 1,
    },
    {
      type: 'CNAME',
      name: 'www',
      content: 'cname.vercel-dns.com',
      proxied: false,
      ttl: 1,
    },
    // Delegate all subdomains to Vercel's nameservers
    {
      type: 'NS',
      name: '*',
      content: 'ns1.vercel-dns.com',
      proxied: false,
      ttl: 3600,
    },
    {
      type: 'NS',
      name: '*',
      content: 'ns2.vercel-dns.com',
      proxied: false,
      ttl: 3600,
    },
  ];

  return dnsRecords;
};

// Main Cloudflare Function

export function getPath({ siteInfo, path }: { siteInfo: BrandType; path: string }) {
  if (!isNull(centralDomain)) {
    return `${centralDomain}/${path}`;
  } else {
    return `${siteInfo.domain}/${path}`;
  }
}

export function getSubDomain({ siteInfo, subDomain }: { siteInfo: BrandType; subDomain: string }) {
  if (!isNull(centralDomain)) {
    return `${subDomain}.${centralDomain}`;
  } else {
    return `${subDomain}.${siteInfo.domain}`;
  }
}
