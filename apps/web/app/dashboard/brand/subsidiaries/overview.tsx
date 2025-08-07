import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { isNull } from '@/app/helpers/isNull';
import { SectionHeader } from '@/app/src/section_header';
import { CustomButton } from '@/app/widgets/custom_button';
import React, { memo, useEffect, useState } from 'react';
import { useUserContext } from '@/app/contexts/user_context';
import { Plus } from 'lucide-react';
import { useBaseContext } from '@/app/contexts/base_context';
import CustomCard from '@/app/widgets/custom_card';
import CustomDrawer from '@/app/src/custom_drawer';
import SubsidiaryForm from '@/app/dashboard/brand/subsidiaries/form';

const SubsidiariesOverview: React.FC = () => {
  const { essentialData } = useUserContext();
  const { user, siteInfo, brand } = essentialData;
  const { fetchData, refreshKey } = useDynamicContext();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeData, setActiveData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { addRouteData } = useBaseContext();
  const [addingSubcidiary, setAddingSubsidiary] = useState(false);

  const [preferred, setPreferred] = useState<string>(brand?.domain ?? '');
  const [addonForSubDomains, setAddonForSubDomains] = useState<string>(
    brand?.addonForSubDomains ?? '',
  );

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

  return (
    <div>
      <SectionHeader
        title="Domains"
        rightWidget={
          <div className="flex items-center gap-2">
            <CustomButton
              icon={<Plus size={13} />}
              onClick={() => {
                setAddingSubsidiary(true);
              }}
            >
              Add Subsidiary
            </CustomButton>
          </div>
        }
      >
        <div>
          {filteredData?.map((data: DomainTypes, i: number) => {
            return (
              <div className="m-2" key={i}>
                <CustomCard title={'HI'}>Test</CustomCard>
              </div>
            );
          })}
        </div>
      </SectionHeader>

      {addingSubcidiary && (
        <CustomDrawer
          isHeightFull={true}
          isWidthFull={true}
          isOpen={addingSubcidiary}
          onClose={() => {
            setAddingSubsidiary(false);
          }}
          header={'Manage Subsciary'}
        >
          <SubsidiaryForm />
        </CustomDrawer>
      )}
    </div>
  );
};

export default memo(SubsidiariesOverview);
