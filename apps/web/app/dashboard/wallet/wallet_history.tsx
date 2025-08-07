import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaList, FaPlus } from "react-icons/fa";
import { CustomDataTable, RaisedButton } from "@/app/widgets/widgets";
import { SectionHeader } from "@/app/src/section_header";
import {
  add_product_page,
  api_delete_product,
  edit_product_page,
  PRIMARY_COLOR,
  wallet_page,
} from "@/app/src/constants";
import NoData from "@/app/src/no_data";
import { ExpandableButton } from "@/app/widgets/expandable_button";
import LoadingBar from "@/app/widgets/loading";
import { useBaseContext } from "@/app/contexts/base_context";

interface WalletHistoryProps {
  initialRows: Array<any>;
  columns: Array<any>;
  product_type?: string;
  actionTitle?: string;
}

const WalletHistory: React.FC<WalletHistoryProps> = ({
  initialRows,
  columns,
  product_type,
  actionTitle = "Overview",
}) => {
  const router = useRouter();
  const [sideBarClose, setSideBarClose] = useState(false);
  const [rows, setRows] = useState<string[][]>(initialRows);
  const { isPending } = useBaseContext();

  const handleSidebarClose = (deletedId: string) => {
    setSideBarClose(true);
    const newRows = rows.filter((row) => row[0] !== deletedId);
    setRows(newRows);
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
      label: "Topup",
      href: `${wallet_page({ subBase: "", action: "fund-wallet" })}`,
    },
    {
      label: "Affiliate",
      href: ``,
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
        {"Add"}
      </ExpandableButton>
    </div>
  );

  if (isPending) {
    return <LoadingBar />;
  }
  return (
    <div className="p-0 m-1">
      <SectionHeader
        title={`${actionTitle}`}
        className={`mt-2 border-b-4 border-${PRIMARY_COLOR}`}
        rightWidget={<RightButton />}
      >
        <div className="p-4 m-0 bg-white dark:bg-gray-800 rounded-b shadow-md">
          {rows.length === 0 ? (
            <NoData text="No data" />
          ) : (
            <CustomDataTable
              // initialRows={rows}
              columns={columns}
              delete_endpoint={""}
              sideBarClose={sideBarClose}
              onSideBarDataChange={() => {}}
              setSelectedData={() => {}}
              data={[]}
              params={{
                action: "",
                base: "",
              }}
            />
          )}
        </div>
      </SectionHeader>
    </div>
  );
};

export { WalletHistory };
