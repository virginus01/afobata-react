import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Link as LinkIcon, Tag, AlignLeft } from "lucide-react";
import IconButton from "@/app/widgets/icon_button";
import FormInput from "@/app/widgets/hook_form_input";
import CustomCard from "@/app/widgets/custom_card";

interface CreatorSettingsProps {
  methods: UseFormReturn<any>;
  user: UserTypes;
  siteInfo: BrandType;
  data: BrandType;
}

const BrandSEOSettings: React.FC<CreatorSettingsProps> = ({ methods, user, siteInfo, data }) => {
  return (
    <div className="space-y-4 p-1">
      <CustomCard title="  Search Engine Optimization" className="w-full">
        <div className="space-y-8">
          <div className="relative">
            <FormInput
              icon={<Tag className=" h-4 w-4 text-gray-400" />}
              id="metaTitle"
              name="metaTitle"
              placeholder="Enter meta title"
              className="w-full"
              label=" Meta Title"
            />
          </div>

          {/* Meta Description */}

          <div className="relative">
            <FormInput
              methods={methods}
              icon={<AlignLeft className=" h-4 w-4 text-gray-400" />}
              id="metaDescription"
              name="metaDescription"
              placeholder="Meta description"
              className="w-full border rounded p-2 text-sm"
              rows={3}
              label="Meta description"
              type="textarea"
            />
          </div>

          {/* Meta Keywords */}

          <div className="relative">
            <FormInput
              icon={<Tag className="  h-4 w-4 text-gray-400" />}
              id="metaKeywords"
              name="metaKeywords"
              placeholder="Enter keywords separated by commas"
              className="w-full"
              label=" Meta Keywords"
            />
          </div>

          {/* Canonical URL */}

          <div className="relative">
            <FormInput
              icon={<LinkIcon className="  h-4 w-4 text-gray-400" />}
              id="canonicalUrl"
              name="canonicalUrl"
              placeholder="Enter canonical URL"
              className="w-full"
              label="  Canonical URL"
            />
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default BrandSEOSettings;
