'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api_get_products } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';
import { RaisedButton } from '@/app/widgets/raised_button';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { isNull } from '@/app/helpers/isNull';
import { randomNumber } from '@/app/helpers/randomNumber';

const ProductsLists: React.FC<{
  siteInfo: BrandType;
  userId?: string;
  type?: string;
  perPage?: number;
}> = ({ siteInfo, userId, type, perPage = 12 }) => {
  const [products, setProducts] = useState<ProductTypes[]>([]);
  const [meta, setMeta] = useState<{ totalPages: number }>({ totalPages: 1 });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = perPage;

  useEffect(() => {
    const getProducts = async () => {
      try {
        const url = await api_get_products({
          subBase: siteInfo.slug,
          userId: userId || siteInfo.userId!,
          productType: type,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          conditions: {
            $or: [{ brandId: siteInfo.id }, { marketerBrandId: siteInfo.id }],
            status: 'live',
          },
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const res = await response.json();
        if (res.status) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNull(siteInfo.id)) {
      getProducts();
    }
  }, [type, siteInfo.id, siteInfo.userId, currentPage, siteInfo.slug, userId, ITEMS_PER_PAGE]);

  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fSlideUp');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [products]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    const totalPages = meta.totalPages;
    const pagesToShow = 3;
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    const paginationItems: JSX.Element[] = [];

    if (totalPages <= pagesToShow * 2 + 1) {
      for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(renderPageButton(i));
      }
    } else {
      if (currentPage > 1) {
        paginationItems.push(renderPageButton(1));
      }
      if (startPage > 2) paginationItems.push(<span key="ellipsis-start">...</span>);

      for (let i = startPage; i <= endPage; i++) {
        paginationItems.push(renderPageButton(i));
      }

      if (endPage < totalPages - 1) paginationItems.push(<span key="ellipsis-end">...</span>);
      if (currentPage < totalPages) {
        paginationItems.push(renderPageButton(totalPages));
      }
    }

    return <div className="flex gap-2">{paginationItems}</div>;
  };

  const renderPageButton = (pageNumber: number) => (
    <RaisedButton
      size="xs"
      color="auto"
      filled={pageNumber === currentPage ? 'auto' : 'none'}
      key={`page-${randomNumber(5)}`}
      className={`px-2 py-2`}
      onClick={() => handlePageChange(pageNumber)}
    >
      {pageNumber}
    </RaisedButton>
  );

  const renderShimmer = (n = 12) => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[...Array(n)].map((_, i) => (
        <div key={`shimmer-${i}`} className="animate-pulse">
          <div className="bg-gray-300 h-48 w-full rounded-t-lg"></div>
          <div className="bg-gray-200 dark:bg-gray-800 h-4 w-3/4 mt-2 rounded"></div>
          <div className="bg-gray-200 dark:bg-gray-800 h-4 w-1/2 mt-2 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (error) return <div>Error: {error}</div>;

  if (isLoading) {
    return renderShimmer(8);
  }
  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-800 px-3 py-5 my-5">
      <div className="w-full">
        {products.length === 0 ? (
          <>No product yet</>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product, i) => (
              <div key={`${product.id}-${i}`} ref={(el: any) => (featureRefs.current[i] = el)}>
                <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow  dark:border-gray-700">
                  <Image
                    className="h-48 w-full object-cover rounded-t-lg"
                    src={product.image || '/images/placeholder.png'}
                    alt={product.title!}
                    width={500}
                    height={500}
                  />
                  <div className="px-1">
                    <Link href="#">
                      <h5 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white truncate">
                        {product.title}
                      </h5>
                    </Link>
                    <div className="flex items-center mt-2.5 mb-5">
                      {/* Rating stars component */}
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ms-3">
                        5.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          parseInt(product.price?.toString() || '0', 10),
                          'NGN',
                          0,
                          'en-NG',
                        )}
                      </span>
                      <RaisedButton color="auto" size="auto" key={product.slug}>
                        Add to Cart
                      </RaisedButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Pagination Controls */}

        <div className="flex justify-between items-center mt-8">
          <RaisedButton
            className="px-2 py-2"
            size="xs"
            color="auto"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            prev
          </RaisedButton>
          {renderPagination()}
          <RaisedButton
            className="px-2 py-2"
            size="xs"
            color="auto"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === meta.totalPages}
          >
            next
          </RaisedButton>
        </div>
      </div>
    </section>
  );
};

export { ProductsLists };
