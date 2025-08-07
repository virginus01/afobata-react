'use client';

import { createContext, useContext, useState, ReactNode, HTMLAttributes } from 'react';

interface DrawerContextType {
  onSaveData: any;
  setOnSaveData: (data: any) => void;
}

// Create the context
const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

// Extend HTMLAttributes to accept any extra props
interface DrawerProviderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Export the provider
export const DrawerProvider = ({ children, ...rest }: DrawerProviderProps) => {
  const [onSaveData, setOnSaveData] = useState<any>({});

  return (
    <DrawerContext.Provider value={{ onSaveData, setOnSaveData }}>
      <div {...rest}>{children}</div> {/* inherits all props here */}
    </DrawerContext.Provider>
  );
};

// Export the hook
export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within DrawerProvider');
  return context;
};
