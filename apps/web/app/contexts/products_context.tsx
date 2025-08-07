'use client';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useTransition,
  Suspense,
  useRef,
} from 'react';
import { isNull } from '@/app/helpers/isNull';
import indexedDB from '@/app/utils/indexdb';
import { getDynamicData } from '@/app/helpers/getDynamicData';

interface ProductsContextProps {
  products: ProductTypes[];
  setBrand: (brand: BrandType) => void;
}

const ProductsContext = createContext<ProductsContextProps | undefined>(undefined);

function ProductsContextContent({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductTypes[]>([]);
  const [liveData, setliveData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [brand, setBrand] = useState<BrandType>({});
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const getProducts = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const table = 'products';
        const conditions = {};
        const sortOptions = { createdAt: -1 };

        const cd = await indexedDB.queryData({ table, conditions });
        if (!isNull(cd)) {
          //  setProducts(cd);
          //setIsLoading(false);
        }

        const { data } = await getDynamicData({
          subBase: brand.slug!,
          table,
          conditions,
        });

        if (data) {
          setProducts(data);
          setliveData(data);
          indexedDB.saveOrUpdateData({ table, data });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, [brand.slug]);

  return (
    <ProductsContext.Provider
      value={{
        setBrand,
        products,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export const ProductsContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <ProductsContextContent>{children}</ProductsContextContent>
    </Suspense>
  );
};

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (!context || isNull(context)) {
    throw new Error('useProductsContext must be used within a ProductsContextProvider');
  }
  return context;
};
