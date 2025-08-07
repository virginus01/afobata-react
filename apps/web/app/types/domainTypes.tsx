interface DomainTypes {
  id: string;
  brandId: string;
  createdAt: Date;
  createdFrom: string;
  domain: string;
  connected?: boolean;
  expiresAt: string;
  lastUpdatedFrom: string;
  mode: 'test' | 'live';
  name: string;
  apexDomain: string;
  status: 'pending' | 'inactive' | 'active' | 'expired';
  nameserver: string[];
  type: 'sub' | 'custom' | string;
  updatedAt: Date;
  userId: string;
}
