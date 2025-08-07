'use client';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useTransition,
  useMemo,
  useCallback,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { isNull } from '@/app/helpers/isNull';

interface BaseContextProps {
  isPending: boolean;
  isSideBarOpen: boolean;
  toggleIsSideBarOpen: () => void;
  setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onRouteData: OnRouteModel;
  setOnRouteData: (onRouteData: OnRouteModel) => void;
  onNextedRouteData: OnRouteModel[];
  addRouteData: (route: OnRouteModel) => void;
  removeRouteData: () => void;
  closeAllRoutes: () => void;
  searchParams: Record<string, any>;
  scrolled: boolean;
  setScrolled: (scrolled: boolean) => void;
}

const BaseContext = createContext<BaseContextProps | undefined>(undefined);

function BaseContextContent({ children }: { children: ReactNode }) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isPending] = useTransition();
  const [onRouteData, setOnRouteData] = useState<OnRouteModel>({
    isOpen: false,
    base: '',
    action: '',
    slug: '',
  });
  const [onNextedRouteData, setOnNextedRouteData] = useState<OnRouteModel[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const getSearchParams = useSearchParams();
  const [searchParams] = useState<Record<string, any>>(() => {
    const result: Record<string, any> = {};
    if (typeof window !== 'undefined' && getSearchParams) {
      getSearchParams.forEach((value, key) => {
        result[key] = value;
      });
    }
    return result;
  });

  const toggleIsSideBarOpen = useCallback(() => {
    setIsSideBarOpen((prev) => !prev);
  }, []);

  const addRouteData = useCallback((route: OnRouteModel) => {
    setOnNextedRouteData((prev = []) => {
      const updated = prev.filter(
        (r) =>
          !(
            r.base === route.base &&
            r.action === route.action &&
            r.type === route.type &&
            r.searchParams === route.searchParams
          ),
      );
      return [...updated, route];
    });
  }, []);

  const removeRouteData = useCallback(() => {
    setOnNextedRouteData((prev) => {
      if (prev.length > 0) {
        const updated = [...prev];
        const last = updated.pop();
        if (last) last.isOpen = false;
        return updated;
      }
      return prev;
    });
  }, []);

  const closeAllRoutes = useCallback(() => {
    setOnNextedRouteData([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      isPending,
      isSideBarOpen,
      toggleIsSideBarOpen,
      setIsSideBarOpen,
      onRouteData,
      setOnRouteData,
      onNextedRouteData,
      addRouteData,
      removeRouteData,
      searchParams,
      scrolled,
      setScrolled,
      closeAllRoutes,
    }),
    [
      isPending,
      isSideBarOpen,
      toggleIsSideBarOpen,
      onRouteData,
      onNextedRouteData,
      searchParams,
      scrolled,
      closeAllRoutes,
    ],
  );

  return <BaseContext.Provider value={contextValue}>{children}</BaseContext.Provider>;
}

export const BaseContextProvider = ({ children }: { children: ReactNode }) => {
  return <BaseContextContent>{children}</BaseContextContent>;
};

export const useBaseContext = () => {
  const context = useContext(BaseContext);
  if (!context || isNull(context)) {
    throw new Error('useBaseContext must be used within a BaseContextProvider');
  }
  return context;
};
