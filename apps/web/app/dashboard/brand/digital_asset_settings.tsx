import React, { useState } from "react";
import { ToggleSwitch } from "@/app/widgets/toggle_switch_button";
import { UseFormReturn } from "react-hook-form";
import DigitalAssetRuleInput from "./digital_asset_rule";
import CustomDrawer from "@/app/src/custom_drawer";
import { RaisedButton } from "@/app/widgets/raised_button";
import { Settings } from "lucide-react";
import IconButton from "@/app/widgets/icon_button";
import { Card, CardContent } from "@/components/ui/card";
import UnigueBrandSettings from "./unique_brand_settings";
import { CustomButton } from "@/app/widgets/custom_button";
import CustomCard from "@/app/widgets/custom_card";

interface DASettingsProps {
  handleSwitchChange: (
    name: keyof SwitchStates
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  switchStates: SwitchStates;
  methods: UseFormReturn<any>;
  rules: any[];
  user: UserTypes;
  siteInfo: BrandType;
  pages: PageModel[];
  handleServiceSettings: (key: string, name: string, value: any) => void;
  data: BrandType;
}

const DASettings: React.FC<DASettingsProps> = ({
  handleSwitchChange,
  switchStates,
  methods,
  rules,
  user,
  siteInfo,
  pages,
  data = {},
  handleServiceSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="m-0">
      <div className="border-t border-gray-500 bg-white">
        <div className="flex flex-row justify-between items-center py-1 mx-2">
          <label className="text-xs sm:text-sm w-full">Crypto, Gift/Virtual Card Plateform</label>

          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row justify-between items-center">
              <ToggleSwitch
                name="digital_assets"
                label=""
                onChange={handleSwitchChange("digital_asset")}
                checked={switchStates.digital_asset}
              />
            </div>
            <div className="w-auto h-6">
              <CustomButton onClick={() => setIsOpen(true)} icon={<Settings className="w-3 h-3" />}>
                Edit Setting
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      <CustomDrawer
        isWidthFull={"auto"}
        className="w-64"
        direction="right"
        isOpen={isOpen}
        isHeightFull={true}
        onClose={() => setIsOpen(false)}
        header="Settings"
      >
        <div className="flex flex-col space-y-5 py-5 px-2 mt-4">
          <UnigueBrandSettings
            brandKey="digital_asset"
            user={user}
            siteInfo={siteInfo}
            handleUniqueBrandSettings={handleServiceSettings}
            pages={pages}
            data={data}
          />

          <div className="flex flex-col sm:flex-row w-full">
            <CustomCard title="Digital Asset Rule Settings">
              <DigitalAssetRuleInput user={user!} siteInfo={siteInfo!} />
            </CustomCard>
          </div>
        </div>
      </CustomDrawer>
    </div>
  );
};

export default DASettings;
