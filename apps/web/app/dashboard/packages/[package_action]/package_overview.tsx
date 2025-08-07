import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaPlus } from 'react-icons/fa';
import { CustomDataTable, RaisedButton } from '@/app/widgets/widgets';
import { SectionHeader } from '@/app/src/section_header';
import { package_page, PRIMARY_COLOR } from '@/app/src/constants';
import NoData from '@/app/src/no_data';
import { ExpandableButton } from '@/app/widgets/expandable_button';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';
import CustomDrawer from '@/app/src/custom_drawer';
import { isNull } from '@/app/helpers/isNull';

interface AddonOverviewProps {
  initialRows: Array<any>;
  columns: Array<any>;

  actionTitle?: string;
}

const AddonOverview: React.FC<AddonOverviewProps> = ({
  initialRows,
  columns,
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

  const items: any[] = [];

  const RightButton: React.FC = () => (
    <div className="flex flex-row">
      <RaisedButton
        size="auto"
        color="auto"
        icon={<FaPlus />}
        iconPosition="before"
        onClick={() =>
          router.push(
            `${package_page({
              action: 'add',
              subBase: siteInfo.slug!,
            })}`,
          )
        }
      >
        {actionTitle}
      </RaisedButton>
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
    <div className="p-0 m-1">
      <SectionHeader
        title={`${actionTitle}s`}
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
                <SideBarActions data={sideBarData!} />
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

export { AddonOverview };

const SideBarActions: React.FC<any> = (data: AddonType) => {
  const { siteInfo } = useGlobalEssential();
  const router = useRouter();

  const item = (data as any).data;

  if (isNull(item)) {
    return;
  }
  return (
    <>
      <div className="p-2">
        <h3>Details for {item.title}</h3>
        <div className="mt-5 border-t-2 border-gray-200 my-2"></div>
        <div className="flex flex-row space-x-2">
          <RaisedButton
            size="sm"
            color="primary"
            icon={<FaEdit />}
            iconPosition="before"
            onClick={() =>
              router.push(
                package_page({
                  action: 'edit',
                  subBase: siteInfo.slug!,
                  id: item.id,
                }),
              )
            }
          >
            Edit
          </RaisedButton>
        </div>
      </div>
    </>
  );
};
