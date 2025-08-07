'use client';
import { Logo } from '@/app/widgets/logo';
import { curFormat } from '@/app/helpers/curFormat';
import { readableDate } from '@/app/helpers/readableDate';

import CustomCard from '@/app/widgets/custom_card';
import { CustomButton } from '@/app/widgets/custom_button';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Data } from '@/app/models/Data';
import { Brand } from '@/app/models/Brand';

const ReceiptBody = ({
  siteInfo,
  referenceId,
  invoice,
}: {
  siteInfo: Brand;
  referenceId: string;
  invoice: any;
}) => {
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,

    documentTitle: `invoice-${referenceId}`,

    preserveAfterPrint: true,
  });

  return (
    <div className="w-full h-full flex flex-col sm:flex-row justify-between px-2">
      <div className="w-full sm:w-3/4">
        <div
          className="p-2 bg-white dark:bg-gray-800 rounded shadow-xl px-4 mt-1 mb-6 w-full h-full"
          id="invoice"
          ref={contentRef}
        >
          <div className="grid grid-cols-2 items-center">
            <Logo brand={siteInfo as any} />
            <div className="text-right text-xs">
              <p>{siteInfo.name?.toUpperCase() || ''}</p>
              <p className="text-gray-500 text-xs">{siteInfo.ownerData?.email}</p>
              <p className="text-gray-500 text-xs mt-1">{siteInfo.ownerData?.phone}</p>
            </div>
          </div>

          {/* Client info */}
          <div className="grid grid-cols-2 items-center mt-8 text-xs">
            <div>
              <p className="font-bold text-gray-800">Bill to:</p>
              <p className="text-gray-500">
                {invoice.name}
                <br />
              </p>
              <p className="text-gray-500">{invoice.email}</p>
            </div>
            <div className="text-right text-xs">
              <p>
                Invoice: <span className="text-gray-500">{invoice.id ?? invoice.referenceId}</span>
              </p>
              <p>
                Date: <span className="text-gray-500">{readableDate(invoice.createdAt)}</span>
                <br />
              </p>
              <div
                className={`${
                  invoice.status === 'paid'
                    ? 'text-green-400 uppercase font-extrabold'
                    : 'text-red-500 uppercase font-extrabold'
                }`}
              >
                {invoice.status}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="-mx-4 mt-8 flow-root sm:mx-0 text-xm">
            <table className="min-w-full text-xs">
              <colgroup>
                <col className="w-full sm:w-1/2" />
                <col className="sm:w-1/6" />
                <col className="sm:w-1/6" />
                <col className="sm:w-1/6" />
              </colgroup>
              <thead className="border-b border-gray-300 text-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-0"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-right text-xs font-semibold text-gray-900 sm:table-cell"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-right text-xs font-semibold text-gray-900 sm:table-cell"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-3 pr-4 text-right text-xs font-semibold text-gray-900 sm:pr-0"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.products &&
                  invoice.products.map((product: Data, i: number) => (
                    <tr key={i} className="border-b border-gray-200 text-xs">
                      <td className="max-w-0 py-5 pl-4 pr-3 text-xs sm:pl-0">
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="mt-1 truncate text-gray-500">Product Id: {product.id}</div>
                      </td>
                      <td className="hidden px-3 py-5 text-right text-xs text-gray-500 sm:table-cell">
                        {(product as any).quantity ?? 1}
                      </td>
                      <td className="hidden px-3 py-5 text-right text-xs text-gray-500 sm:table-cell">
                        {curFormat(product.price, invoice.currencySymbol)}
                      </td>
                      <td className="py-5 pl-3 pr-4 text-right text-xs text-gray-500 sm:pr-0">
                        {curFormat(
                          (product.price ?? 0) * ((product as any).quantity ?? 1),
                          invoice.currencySymbol,
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-6 text-right text-xs font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Subtotal
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-6 text-left text-xs font-normal text-gray-500 sm:hidden"
                  >
                    Subtotal
                  </th>
                  <td className="pl-3 pr-6 pt-6 text-right text-xs text-gray-500 sm:pr-0">
                    {invoice?.products &&
                      curFormat(
                        invoice?.products.reduce(
                          (sum: any, order: any) => sum + order.price * order.quantity,
                          0,
                        ),
                        invoice.currencySymbol,
                      )}
                  </td>
                </tr>

                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-6 text-right text-xs font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Tax
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-6 text-left text-xs font-normal text-gray-500 sm:hidden"
                  >
                    Tax
                  </th>
                  <td className="pl-3 pr-6 pt-6 text-right text-xs text-gray-500 sm:pr-0">
                    {curFormat(0, invoice.currencySymbol)}
                  </td>
                </tr>
                {/* Additional rows for tax, discount, etc. can go here */}
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-4 text-right text-xs font-semibold text-gray-900 sm:table-cell sm:pl0"
                  >
                    Total
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-4 text-left text-xs font-semibold text-gray-900 sm:hidden"
                  >
                    Total
                  </th>
                  <td className="pl-3 pr-4 pt-4 text-right text-xs font-semibold text-gray-900 sm:pr-0">
                    {invoice?.products &&
                      curFormat(
                        invoice?.products.reduce(
                          (sum: any, order: any) => sum + order.price * order.quantity,
                          0,
                        ),
                        invoice.currencySymbol,
                      )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t-2 pt-4 text-xs text-gray-500 text-center mt-16">
            Thank you for patronising us. Any complaint? have a live chat with us.
          </div>
        </div>
      </div>

      <div className="w-full sm:w-1/4 print:hidden">
        <CustomCard title={'Action'}>
          <div className="my-5">
            <CustomButton className="w-full" onClick={() => reactToPrintFn()}>
              Print Receipt
            </CustomButton>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};
export default ReceiptBody;
