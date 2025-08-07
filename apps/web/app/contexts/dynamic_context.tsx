'use client';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import { isNull } from '@/app/helpers/isNull';
import { randomNumber } from '@/app/helpers/randomNumber';
import { getDynamicData } from '@/app/helpers/getDynamicData';

import indexedDB from '@/app/utils/indexdb';

import { clearCache } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface QueryConfig {
  conditions: Record<string, any>;
  sortOptions: SortOptions;
  table: string;
  tag: string;
  limit: number;
}

interface DynamicContextProps {
  data: any[];
  queryConfig: QueryConfig;
  isLoading: boolean;
  refreshKey: string | number;
  setRefreshKey: (newKey: any) => void;
  refreshPage: (refreshKeys: string[], rebuild?: boolean, clear?: boolean) => void;
  setBrand: (brand: BrandType) => void;
  setQueryConfig: (config: Partial<QueryConfig>) => void;
  setEssentials: (essentials: string[]) => void;
  setParams: (params: { action: string; base: string; seg1: string }) => void;
  fetchData: (options: {
    table: string;
    tag: string;
    conditions: Record<string, any>;
    limit: number;
    sortOptions: SortOptions;
    brandSlug: string;
    essentials?: any;
    forceFresh?: boolean;
  }) => Promise<any[] | null>;
}

const DynamicContext = createContext<DynamicContextProps | undefined>(undefined);

const DynamicContextContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<any[]>([]);
  const [queryConfig, setQueryConfigState] = useState<QueryConfig>({
    conditions: {},
    sortOptions: { createdAt: -1 },
    table: '',
    tag: '',
    limit: 10000,
  });

  const [params, setParams] = useState<{ action: string; base: string; seg1: string }>({} as any);
  const [brand, setBrand] = useState<BrandType>({});
  const [essentials, setEssentials] = useState<string[]>([]);
  const isFetchingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState<any>('');
  const router = useRouter();

  const handleSetBrand = useCallback((newBrand: BrandType) => {
    setBrand(newBrand);
  }, []);

  const handleSetRefreshKey = useCallback((newKey: any) => {
    setRefreshKey(newKey ?? randomNumber(10));
  }, []);

  const handleSetQueryConfig = useCallback((config: Partial<QueryConfig>) => {
    setQueryConfigState((prev) => {
      const newConfig = { ...prev, ...config };

      // Log table changes for debugging
      if (config.table && config.table !== prev.table) {
        console.info(`✅ active table ${config.table ?? 'none'}`);
      }

      return newConfig;
    });
  }, []);

  const handleSetParams = useCallback(
    (newParams: { action: string; base: string; seg1: string }) => {
      setParams(newParams);
    },
    [],
  );

  const handleSetEssentials = useCallback((newEss: string[]) => {
    setEssentials(newEss);
  }, []);

  const handleRefreshPage = useCallback(
    (tags?: string[], rebuild = false, clear = false) => {
      if (!isNull(tags)) {
        tags?.forEach((tag) => {
          if (tag === 'all') {
            clearCache('all');
            if (clear) indexedDB.clearAllTables();
          } else {
            clearCache(tag);
            if (clear) indexedDB.clearTable(tag);
          }
        });
      } else {
        clearCache('all');
        if (clear) indexedDB.clearAllTables();
      }

      if (rebuild) {
        router.refresh();
      }

      setRefreshKey(randomNumber(10));
    },
    [setRefreshKey],
  );

  // Fetch products only when brand.slug changes
  useEffect(() => {
    let loading = true;

    const getDynamics = async () => {
      try {
        const cd = await indexedDB.queryData({
          table: queryConfig.table,
          conditions: queryConfig.conditions,
          sort: queryConfig.sortOptions,
          tag: queryConfig.tag,
        });
        if (!isNull(cd)) {
          setData(cd);
          loading = false;
        } else {
          loading = true;
        }
      } catch (error) {
        console.error(`Error fetching data from ${queryConfig.table} on context:`, error);
        setIsLoading(false);
      } finally {
        setIsLoading(loading);
      }
    };

    getDynamics();
  }, [queryConfig, refreshKey, brand.slug]);

  useEffect(() => {
    const getDynamics = async () => {
      if (isNull(queryConfig?.table)) return;

      try {
        const { data } = await getDynamicData({
          subBase: brand.slug ?? '',
          table: queryConfig.table,
          conditions: queryConfig.conditions,
          limit: queryConfig.limit,
          sortOptions: queryConfig.sortOptions,
          tag: queryConfig.tag,
          cache: false,
          remark: refreshKey ?? '',
        });

        if (!isNull(data) && Array.isArray(data) && data.length > 0) {
          setData(data);
          await indexedDB.clearTable(queryConfig.table ?? '', queryConfig.tag);
          await indexedDB.saveOrUpdateData({
            table: queryConfig.table,
            data,
            tag: queryConfig.tag ?? '',
            force: true,
          });
        }
      } catch (error) {
        console.error(`Error fetching data from ${queryConfig.table} on context:`, error);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    };

    getDynamics();
  }, [queryConfig, refreshKey, brand.slug]);

  const fetchData = useCallback(
    async (
      options: {
        table: string;
        tag: string;
        conditions: Record<string, any>;
        limit: number;
        sortOptions: SortOptions;
        brandSlug: string;
        essentials?: string[];
        forceFresh?: boolean;
      } = {
        table: queryConfig.table,
        tag: queryConfig.tag,
        conditions: queryConfig.conditions,
        limit: queryConfig.limit,
        sortOptions: queryConfig.sortOptions,
        brandSlug: brand.slug ?? '',
      },
    ) => {
      const { table, tag, conditions, limit, sortOptions, brandSlug, essentials, forceFresh } =
        options;

      try {
        const data = await indexedDB.queryData({
          table,
          conditions,
          sort: !isNull(sortOptions) ? sortOptions : { createdAt: -1 },
          limit,
          tag,
        });

        if (!isNull(data) && Array.isArray(data) && data.length > 0 && !forceFresh) {
          handleSetQueryConfig({ table, tag, conditions, limit, sortOptions });
          setData(data);
          return data;
        } else {
          const { data } = await getDynamicData({
            subBase: brand.slug ?? '',
            table,
            conditions,
            limit,
            sortOptions,
            tag,
            cache: !forceFresh,
            essentials,
            remark: refreshKey ?? '',
          });

          if (!isNull(data) && Array.isArray(data) && data.length > 0) {
            setData(data);
            await indexedDB.clearTable(table ?? '', tag);
            await indexedDB.saveOrUpdateData({ table, data, tag, force: true });
            return data;
          }
        }

        return null;
      } catch (error) {
        console.error(`Error fetching data from ${table} on context:`, error);
        return null;
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [queryConfig, brand.slug, refreshKey, handleSetQueryConfig],
  );

  const contextValue = useMemo(
    () => ({
      setBrand: handleSetBrand,
      setQueryConfig: handleSetQueryConfig,
      setRefreshKey: handleSetRefreshKey,
      setParams: handleSetParams,
      setEssentials: handleSetEssentials,
      refreshPage: handleRefreshPage,
      data,
      queryConfig,
      isLoading,
      refreshKey,
      fetchData,
    }),
    [
      handleSetBrand,
      handleSetQueryConfig,
      handleSetRefreshKey,
      handleSetParams,
      handleSetEssentials,
      handleRefreshPage,
      data,
      queryConfig,
      isLoading,
      refreshKey,
      fetchData,
    ],
  );

  return <DynamicContext.Provider value={contextValue}>{children}</DynamicContext.Provider>;
};

export const DynamicContextProvider = ({ children }: { children: ReactNode }) => {
  return <DynamicContextContent>{children}</DynamicContextContent>;
};

export const useDynamicContext = () => {
  const context = useContext(DynamicContext);
  if (!context || isNull(context)) {
    throw new Error('useDynamicContext must be used within a DynamicContextProvider');
  }
  return context;
};
