import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaList, FaPlus } from 'react-icons/fa';
import { CustomDataTable } from '@/app/widgets/widgets';
import { crud_page } from '@/app/src/constants';
import NoData from '@/app/src/no_data';
import { ExpandableButton } from '@/app/widgets/expandable_button';
import { useBaseContext } from '@/app/contexts/base_context';
import CustomDrawer from '@/app/src/custom_drawer';
import { isNull } from '@/app/helpers/isNull';
import { Brand } from '@/app/models/Brand';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';

interface TrnxOverviewProps {
  initialRows: Array<any>;
  columns: Array<any>;
  product_type?: string;
  actionTitle?: string;
  siteInfo?: Brand;
}

const TrnxOverview: React.FC<TrnxOverviewProps> = ({
  initialRows,
  columns,
  product_type,
  actionTitle = 'Overview',
  siteInfo,
}) => {
  const router = useRouter();
  const [sideBarClose, setSideBarClose] = useState(false);
  const [rows, setRows] = useState<string[][]>(initialRows);
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
      href: `${crud_page({
        action: 'add',
        base: 'products',
        type: 'course',
        subBase: siteInfo?.slug!,
      })}`,
    },
    {
      label: 'Digital Product',
      href: `${crud_page({
        action: 'add',
        base: 'products',
        type: 'digital',
        subBase: siteInfo?.slug!,
      })}`,
    },
    {
      label: 'Physical Product',
      href: `${crud_page({
        action: 'overview',
        base: 'products',
        type: 'physical',
        subBase: siteInfo?.slug!,
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
            header="Transaction Details"
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
  );
};

const SideBarActions: React.FC<any> = (data: AddonType) => {
  const { siteInfo } = useGlobalEssential();
  const router = useRouter();

  const item = (data as any).data;

  if (isNull(item)) {
    return;
  }
  return <></>;
};

export default TrnxOverview;
