'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { CustomButton } from '@/app/widgets/custom_button';
import Link from 'next/link';
import { ProductsContextProvider, useProductsContext } from '@/app/contexts/products_context';
import Image from 'next/image';

const ProductList = React.memo(
  ({ siteInfo, defaultData }: { siteInfo: BrandType; defaultData: ProductTypes[] }) => {
    return (
      <ProductsContextProvider>
        <List siteInfo={siteInfo} defaultData={[]} />
      </ProductsContextProvider>
    );
  },
);

const List = ({ siteInfo, defaultData }: { siteInfo: BrandType; defaultData: ProductTypes[] }) => {
  const { products, setBrand } = useProductsContext();

  useEffect(() => {
    setBrand(siteInfo);
  }, [siteInfo.slug, setBrand, siteInfo]);

  return (
    <div className="container mx-auto p-4" key={'list1'}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          return (
            <Card key={product.id} className="flex flex-col border border-none">
              <Link href={product.slug ?? '#'}>
                <div className="relative">
                  <Image
                    src="images/utility/data.jpg"
                    alt={product?.title ?? ''}
                    className="rounded-t-lg w-full h-32 object-cover brightness-75"
                    height={500}
                    width={500}
                  />
                </div>
              </Link>
              <div className="p-2">
                <Link href={product.slug ?? '#'}>
                  <h3 className="font-semibold text-sm">{product.title}</h3>
                  <p className="text-gray-600 text-xs mt-1">{product.category}</p>
                  <p className="text-gray-700 text-xs line-clamp-2 mt-1">{product.description}</p>
                </Link>

                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm font-bold">$1000</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs bg-green-100 text-green-800">
                    In Stock
                  </span>
                </div>

                <div className="mt-2">
                  <CustomButton icon={<ShoppingCart size={20} />} disabled={false}>
                    Add to Cart
                  </CustomButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default ProductList;
