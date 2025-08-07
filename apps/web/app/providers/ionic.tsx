'use client';

import NoSSRWrapper from '@/app/components/NoSSRWrapper';

// setupIonicReact();

export function IonicDashProviders({ children }: { children: React.ReactNode }) {
  return <NoSSRWrapper>{children}</NoSSRWrapper>;
}
