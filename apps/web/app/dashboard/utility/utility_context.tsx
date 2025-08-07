'use client';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  Suspense,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { capitalize } from '@/app/helpers/capitalize';
import { isNull } from '@/app/helpers/isNull';
import { getDynamicData } from '@/app/helpers/getDynamicData';
import { getParents } from '@/app/helpers/getParents';

import indexedDB from '@/app/utils/indexdb';

interface UtilityContextProps {
  products: ProductTypes[];
  sps: ServiceProviderTypes[];
  parents: ParentsInfo;
  setSpId: (id: string) => void;
  setProductId: (id: string) => void;
  setBrand: (brand: BrandType) => void;
  setType: (type: string) => void;
  setParams: (params: { action: string; base: string; seg1: string }) => void;
}

const UtilityContext = createContext<UtilityContextProps | undefined>(undefined);

function UtilityContextContent({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductTypes[]>([]);
  const [sps, setSps] = useState<ServiceProviderTypes[]>([]);
  const [type, setType] = useState('');
  const [spId, setSpId] = useState('');
  const [productId, setProductId] = useState('');
  const [params, setParams] = useState<{ action: string; base: string; seg1: string }>({} as any);
  const [brand, setBrand] = useState<BrandType>({});
  const [parents, setParents] = useState<ParentsInfo>({} as ParentsInfo);
  const isFetchingRef = useRef(false);
  const [liveData, setLiveData] = useState<string[]>([]);

  // Memoize state setter functions to prevent recreating them on every render
  const handleSetSpId = useCallback((id: string) => {
    setSpId(id);
  }, []);

  const handleSetProductId = useCallback((id: string) => {
    setProductId(id);
  }, []);

  const handleSetBrand = useCallback((newBrand: BrandType) => {
    setBrand(newBrand);
  }, []);

  const handleSetType = useCallback((newType: string) => {
    setType(newType);
  }, []);

  const handleSetParams = useCallback(
    (newParams: { action: string; base: string; seg1: string }) => {
      setParams(newParams);
    },
    [],
  );

  // Fetch service providers only when params.action or type changes
  useEffect(() => {
    // Skip execution if params.base is not "utility"
    if (params.base !== 'utility') return;

    let isMounted = true;
    const fetchServiceProviders = async () => {
      const table = 'service_providers';
      const conditions = {};
      const sortOptions: SortOptions = {};

      try {
        // Fetch from IndexedDB
        const cd = await indexedDB.queryData({
          table,
          conditions,
          sort: sortOptions,
          tag: 'utility',
        });

        if (!isMounted) return;

        if (!isNull(cd)) {
          const spData = cd.map((sp) => ({
            ...sp,
            label: capitalize(sp?.name!.replace(/_/g, ' ').replace(/-/g, ' ')),
          }));
          setSps(spData);
        }

        // Fetch from API
        if (brand.slug) {
          const { data, status } = await getDynamicData({
            subBase: brand.slug,
            table,
            conditions,
            limit: 5000,
          });

          if (!isMounted) return;

          if (!isNull(data) && status) {
            const fetchedData = data.map((sp) => ({
              ...sp,
              label: capitalize(sp?.name!.replace(/_/g, ' ').replace(/-/g, ' ')),
            }));

            setSps(fetchedData);
            await indexedDB.saveOrUpdateData({ table, data: fetchedData });
          } else if (isNull(cd)) {
            setSps([]);
          }
        }
      } catch (error) {
        console.error('Error fetching service providers:', error);
      }
    };

    fetchServiceProviders();

    return () => {
      isMounted = false;
    };
  }, [brand.slug, params.base]);

  // Fetch parents only when brand.slug changes
  useEffect(() => {
    // Skip execution if params.base is not "utility"
    if (params.base !== 'utility') return;

    let isMounted = true;
    const getBrandParents = async () => {
      if (!brand.slug) return;

      try {
        const p = await getParents({ subBase: brand.slug });

        if (!isMounted) return;

        if (!isNull(p)) {
          setParents(p);
        }
      } catch (error) {
        console.error('Error fetching parents:', error);
      }
    };

    getBrandParents();

    return () => {
      isMounted = false;
    };
  }, [brand.slug, params.base]);

  // Fetch products only when brand.slug changes
  useEffect(() => {
    // Skip execution if params.base is not "utility"
    if (params.base !== 'utility') return;

    let isMounted = true;
    const getProducts = async () => {
      if (isFetchingRef.current || !brand.slug) return;
      isFetchingRef.current = true;

      try {
        const table = 'products';
        const conditions = { serviceType: 'utility' };
        const sortOptions: SortOptions = { price: 1 };

        const cd = await indexedDB.queryData({
          table,
          conditions,
          sort: sortOptions,
          tag: 'utility',
        });

        if (!isMounted) return;

        if (!isNull(cd)) {
          setProducts(cd);
        }

        const { data } = await getDynamicData({
          subBase: brand.slug,
          table,
          conditions,
          limit: 5000,
          sortOptions,
        });

        if (!isMounted) return;

        if (data) {
          setProducts(data);
          await indexedDB.saveOrUpdateData({ table, data });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    getProducts();

    return () => {
      isMounted = false;
    };
  }, [brand.slug, params.base]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(
    () => ({
      parents,
      setBrand: handleSetBrand,
      products,
      sps,
      setParams: handleSetParams,
      setType: handleSetType,
      setSpId: handleSetSpId,
      setProductId: handleSetProductId,
    }),
    [
      parents,
      handleSetBrand,
      products,
      sps,
      handleSetParams,
      handleSetType,
      handleSetSpId,
      handleSetProductId,
    ],
  );

  return <UtilityContext.Provider value={contextValue}>{children}</UtilityContext.Provider>;
}

export const UtilityContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <UtilityContextContent>{children}</UtilityContextContent>
    </Suspense>
  );
};

export const useUtilityContext = () => {
  const context = useContext(UtilityContext);
  if (!context || isNull(context)) {
    throw new Error('useUtilityContext must be used within a UtilityContextProvider');
  }
  return context;
};
