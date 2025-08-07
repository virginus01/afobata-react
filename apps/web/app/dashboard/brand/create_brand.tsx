import { CustomButton } from '@/app/widgets/custom_button';
import React, { useState } from 'react';

const CreateBrand: React.FC<{ siteInfo: BrandType; user: UserTypes }> = ({ siteInfo, user }) => {
  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex items-center justify-center py-48">
        <div className="flex items-center justify-center flex-col">
          <div className="text-xs">You do not have a brand yet</div>
          <div className="w-auto h-auto pt-20">Kindly set up your brand first</div>
        </div>
      </div>
    </div>
  );
};

export default CreateBrand;
