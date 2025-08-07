import { useBaseContext } from '@/app/contexts/base_context';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';
import { RaisedButton } from '@/app/widgets/raised_button';
import React from 'react';

export default function ProductInhouseAds() {
  const { siteInfo } = useGlobalEssential();
  return (
    <div className="my-5">
      <div className="flex flex-col space-y-3 border border-red-500 rounded-md p-2 animate-in">
        <div className="text-sm">
          Did you know the owner of {siteInfo.name} earns money just from you viewing this page,
          even if you don’t buy anything? You can do the same—sell your products and earn from page
          views too.
        </div>

        <div className="flex justify-center">
          <RaisedButton size="auto" color="auto" className="animate-pulse w-auto">
            Get started and start earning now
          </RaisedButton>
        </div>
      </div>
    </div>
  );
}
