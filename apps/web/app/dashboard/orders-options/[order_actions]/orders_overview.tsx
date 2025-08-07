import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaList, FaPlus } from 'react-icons/fa';
import { CustomDataTable, RaisedButton } from '@/app/widgets/widgets';
import { SectionHeader } from '@/app/src/section_header';
import {
  add_product_page,
  api_delete_product,
  edit_product_page,
  PRIMARY_COLOR,
} from '@/app/src/constants';
import NoData from '@/app/src/no_data';
import { ExpandableButton } from '@/app/widgets/expandable_button';

import CustomDrawer from '@/app/src/custom_drawer';
import { isNull } from '@/app/helpers/isNull';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';

interface OrdersOverviewProps {
  initialRows: Array<any>;
  columns: Array<any>;
  product_type?: string;
  actionTitle?: string;
}

const OrdersOverview: React.FC<OrdersOverviewProps> = ({
  initialRows,
  columns,
  product_type,
  actionTitle = 'Overview',
}) => {
  const router = useRouter();
  const [sideBarClose, setSideBarClose] = useState(false);
  const [rows, setRows] = useState<string[][]>(initialRows);
  const { siteInfo } = useGlobalEssential();
  const [isTableBarOpen, setIsTableBarOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState([]);
  const [sideBarData, setSideData] = useState(null);

  const toggleIsTableBarOpen = (data?: any) => {
    setIsTableBarOpen((prevState) => !prevState);
    if (data) {
      setSideData(data);
    }
  };

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    if (sideBarClose) {
      setSideBarClose(false);
    }
  }, [sideBarClose]);

  const items = [
    {
      label: 'Online Course',
      href: `${add_product_page({
        productType: 'course',
        subBase: siteInfo.slug!,
      })}`,
    },
    {
      label: 'Digital Product',
      href: `${add_product_page({
        productType: 'digital',
        subBase: siteInfo.slug!,
      })}`,
    },
    {
      label: 'Physical Product',
      href: `${add_product_page({
        productType: 'physical',
        subBase: siteInfo.slug!,
      })}`,
    },
    {
      label: 'Landing Page',
      href: `${add_product_page({
        productType: 'landing',
        subBase: siteInfo.slug!,
      })}`,
    },
  ];

  const RightButton: React.FC = () => (
    <div className="flex flex-row">
      <ExpandableButton
        size="auto"
        color="auto"
        items={items}
        icon={<FaPlus />}
        iconPosition="before"
      >
        {'Add'}
      </ExpandableButton>
    </div>
  );

  return (
    <div className="p-0 m-1 min-h-[120vh]">
      <SectionHeader
        title={`${actionTitle}`}
        className={`mt-2 border-b-4 border-${PRIMARY_COLOR}`}
        rightWidget={<RightButton />}
      >
        <div className="p-4 m-0 bg-white dark:bg-gray-800 rounded-b shadow-md">
          {rows.length === 0 ? (
            <NoData text="No data" />
          ) : (
            <>
              {' '}
              <CustomDrawer
                direction="right"
                isWidthFull={false}
                showHeader={true}
                isOpen={isTableBarOpen}
                onClose={() => toggleIsTableBarOpen()}
                header="Switch Profile"
              >
                <SideBarActions data={sideBarData || {}} />
              </CustomDrawer>
              <CustomDataTable
                onSideBarDataChange={(data: any) => {
                  toggleIsTableBarOpen(data);
                }}
                setSelectedData={(e) => {
                  setSelectedData(e);
                }}
                selectedData={selectedData}
                columns={columns}
                //  renderSidebarContent={<></>}
                sideBarClose={sideBarClose}
                data={[]}
                params={{
                  action: '',
                  base: '',
                }}
              />
            </>
          )}
        </div>
      </SectionHeader>
    </div>
  );
};

export { OrdersOverview };

const SideBarActions: React.FC<any> = (data: AddonType) => {
  const { siteInfo } = useGlobalEssential();
  const router = useRouter();

  const item = (data as any).data;

  if (isNull(item)) {
    return;
  }
  return <></>;
};
