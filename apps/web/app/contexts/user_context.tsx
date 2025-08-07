'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import useSWR from 'swr';
import { clientHeaders } from '@/app/helpers/clientHeaders';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import { getEssentials } from '@/app/helpers/getEssentials';
import { show_error } from '@/app/helpers/show_error';
import GetNavigation from '@/app/navigation';
import indexedDB from '@/app/utils/indexdb';

import { api_get_logged_user } from '@/app/routes/api_routes';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';
import { Brand } from '@/app/models/Brand';
import { removeUnserializable } from '@/helpers/removeUnserializable';
import { fetchExchangeRates } from '@/helpers/fetchExchangeRates';
import { useCart } from '@/app/contexts/cart_context';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserContextProvider = ({
  auth,
  children,
}: {
  children: ReactNode;
  auth: AuthModel;
}) => {
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserTypes | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isSwitchProfileOpen, setIsSwitchProfileOpen] = useState<boolean>(false);
  const [nav, setNav] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const { siteInfo } = useGlobalEssential();
  const [walletType, setWalletType] = useState('store');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [params, setParams] = useState<{ action: string; base: string; seg1: string }>({
    action: '',
    base: '',
    seg1: '',
  });
  const [essentialData, setEssentialData] = useState({
    user: {} as UserTypes,
    auth: auth,
    siteInfo: (siteInfo as any) || ({} as any),
    brand: {} as BrandType,
    nav: {} as any,
    rates: {},
  });
  const [loadedCache, setLoadedCache] = useState(false);
  const [essentialDataLoading, setEssentialDataLoading] = useState(true);
  const { refreshKey } = useDynamicContext();
  const { exchangeRates } = useCart();
  const hasFetchedFreshDataRef = useRef(false);

  const toggleIsSwitchProfileOpen = useCallback(() => {
    setIsSwitchProfileOpen((prev) => !prev);
  }, []);

  const fetchUser = async ([key, brandId, userRefreshKey]: [string, string, string]) => {
    try {
      const headers = clientHeaders({ auth });

      const url = await api_get_logged_user({
        subBase: brandId,
        remark: `user-controller-fetch-user-${userRefreshKey}`,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        next: {
          revalidate: process.env.NODE_ENV === 'production' ? 3600 : 2,
          tags: ['user'],
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch user: ${response.status} ${response.statusText} @ ${url}`);
        return null; // ✅ Let SWR cache continue
      }

      const { data, status, msg } = await response.json();

      if (!status || !data) {
        console.warn(`User fetch failed: ${msg}`);
        return null; // ✅ Let SWR cache continue
      }

      return data;
    } catch (err) {
      console.error('Silent fetchUser error:', err);
      return null; // ✅ Let SWR serve fallback
    }
  };

  const updateEssentialData = useCallback(
    ({
      user,
      auth,
      brand,
      siteInfo,
      nav,
      rates,
    }: {
      user?: UserTypes;
      auth?: AuthModel;
      brand?: Brand;
      siteInfo?: any;
      nav?: any;
      rates?: any;
    }) => {
      setEssentialData((prev) => {
        const updated = { ...prev };

        if (!isNull(user)) {
          updated.user = { ...user };
          indexedDB.saveOrUpdateData({ table: 'user', data: updated.user, force: true });
        }

        if (!isNull(user?.brand ?? {})) {
          updated.brand = { ...user?.brand };
          indexedDB.saveOrUpdateData({ table: 'brand', data: updated.brand, force: true });
        }

        if (!isNull(auth)) {
          updated.auth = { ...auth };
          indexedDB.saveOrUpdateData({ table: 'auth', data: updated.auth, force: true });
        }

        if (!isNull(siteInfo)) {
          updated.siteInfo = { ...siteInfo };
          indexedDB.saveOrUpdateData({ table: 'siteInfo', data: updated.siteInfo, force: true });
        }

        if (!isNull(nav)) {
          updated.nav = { ...nav };
          indexedDB.saveOrUpdateData({ table: 'nav', data: updated.nav, force: true });
        }

        if (!isNull(rates)) {
          updated.rates = { ...rates };
          indexedDB.saveOrUpdateData({ table: 'rates', data: updated.rates, force: true });
        }

        setSelectedProfile(user?.selectedProfile ?? 'custom');

        return updated;
      });
    },
    [],
  );

  useLayoutEffect(() => {
    const loadCache = async () => {
      try {
        const [brandData] = await indexedDB.queryData({ table: 'brand', conditions: {} });
        const [siteInfoData] = await indexedDB.queryData({ table: 'siteInfo', conditions: {} });
        const [userData] = await indexedDB.queryData({ table: 'user', conditions: {} });
        const [authData] = await indexedDB.queryData({ table: 'auth', conditions: {} });
        const [navData] = await indexedDB.queryData({ table: 'nav', conditions: {} });
        const [rateData] = await indexedDB.queryData({ table: 'rates', conditions: {} });

        updateEssentialData({
          brand: brandData,
          user: userData,
          auth: authData,
          nav: navData,
          rates: rateData,
          siteInfo: siteInfoData,
        });

        if (
          !findMissingFields({
            userData,
            authData,
            brandData,
            nav: navData,
            rateData,
            siteInfoData,
          })
        ) {
          setEssentialDataLoading(false);
        }

        setLoadedCache(true);
      } catch (error) {
        console.error('Error loading cache:', error);
      }
    };

    loadCache();
  }, [updateEssentialData]);

  const { data: swrUser, error: swrError } = useSWR(
    auth?.brandId ? ['fetch_user', auth.brandId, refreshKey] : null,
    fetchUser,
  );

  useEffect(() => {
    if (!swrUser || hasFetchedFreshDataRef.current || !loadedCache) return;

    const processUser = async () => {
      try {
        const { brand } = await getEssentials({ fromCdn: true });

        const navD = await GetNavigation({
          selectedProfile: swrUser?.selectedProfile ?? '',
          user: swrUser,
          siteInfo: brand,
        });

        const nav = removeUnserializable(navD);
        const { rates } = await fetchExchangeRates({ fromCdn: true });

        const missing = findMissingFields({
          user: swrUser,
          brand: swrUser?.brand,
          auth: swrUser.auth || auth,
          siteInfo,
          nav,
          rates,
        });

        if (missing) {
          show_error(`${missing} couldn't be fetched`, 'dashboard', false);
        }

        updateEssentialData({
          user: !isNull(swrUser) ? swrUser : essentialData.user,
          auth: swrUser?.auth ?? auth,
          brand: !isNull(swrUser) ? swrUser.brand : essentialData?.brand,
          siteInfo,
          nav,
          rates,
        });

        setEssentialDataLoading(false);
        hasFetchedFreshDataRef.current = true;
      } catch (err) {
        console.error('Failed processing SWR user:', err);
        setEssentialDataLoading(false);
      }
    };

    processUser();
  }, [swrUser, loadedCache, refreshKey, updateEssentialData]);

  useEffect(() => {
    hasFetchedFreshDataRef.current = false;
    if (refreshKey) {
      console.info(`✅ new refresh key`, refreshKey);
    }
  }, [refreshKey]);

  return (
    <UserContext.Provider
      value={{
        user,
        userId,
        isLogged,
        isUserSidebarOpen,
        isUserLoaded,
        nav,
        isSwitchProfileOpen,
        profiles,
        wallets,
        selectedProfile,
        essentialData,
        essentialDataLoading,
        params,
        setEssentialData,
        setParams,
        setWallets,
        setSelectedProfile,
        setWalletType,
        toggleIsSwitchProfileOpen,
        setIsSwitchProfileOpen,
        setUser,
        setUserId,
        setIsLogged,
        setIsUserSidebarOpen,
        setLinks,
        updateEssentialData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context || isNull(context)) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};
