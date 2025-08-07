import React, { useState } from "react";
import { ToggleSwitch } from "@/app/widgets/toggle_switch_button";
import { UseFormReturn } from "react-hook-form";
import { ProductRuleInput } from "./product_rule_form";
import CustomDrawer from "@/app/src/custom_drawer";
import { RaisedButton } from "@/app/widgets/raised_button";
import { toast } from "sonner";
import { RuleInput } from "./rules_form";
import IconButton from "@/app/widgets/icon_button";
import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import UnigueBrandSettings from "./unique_brand_settings";
import { CustomButton } from "@/app/widgets/custom_button";
import CustomCard from "@/app/widgets/custom_card";

interface StoreSettingsProps {
  handleSwitchChange: (
    name: keyof SwitchStates
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRuleChange: (data: Rule) => void;
  switchStates: SwitchStates;
  methods: UseFormReturn<any>;
  rules: any[];
  user: UserTypes;
  siteInfo: BrandType;
  pages: PageModel[];
  handleServiceSettings: (key: string, name: string, value: any) => void;
  data: BrandType;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({
  handleSwitchChange,
  onRuleChange,
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

  let filteredRules: any[] = methods.watch("rules") || [];
  filteredRules = filteredRules.filter((f) => f.type === "product");

  return (
    <div className="m-0">
      <div className="border-t border-gray-500 bg-white">
        <div className="flex flex-row justify-between items-center my-1 mx-2">
          <label className="text-xs sm:text-sm w-full">Ecommerce Store</label>

          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row justify-between items-center">
              <ToggleSwitch
                name="store"
                label=""
                onChange={handleSwitchChange("store")}
                checked={switchStates.store}
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
        isHeightFull={true}
        isWidthFull={"auto"}
        className="w-64"
        direction="right"
        isOpen={isOpen}
        onClose={() => {
          toast.info("don't forget to save");
          setIsOpen(false);
        }}
        header="Settings"
      >
        <div className="flex flex-col space-y-6 mt-4 p-2">
          <UnigueBrandSettings
            brandKey="store"
            user={user}
            siteInfo={siteInfo}
            handleUniqueBrandSettings={handleServiceSettings}
            pages={pages}
            data={data}
          />

          <CustomCard
            title="Imported Products Price"
            bottomWidget={
              <i className="text-gray-500 mt-2 text-xs">
                This applies to products you do not own but are selling on your platform. Note: What
                you set here determines your profit/loss margin. + means you will gain while - means
                you will loose and all is capped. If you set -, it will affect your commission.
              </i>
            }
          >
            {filteredRules.map((rule: Rule, index: number) => (
              <div key={rule.name} className="my-3">
                <RuleInput
                  index={index}
                  title={""}
                  id={rule.name ?? String(index)}
                  rule={rule}
                  subject={rule.name}
                  siteInfo={siteInfo}
                  user={user}
                  onChange={(e) => {
                    onRuleChange(e);
                  }}
                />
              </div>
            ))}
          </CustomCard>
        </div>
      </CustomDrawer>
    </div>
  );
};

export default StoreSettings;
