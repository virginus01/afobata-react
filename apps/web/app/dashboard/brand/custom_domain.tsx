import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { isNull } from '@/app/helpers/isNull';
import { SectionHeader } from '@/app/src/section_header';
import { CustomButton } from '@/app/widgets/custom_button';
import React, { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUserContext } from '@/app/contexts/user_context';
import { Check, Globe, Plus, RefreshCcw, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  api_brand_domain_connection,
  api_custom_domain_actions,
  api_refresh_domain_status,
} from '@/app/routes/api_routes';
import { clientHeaders } from '@/app/helpers/clientHeaders';
import { clearCache } from '@/app/actions';
import { show_error } from '@/app/helpers/show_error';
import { useBaseContext } from '@/app/contexts/base_context';
import { route_user_page } from '@/app/routes/page_routes';

const StatusIndicator = ({ status, label }: { status: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="text-xs text-muted-foreground font-medium">{label}</div>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              'h-6 w-6 rounded-full flex items-center justify-center',
              status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
            )}
          >
            {status ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {label} is currently {status ? 'active' : 'inactive'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

function CustomDomain() {
  const { essentialData } = useUserContext();
  const { user, siteInfo, brand } = essentialData;
  const { fetchData, refreshKey } = useDynamicContext();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeData, setActiveData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { addRouteData } = useBaseContext();

  const [preferred, setPreferred] = useState<string>(brand?.domain ?? '');
  const [addonForSubDomains, setAddonForSubDomains] = useState<string>(
    brand?.addonForSubDomains ?? '',
  );

  const handleSetPreferred = (domain: DomainTypes) => {
    setPreferred(domain.domain);
  };

  const branDomains = brand?.domains || ['afobata.com'];

  const refreshVerification = async () => {
    const pendingUserDomains = filteredData.filter(
      (domain) => domain.status === 'pending' || !domain.connected,
    );

    if (pendingUserDomains.length === 0) return;

    setRefreshing(true);
    clearCache('domains');

    try {
      const url = await api_refresh_domain_status({ subBase: siteInfo?.slug! });

      const response = await (
        await fetch(url, {
          method: 'GET',
          headers: clientHeaders({ auth: essentialData.auth }),
        })
      ).json();

      const { data, status, msg } = response;

      if (!status) {
        console.error('Domain refresh response:', msg);
      }

      setRefreshing(false);
    } catch (error: any) {
      show_error('error refreshing', error.toString());
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshVerification();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [refreshVerification]);

  useEffect(() => {
    const getData = async () => {
      try {
        const result: any = await fetchData({
          table: 'domains',
          tag: '',
          conditions: { userId: user.id, brandId: brand.id },
          limit: 100,
          sortOptions: {},
          brandSlug: siteInfo?.slug!,
        });

        if (!isNull(result)) {
          setFilteredData(
            result.map((item: any) => ({
              ...item,
            })),
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [refreshing]);

  const handleCustomDomainActions = async ({
    action,
    domain,
    base,
  }: {
    base: string;
    action: any;
    domain: DomainTypes;
  }) => {
    try {
      const url = await api_custom_domain_actions({ subBase: '' });

      const response = await fetch(url, {
        method: 'POST',
        headers: clientHeaders({ auth: essentialData.auth }),
        body: JSON.stringify({ domain, base, action }),
      });

      if (!response.ok) {
        console.error(response.statusText);
        toast.error('error occured. contact us');
        return;
      }

      const { data, msg, status, code } = await response.json();

      if (status) {
        if (base === 'primary') {
          setPreferred(domain.domain);
        } else if (base === 'addonForSubDomains') {
          setAddonForSubDomains(action === 'add' ? domain.domain : '');
        }
      } else {
        toast.error(msg);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error Connecting domain');
    }
  };

  return (
    <div>
      <SectionHeader
        title="Domains"
        rightWidget={
          <div className="flex items-center gap-2">
            <CustomButton
              icon={<Plus size={13} />}
              onClick={() => {
                addRouteData({
                  isOpen: true,
                  href: route_user_page({
                    base: 'domains',
                    action: 'overview',
                    subBase: siteInfo.slug ?? '',
                  }),
                  type: 'user',
                  id: 'domains',
                  action: 'overview',
                  base: 'domains',
                  title: 'Add Custom Domains for your project',
                });
              }}
            >
              Add Domains
            </CustomButton>
          </div>
        }
      >
        <div>
          <div className="flex w-full p-2 items-center justify-between">
            <div className="ml-auto">
              <CustomButton
                icon={<RefreshCcw size={16} />}
                submitting={refreshing}
                style={0}
                onClick={() => {
                  refreshVerification();
                }}
                disabled={refreshing}
              >
                {''}
              </CustomButton>
            </div>
          </div>
          {filteredData?.map((data: DomainTypes, i: number) => {
            return (
              <div className="m-2" key={i}>
                <CustomDomainCard
                  domain={data}
                  brand={brand}
                  addonForSubDomains={addonForSubDomains}
                  preferred={preferred}
                  handleSetPreferred={handleSetPreferred}
                  handleCustomDomainActions={handleCustomDomainActions}
                />
              </div>
            );
          })}
        </div>
      </SectionHeader>
    </div>
  );
}

function CustomDomainCard({
  domain,
  brand,
  preferred,
  addonForSubDomains,
  handleSetPreferred,
  handleCustomDomainActions,
}: {
  domain: DomainTypes;
  brand: BrandType;
  preferred: string;
  addonForSubDomains: string;
  handleSetPreferred: (domain: DomainTypes) => void;
  handleCustomDomainActions: ({
    base,
    action,
    domain,
  }: {
    base: string;
    action: any;
    domain: DomainTypes;
  }) => void;
}) {
  const [connected, setConnected] = useState<boolean>(domain.connected ?? false);
  const { essentialData } = useUserContext();

  const handleConnectDomain = async (e: any) => {
    try {
      const url = await api_brand_domain_connection({ subBase: '' });

      const response = await fetch(url, {
        method: 'POST',
        headers: clientHeaders({ auth: essentialData.auth }),
        body: JSON.stringify({ ...domain, action: e ? 'add' : 'remove' }),
      });

      if (!response.ok) {
        console.error(response.statusText);
        toast.error('error occured. contact us');
        return;
      }

      const { data, msg, status, code } = await response.json();

      if (status) {
        if (code === 'pending') {
          toast.info(msg);
        } else {
          toast.success(msg);
          setConnected(!connected);
        }
      } else {
        toast.error(msg);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error Connecting domain');
    }
  };

  return (
    <>
      <Card className="brand-bg-card brand-text-card bg-card/50 hover:bg-card/80 transition-colors border border-none">
        <CardContent className="p-4">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div>{domain.domain}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs cursor-pointer" htmlFor="connect">
                  connect
                </label>
                <Switch
                  className={`h-3.5 py-0.5 w-9 data-[state=checked]:bg-[hsl(var(--secondary-background-light))]`}
                  id="connect"
                  checked={connected}
                  onCheckedChange={(e) => {
                    handleConnectDomain(e);
                  }}
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <StatusIndicator status={domain.status === 'active'} label="Active" />
                <StatusIndicator
                  status={connected && domain.status === 'active'}
                  label="Connected"
                />
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <label className="text-xs cursor-pointer" htmlFor="addonForSubDomains">
                  addon for subdomains
                </label>
                <Switch
                  className={`h-3.5 py-0.5 w-9 data-[state=checked]:bg-[hsl(var(--primary-background-light))]`}
                  id="addonForSubDomains"
                  checked={addonForSubDomains === domain.domain}
                  onCheckedChange={(e) => {
                    handleCustomDomainActions({
                      base: 'addonForSubDomains',
                      action: e ? 'add' : 'remove',
                      domain,
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs cursor-pointer" htmlFor="preferred">
                  primary
                </label>
                <Switch
                  className={`h-3.5 py-0.5 w-9 data-[state=checked]:bg-[hsl(var(--primary-background-light))]`}
                  id="preferred"
                  checked={preferred === domain.domain}
                  onCheckedChange={(e) => {
                    handleSetPreferred(domain);
                    handleCustomDomainActions({
                      base: 'primary',
                      action: e ? 'add' : 'remove',
                      domain,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default memo(CustomDomain);
