'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaEye, FaPlus } from 'react-icons/fa';
import { CustomDataTable, DeleteButton, RaisedButton } from '@/app/widgets/widgets';
import { SectionHeader } from '@/app/src/section_header';
import {
  add_product_page,
  api_import_products,
  PRIMARY_COLOR,
  product_page,
} from '@/app/src/constants';
import NoData from '@/app/src/no_data';
import { ExpandableButton } from '@/app/widgets/expandable_button';
import { useBaseContext } from '@/app/contexts/base_context';
import { isNull } from '@/app/helpers/isNull';
import CustomDrawer from '@/app/src/custom_drawer';
import { FaDownload } from 'react-icons/fa6';
import { title } from 'process';
import { useUserContext } from '@/app/contexts/user_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import { toast } from 'sonner';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';

interface OverviewProps {
  initialRows: Array<any>;
  columns: Array<any>;
  product_type?: string;
  actionTitle?: string;
}

const Overview: React.FC<OverviewProps> = ({
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
      <RaisedButton
        size="auto"
        color="auto"
        icon={<FaPlus />}
        iconPosition="before"
        onClick={() =>
          router.push(
            `${add_product_page({
              productType: String(product_type),
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
    <div className="p-0 m-1 min-h-[150vh]">
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
                <SideBarActions
                  data={sideBarData!}
                  onClose={() => {
                    setIsTableBarOpen(false);
                  }}
                />
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
      </SectionHeader>
    </div>
  );
};

export { Overview };

const SideBarActions: React.FC<{ data: ProductTypes; onClose: () => void }> = ({
  data,
  onClose,
}) => {
  const { siteInfo } = useGlobalEssential();
  const { user } = useUserContext();
  const router = useRouter();

  const item = data; // Correctly reference `data`

  const handleImport = async (product: ProductTypes) => {
    try {
      const toastId = toast.loading('adding product to store');
      const url = await api_import_products({ subBase: siteInfo.slug! });
      let postData: any[] = [];
      postData.push({
        parentId: product.id,
        title: product.title,
        type: product.type,
        slug: `${product.slug}-${user?.brand?.id}`,
        marketerBrandId: user?.brand?.id,
      });

      const iRes = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: await modHeaders('post'),
      });

      const iResp = await iRes.json();

      toast.dismiss(toastId);

      if (iResp.status) {
        toast.success(iResp.msg);
        onClose(); // Correctly call the `onClose` function here
      } else {
        toast.error(iResp.msg || 'error adding product');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!item) {
    return null;
  }

  return (
    <div className="p-2">
      <h3>Details for {item.title}</h3>
      <div className="mt-5 border-t-2 border-gray-200 my-2"></div>
      <div className="flex flex-row space-x-2">
        <RaisedButton
          size="sm"
          color="primary"
          icon={<FaDownload />}
          iconPosition="before"
          onClick={() => handleImport(item)}
        >
          Add To Store
        </RaisedButton>
      </div>
    </div>
  );
};
