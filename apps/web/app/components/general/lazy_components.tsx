// components/LazyComponent.tsx
import Offline from '@/app/dashboard/offline';
import { loadComponentAsync } from '@/app/utils/lazy_loader';
import React, { useEffect, useState } from 'react';

type LazyComponentProps = {
  componentName: string;
  importFn: () => Promise<any>;
  children: (Component: any) => React.ReactNode;
  fallback?: React.ReactNode;
};

const LazyComponent: React.FC<LazyComponentProps> = ({
  componentName,
  importFn,
  children,
  fallback = (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
    </div>
  ),
}) => {
  const [Component, setComponent] = useState<any>(() => null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComponentAsync(componentName, importFn).then((loadedComponent) => {
      setComponent(() => loadedComponent);
      setLoading(false);
    });
  }, [componentName, importFn]);

  if (loading) return fallback;
  if (!Component) return <Offline />;

  return <>{children(Component)}</>;
};

export default LazyComponent;
