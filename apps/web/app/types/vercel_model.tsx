interface VercelModel {
  status: boolean;
  msg: string;
  data: {
    id: string;
    name: string;
    verified: boolean;
    createdAt: number;
    boughtAt?: number;
    expiresAt?: number;
    domains?: any[];
    nameservers: string[];
    transferInformation?: {
      status: string;
    };
    error?: {
      code: string;
      projectId?: string;
      message: string;
    };

    verificationMethod?: string;
    verificationInfo?: {
      type: string;
      domain: string;
      value: string;
    };

    configuredNameservers?: string[];
    available: boolean;
    verification?: {
      type: string;
      domain: string;
      value: string;
    }[];
    framework?: string;
    gitRepository?: {
      type: string;
      repo: string;
      branch: string;
    };
    rootDirectory?: string;
    serverlessFunctionRegion?: string;
    url: string;
    created: number;
    creator: {
      email: string;
      username: string;
    };
    state: string;
    meta?: Record<string, string>;
  };
}

interface VerificationRecord {
  type: string; // e.g., "TXT"
  domain: string;
  value: string;
  reason?: string; // Optional, as it's not always included
}

interface ExternalVerificationData {
  ns1: string;
  ns2: string;
  or: {
    type: string;
    name: string;
    domain?: string;
    value: string;
  };
}

type VeriData = ExternalVerificationData | undefined;
