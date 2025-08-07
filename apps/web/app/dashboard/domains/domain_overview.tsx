import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { isNull } from '@/app/helpers/isNull';
import CustomDrawer from '@/app/src/custom_drawer';
import { SectionHeader } from '@/app/src/section_header';
import { CustomButton } from '@/app/widgets/custom_button';
import ListView from '@/app/widgets/listView';
import React, { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddDomain from '@/dashboard/domains/add_domain';
import { api_refresh_domain_status, centralDomain, liveDomain } from '@/app/src/constants';
import { useUserContext } from '@/app/contexts/user_context';
import indexedDB from '@/app/utils/indexdb';
import CustomModal from '@/app/widgets/custom_modal';
import CustomCard from '@/app/widgets/custom_card';
import { CloseButton } from '@headlessui/react';
import { Copy, Plus, RefreshCcw, ShoppingCart } from 'lucide-react';
import { copyToClipboard } from '@/app/helpers/text';
import { clientHeaders } from '@/app/helpers/clientHeaders';
import { show_error } from '@/app/helpers/show_error';
import { clearCache } from '@/app/actions';

function DomainOverview() {
  const { essentialData } = useUserContext();
  const { fetchData, refreshKey } = useDynamicContext();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeData, setActiveData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user, siteInfo, brand } = essentialData;

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
          forceFresh: refreshing,
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

  return (
    <div>
      <SectionHeader
        title="Domains"
        rightWidget={
          <div className="flex items-center gap-2">
            <CustomButton icon={<Plus size={13} />} onClick={() => setAddingDomain(true)}>
              Add Domain
            </CustomButton>
            <CustomButton
              style={2}
              icon={<ShoppingCart size={13} />}
              onClick={() => toast.error('Domain purchase coming soon!')}
            >
              Buy Domain
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

          <ListView
            display={[
              { key: 'status', type: 'string' },
              { key: 'expiresAt', type: 'date', title: 'expires' },
            ]}
            data={filteredData.map((d) => ({ ...d, title: d.domain }))}
            setActiveData={setActiveData}
          />
        </div>
      </SectionHeader>

      {addingDomain && (
        <CustomDrawer
          isFull={false}
          isHeightFull={true}
          isWidthFull={false}
          isOpen={addingDomain}
          onClose={() => setAddingDomain(false)}
          header={'Add A Domain'}
        >
          <AddDomain
            domains={[
              siteInfo.addonForSubDomains
                ? { id: siteInfo.addonForSubDomains, name: siteInfo.addonForSubDomains }
                : { id: centralDomain, name: centralDomain },
            ]}
            onAdd={async (domain) => {
              setFilteredData((prev) => {
                const d = [...prev, domain];
                indexedDB.saveOrUpdateData({
                  table: 'domains',
                  data: d,
                  tag: '',
                  force: true,
                });
                return d;
              });
              setAddingDomain(false);
            }}
          />
        </CustomDrawer>
      )}

      {!isNull(activeData) && (
        <CustomModal
          isOpen={!!activeData}
          onClose={() => setActiveData(null)}
          title={'Domain Details'}
          showCloseButton={true}
        >
          <DomainActions domain={activeData} setActiveData={setActiveData} />
        </CustomModal>
      )}
    </div>
  );
}

function DomainActions({
  domain,
  setActiveData,
}: {
  domain: any;
  setActiveData: (data: any) => void;
}) {
  if (domain.type === 'addon' && domain.status === 'pending') {
    return (
      <CustomCard
        title={`Domain Nameservers for ${domain.name}`}
        topRightWidget={<CloseButton onClick={() => setActiveData(null)} />}
        className="max-w-2xl"
      >
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            {`Please proceed to your domain registrar to update your domain nameservers. If you don't
            know how to do this, please contact support for assistance.`}
          </p>
        </div>

        {domain.nameservers &&
          domain.nameservers.map((ns: string, i: number) => (
            <div key={i}>
              <div className="text-xs text-gray-500 py-2 flex flex-row items-center space-x-6">
                <div>
                  NS{i + 1}: {ns}{' '}
                </div>
                <Copy
                  className="inline cursor-pointer "
                  size={12}
                  onClick={() => {
                    copyToClipboard(
                      ns,
                      () => {
                        toast.success('Nameserver copied to clipboard!');
                      },
                      (err) => {
                        console.error('Failed to copy nameserver:', err);
                        toast.error('Failed to copy nameserver');
                      },
                    );
                  }}
                />
              </div>
            </div>
          ))}
      </CustomCard>
    );
  }

  return <CustomCard title={`${domain.domain} Info`}>Status: {domain.status}</CustomCard>;
}

export default memo(DomainOverview);
