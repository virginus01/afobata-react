'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Brand } from '@/app/models/Brand';
import { isNull } from '@/app/helpers/isNull';
import { initServiceWorker } from '@/app/sw-init';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  initServiceWorker();
}

interface GlobalEssentialContextProps {
  siteInfo: Brand;
  messages: Record<any, any>;
}

const GlobalEssentialContext = createContext<GlobalEssentialContextProps | undefined>(undefined);

export const GlobalEssentialProvider = ({
  siteInfo,
  messages,
  children,
}: {
  siteInfo: Brand;
  messages: Record<any, any>;
  children: ReactNode;
}) => {
  return (
    <GlobalEssentialContext.Provider value={{ siteInfo, messages }}>
      {children}
    </GlobalEssentialContext.Provider>
  );
};

export const useGlobalEssential = () => {
  const context = useContext(GlobalEssentialContext);
  if (!context || isNull(context)) {
    throw new Error('useGlobalEssential must be used within a GlobalEssentialProvider');
  }
  return context;
};
