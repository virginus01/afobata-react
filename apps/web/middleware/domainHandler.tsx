import { NextRequest, NextResponse } from "next/server";

export async function domainHandler(req: NextRequest) {
  const { hostname } = req.nextUrl;

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  const isLocalhost = hostname === "localhost" || "172.20.10.3";
  const isSubdomain = isLocalhost ? false : hostname.endsWith(`.${baseDomain}`);

  const domainInfo = { user_id: 0, domain: baseDomain };

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${baseDomain}`, "");
    domainInfo.user_id = 1;
    domainInfo.domain = `${subdomain}.${baseDomain}`;
  } else if (hostname === baseDomain || isLocalhost) {
    domainInfo.user_id = 1;
    domainInfo.domain = isLocalhost ? "localhost" : hostname;
  } else {
    domainInfo.user_id = 0;
    domainInfo.domain = baseDomain;
  }

  const response = NextResponse.next();
  response.headers.set("x-hostname", hostname);

  (req as any).userDomain = domainInfo;

  return response;
}
