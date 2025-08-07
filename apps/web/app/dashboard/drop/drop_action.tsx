import React, { useState } from 'react';
import { useBaseContext } from '@/app/contexts/base_context';
import { crud_page } from '@/app/routes/page_routes';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { ArrowRight, DollarSign, Eye, ShoppingCart } from 'lucide-react';
import Pagination from '@/app/widgets/pagination';
import { curFormat } from '@/app/helpers/curFormat';
import { formatNumber } from '@/app/helpers/formatNumber';
import { Data } from '@/app/models/Data';

interface Props {
  params: { action: string; base: string; seg1?: string };
  siteInfo: any;
  user: any;
  auth: any;
  defaultData: Data[];
  type?: string;
  status?: string;
  id?: string;
}

const DropAction: React.FC<Props> = ({ params, siteInfo, defaultData, type }) => {
  const { addRouteData } = useBaseContext();
  const [filteredData, setFilteredData] = useState<Data[]>(defaultData);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get paginated data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="my-10 text-xs">
      {paginatedData.map((product, i) => (
        <div key={i}>
          <CustomCard
            title={product.title ?? ''}
            bottomWidget={
              <div className="flex flex-row justify-between items-center w-full">
                <div>Sold By: {product.meta?.brandName}</div>
                <div> {curFormat(product.price ?? 0.0, product.currencySymbol)}</div>
                <div className="h-6 w-16">
                  <CustomButton
                    iconPosition="after"
                    icon={<ArrowRight className="h-3 w-3" />}
                    onClick={() => {
                      addRouteData({
                        isOpen: true,
                        action: 'edit',
                        base: params.base ?? '',
                        type,
                        title: product.title || '',
                        defaultData: {
                          ...product,
                          id: '',
                          slug: '',
                          title: '',
                          subTitle: product.title,
                          parentId: product.id,
                        },
                        searchParams: { parentId: product.id ?? '', type: product.type! },
                        rates: {},
                        slug: crud_page({
                          action: 'add',
                          base: params.base,
                          type: product.type!,
                          subBase: siteInfo.slug || '',
                          searchParams: { parentId: product.id ?? '' },
                        }),
                      });
                    }}
                  >
                    hook
                  </CustomButton>
                </div>
              </div>
            }
          >
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row space-x-1 items-center">
                  <ShoppingCart className="h-3 w-3" />
                  <div>{formatNumber(product.sales ?? 0)}</div>
                </div>
                <div className="flex flex-row space-x-1 items-center">
                  <Eye className="h-3 w-3" />
                  <div> {formatNumber(product.views ?? product.cashViews ?? 0)}</div>
                </div>
                <div className="flex flex-row space-x-1 items-center">
                  <DollarSign className="h-3 w-3" />
                  <div> {curFormat(product.revenue ?? 0, product.currencySymbol)}</div>
                </div>
              </div>
            </div>
          </CustomCard>
        </div>
      ))}

      {/* Reusable Pagination Component */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default DropAction;
