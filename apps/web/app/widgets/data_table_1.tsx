import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaForward, FaEllipsisV } from 'react-icons/fa';
import { FaBackward } from 'react-icons/fa6';
import { PRIMARY_COLOR } from '@/app/src/constants';
import { CustomBadge, RaisedButton } from '@/app/widgets/widgets';
import NoData from '@/app/src/no_data';
import CustomDrawer from '@/app/src/custom_drawer';
import SideBarActions from '@/app/dashboard/sidebar_content';
import { readableDate } from '@/app/helpers/readableDate';
import { lowercase } from '@/app/helpers/lowercase';
import { curFormat } from '@/app/helpers/curFormat';
import SelectedAction from '@/app/widgets/selectedItems';

interface CustomDataTableProps {
  columns?: string[];
  sideBarClose?: boolean;
  delete_endpoint?: string;
  renderSidebarContent?: (rowData: { [key: string]: string }) => React.ReactNode;
  onDelete?: (deletedRows: { [key: string]: string }[]) => void;
  onSideBarDataChange: (data: any) => void;
  selectedData?: any;
  setSelectedData: (data: any) => void;
  data: any[];
  siteInfo?: BrandType;
  user?: UserTypes;
  params: { action: string; base: string };
  disableSideBar?: boolean;
  onAction?: (data: any) => void;
}

type RowItem = {
  id: string;
  title?: string;
  createdAt?: string;
  price?: number;
  amount?: number;
  currencySymbol?: string;
  orderCurrencySymbol?: string;
  symbol?: string;
  [key: string]: any;
};

type RowComponentProps = {
  row: RowItem;
  rowIndex: number;
  selectedRows: RowItem[];
  validColumns: string[];
  handleRowSelect: (index: number) => void;
  toggleIsTableBarOpen: (row: RowItem) => void;
  readableDate: (date: string) => string;
  curFormat: (amount: number, symbol?: string) => string;
};

const MobileTableRow: React.FC<RowComponentProps> = ({
  row,
  rowIndex,
  selectedRows,
  validColumns,
  handleRowSelect,
  toggleIsTableBarOpen,
  readableDate,
  curFormat,
}) => {
  return (
    <div className="p-2 py-3 md:border md:border-gray-200 text-left flex flex-row items-center justify-start overflow-x-hidden w-full">
      <input
        type="checkbox"
        checked={selectedRows.some((r) => r.id === row.id)}
        onChange={() => handleRowSelect(rowIndex)}
        className="form-checkbox"
      />

      {validColumns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="ml-2 block sm:hidden w-full"
          onClick={() => toggleIsTableBarOpen(row)}
        >
          {column === 'title' && (
            <div className="flex flex-col w-full min-w-0">
              <div className="text-ellipsis min-w-0">{row.title}</div>

              <div className="text-xs flex flex-row w-full mt-1">
                <div className="flex flex-row justify-between items-center min-w-fit">
                  <div className="mr-2">
                    {row.createdAt ? readableDate(row.createdAt) : 'No date'}
                  </div>
                  <div>
                    {(row.price || row.amount) &&
                      curFormat(
                        row?.price || row?.amount || 0,
                        row.currencySymbol || row.orderCurrencySymbol || row.symbol || '',
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const CustomDataTable: React.FC<CustomDataTableProps> = ({
  columns,
  data,
  params,
  onDelete,
  sideBarClose = false,
  onSideBarDataChange,
  setSelectedData,
  selectedData,
  siteInfo,
  user,
  disableSideBar = false,
  onAction,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: string }[]>([]);
  const [deletedRows, setDeletedRows] = useState<string[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
  const [isTableBarOpen, setIsTableBarOpen] = useState<boolean>(false);
  const [sideBarData, setSideData] = useState<any>({});

  useEffect(() => {}, [data]);

  useEffect(() => {
    if (sideBarClose) {
      setSelectedRows([]);
      setSelectAllChecked(false);
    }
  }, [sideBarClose]);

  if (!columns) {
    return <>No columns found</>;
  }

  const toggleIsTableBarOpen = (focusData?: any) => {
    if (focusData) {
      let item = data.find((item: any) => item.id === focusData.id);
      setSideData(item || {});
      onAction?.(item || {});
    }
    if (disableSideBar) return;

    setIsTableBarOpen((prevState) => !prevState);
  };
  // Filter columns dynamically based on available keys in data
  const validColumns = columns.filter((column) => data.some((item) => column in item));

  const filteredData = data
    .filter((item) => !deletedRows.includes(item.id))
    .map((item) =>
      validColumns.reduce(
        (obj, key) => {
          obj[key] = item[key] ?? '-';
          return obj;
        },
        {} as { [key: string]: any },
      ),
    );

  // Pagination logic
  const paginatedRows = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  const handleRowSelect = (rowIndex: number) => {
    const row = paginatedRows[rowIndex];
    setSelectedRows((prevSelected) =>
      prevSelected.some((r) => r.id === row.id)
        ? prevSelected.filter((r) => r.id !== row.id)
        : [...prevSelected, row],
    );
  };

  const handleSelectAll = (select: boolean) => {
    setSelectedRows(select ? paginatedRows : []);
    setSelectAllChecked(select);
  };

  return (
    <>
      <div>
        {selectedRows.length > 0 && (
          <>
            <SelectedAction
              data={selectedRows!}
              base={params.base}
              siteInfo={siteInfo}
              user={user}
            />
          </>
        )}
      </div>
      <div className="p-1 border-t border-gray-300 mt-4 h-full">
        {filteredData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse block md:table">
                <thead className="block md:table-header-group">
                  <tr className="border border-gray-200 md:border-none block md:table-row">
                    <th className="bg-gray-200 dark:bg-gray-800 p-2 text-left font-semibold md:table-cell">
                      <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="form-checkbox"
                      />
                    </th>
                    {validColumns.map((column, index) => (
                      <th
                        key={index}
                        className="bg-gray-200 dark:bg-gray-800 p-2 text-xs border border-gray-100 text-left md:table-cell hidden sm:block whitespace-nowrap"
                      >
                        {formateColumnName(column).toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="block md:table-row-group">
                  {paginatedRows.map((row, rowIndex) => {
                    let item = data.find((item) => item.id === row.id);
                    return (
                      <tr
                        key={rowIndex}
                        className="bg-white dark:bg-gray-800 border border-gray-200 md:border-none block md:table-row"
                      >
                        <td className="p-2 py-3 md:border md:border-gray-200 text-left flex flex-row items-center justify-start overflow-x-hidden">
                          <input
                            type="checkbox"
                            checked={selectedRows.some((r) => r.id === row.id)}
                            onChange={() => handleRowSelect(rowIndex)}
                            className="form-checkbox"
                          />

                          {validColumns.map((column, colIndex) => (
                            <div
                              key={colIndex}
                              className="ml-2 block sm:hidden"
                              onClick={() => toggleIsTableBarOpen(row)}
                            >
                              {column === 'title' && (
                                <div className="flex flex-col w-full">
                                  <span className="truncate">{item.title}</span>
                                  <div className="text-xs flex flex-row justify-between w-full">
                                    <div className="mr-auto">
                                      {item.createdAt ? readableDate(item.createdAt) : 'No date'}
                                    </div>
                                    <div className="ml-auto">
                                      {(item.price || item.amount) &&
                                        curFormat(
                                          item.price || item.amount,
                                          item.currencySymbol ||
                                            item.orderCurrencySymbol ||
                                            item.symbol,
                                        )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </td>
                        {validColumns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="p-2 md:border md:border-gray-200 text-xs text-left md:table-cell whitespace-nowrap hidden sm:block"
                          >
                            {column === 'action' ? (
                              <div className="flex justify-end w-full">
                                <button onClick={() => toggleIsTableBarOpen(row)}>
                                  <FaEllipsisV className="h-5 w-5 mx-4 text-gray-500" />
                                </button>
                              </div>
                            ) : (
                              <ExpandableCell
                                content={row[column] as any}
                                column={column}
                                data={data}
                                row={row}
                                user={user || {}}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                <label className="mr-2">Per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="border rounded px-2 py-0.5 text-xs"
                >
                  {[5, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row">
                <RaisedButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  size="sm"
                  icon={<FaBackward />}
                >
                  Back
                </RaisedButton>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <RaisedButton
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    size="sm"
                  >
                    {pageNumber}
                  </RaisedButton>
                ))}
                <RaisedButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  size="sm"
                  icon={<FaForward />}
                >
                  Next
                </RaisedButton>
              </div>
            </div>
          </>
        ) : (
          <NoData text={'No Data Available'} />
        )}
      </div>
      {isTableBarOpen && (
        <CustomDrawer
          direction="right"
          isWidthFull={false}
          isHeightFull={true}
          showHeader={true}
          isOpen={isTableBarOpen}
          onClose={() => toggleIsTableBarOpen(null)}
          header={sideBarData.title || sideBarData.name || 'Action'}
        >
          <SideBarActions
            onDelete={() => {
              setDeletedRows((prev) => [...prev, sideBarData.id]);
              toggleIsTableBarOpen(null);
            }}
            onClose={() => {
              toggleIsTableBarOpen(null);
            }}
            data={sideBarData!}
            base={params.base}
            siteInfo={siteInfo}
            user={user}
          />
        </CustomDrawer>
      )}
    </>
  );
};

export { CustomDataTable };

interface ExpandableCellProps {
  content: string;
  column: string;
  data: any[];
  row: any;
  user: UserTypes;
}

const ExpandableCell: React.FC<ExpandableCellProps> = ({ content, column, data, row, user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  let item = data.find((item) => item.id === row.id);
  let finalContent = content;

  if (['price', 'amount', 'revenue'].includes(lowercase(column))) {
    const symbol = item.orderCurrencySymbol || item.currencySymbol || item.symbol;
    if (symbol) {
      finalContent = curFormat(parseInt(content), symbol);
    }
  }

  // let revenue = {};
  // if (["revenue"].includes(String(column).toLowerCase())) {
  //   const symbol = user.currencyInfo?.currencySymbol;

  //   if (symbol) {
  //     revenue = { in: curFormat(parseFloat(content), symbol), out: 0 };
  //     finalContent = `${curFormat(parseFloat(content), symbol)} `;
  //   }
  // }

  return (
    <div className="relative text-xs">
      <span className={`block ${isExpanded ? 'text-xs font-thin' : 'truncate'} max-w-[25ch]`}>
        {content === 'live' || content === 'published' || content === 'completed' ? (
          <span className="text-green-600 font-bold  flex flex-row">
            <span className="block sm:hidden">
              <CustomBadge size="xs" text={column} />
            </span>
            <span className="ml-2 sm:ml-0">{content}</span>
          </span>
        ) : (
          <span className=" flex flex-row">
            <span className="block sm:hidden">
              <CustomBadge text={column} size="xs" />
            </span>
            <span className="ml-2 sm:ml-0">{finalContent}</span>
          </span>
        )}
      </span>
      {!['price', 'amount', 'revenue'].includes(lowercase(column)) &&
        content &&
        content.length > 12 && (
          <button
            onClick={handleToggle}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-50 text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            {isExpanded ? (
              <FaMinus className={`text-xs text-${PRIMARY_COLOR}`} />
            ) : (
              <FaPlus className={`text-xs text-${PRIMARY_COLOR}`} />
            )}
          </button>
        )}
    </div>
  );
};

export { ExpandableCell };

export const formateColumnName = (content: any) => {
  switch (content) {
    case 'sellerBrandId':
      return 'Brand Id';

    case 'productId':
      return 'product Id';

    case 'referenceId':
      return 'Reference Id';

    default:
      return content;
  }
};
