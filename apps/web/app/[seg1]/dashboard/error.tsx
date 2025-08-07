'use client';

import { useBaseContext } from '@/app/contexts/base_context';
import { isNull } from '@/app/helpers/isNull';
import { CustomButton } from '@/app/widgets/custom_button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const { removeRouteData, onNextedRouteData } = useBaseContext();
  const router = useRouter();

  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex items-center justify-center py-48">
        <div className="flex items-center justify-center flex-col">
          <div className="text-center p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Something went wrong!</h2>
            <CustomButton
              className="w-1/2"
              onClick={() => {
                if (!isNull(onNextedRouteData)) {
                  removeRouteData();
                } else {
                  router.back();
                }
                reset();
              }}
            >
              Go Back
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
