import React, { useMemo, useState } from "react";
import { ToggleSwitch } from "@/app/widgets/toggle_switch_button";
import { UseFormReturn } from "react-hook-form";
import { RuleInput } from "./rules_form";
import { RaisedButton } from "@/app/widgets/raised_button";
import CustomDrawer from "@/app/src/custom_drawer";
import IconButton from "@/app/widgets/icon_button";
import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import UnigueBrandSettings from "./unique_brand_settings";
import CustomCard from "@/app/widgets/custom_card";
import { CustomButton } from "@/app/widgets/custom_button";
import { defaultRules } from "./rules";

interface UtilitySettingsProps {
  handleSwitchChange: (
    name: keyof SwitchStates
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  switchStates: any;
  methods: UseFormReturn<any>;
  onRuleChange: (data: Rule) => void;
  rules: any[];
  user: UserTypes;
  siteInfo: BrandType;
  pages: PageModel[];
  handleServiceSettings: (key: string, name: string, value: any) => void;
  data: BrandType;
}

const UtilitySettings: React.FC<UtilitySettingsProps> = ({
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
  const [useDefault, setUseDefault] = useState(false);

  let filteredRules: any[] = useDefault ? defaultRules : methods.watch("rules") || [];
  filteredRules = filteredRules.filter((f) => f.type === "utility");

  return (
    <div className="m-0">
      <div className="border-t border-gray-500 bg-white">
        <div className="flex flex-row justify-between items-center my-1 mx-2">
          <label className="text-xs sm:text-sm w-full">Utility Bill Plateform</label>

          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row justify-between items-center">
              <ToggleSwitch
                name="utility"
                label=""
                onChange={handleSwitchChange("utility")}
                checked={switchStates.utility}
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
        onClose={() => setIsOpen(false)}
        header="Settings"
      >
        <div className="flex flex-col space-y-5 m-2">
          <UnigueBrandSettings
            brandKey="utility"
            user={user}
            siteInfo={siteInfo}
            handleUniqueBrandSettings={handleServiceSettings}
            pages={pages}
            data={data}
          />

          <CustomCard
            title="Price settings"
            bottomWidget={
              <i>
                Note: What you set here determines your profit/loss margin. Products like TV have a
                fixed amount. You should not set above the fixed amount so you won&apos;t discourage
                your customers.
              </i>
            }
          >
            <div className="flex flex-col space-y-6 mt-4 p-2">
              {filteredRules.map((rule: Rule, index: number) => (
                <div key={rule.name} className="my-3">
                  <RuleInput
                    index={index}
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

              <div className="flex justify-end items-end">
                <CustomButton
                  className="w-auto"
                  disabled={useDefault}
                  onClick={() => setUseDefault(!useDefault)}
                >
                  Use Default
                </CustomButton>
              </div>
            </div>
          </CustomCard>
        </div>
      </CustomDrawer>
    </div>
  );
};

export default UtilitySettings;
