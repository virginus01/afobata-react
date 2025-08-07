"use client";
import React, { useState } from "react";
import CustomCard from "@/app/widgets/custom_card";

// Main Product Detail Header Component
const DescriptionCard = ({
  data,
  siteInfo,
  auth,
}: {
  data: DataType;
  siteInfo: BrandType;
  auth: AuthModel;
}) => {
  let product: any = {
    ...data,
  };

  return (
    <div>
      {product.description && (
        <CustomCard title="Description">
          <div
            className="leading-relaxed text-gray-600"
            dangerouslySetInnerHTML={{ __html: data.description ?? "" }}
          />
        </CustomCard>
      )}
    </div>
  );
};

export default DescriptionCard;
