import React, { useEffect, useMemo, useState } from 'react';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { UseFormReturn } from 'react-hook-form';
import CommRuleInput from '@/dashboard/brand/commission_rule_form';
import MonetizeRuleInput from '@/dashboard/brand/monetize_rule_form';
import CustomDrawer from '@/app/src/custom_drawer';
import { Settings } from 'lucide-react';
import UnigueBrandSettings from '@/dashboard/brand/unique_brand_settings';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { defaultRules } from '@/dashboard/brand/rules';

interface CreatorSettingsProps {
  handleSwitchChange: (
    name: keyof SwitchStates,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: (name: string, value: any) => void;
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

const CreatorSettings: React.FC<CreatorSettingsProps> = ({
  handleSwitchChange,
  setValue,
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

  const [allowMonetization, setAllowMonetization] = useState<boolean>(
    methods.watch('allowMonetization') || false,
  );

  let filteredRules: any[] = useDefault ? defaultRules : methods.watch('rules') || [];
  filteredRules = filteredRules.filter((f) => f.type === 'package');

  useEffect(() => {}, [useDefault]);

  return (
    <div className="m-0">
      <div className="border-t border-gray-500 bg-white">
        <div className="flex flex-row justify-between items-center my-1 mx-2">
          <label className="text-xs sm:text-sm w-full">Creator (Exactly as {siteInfo.name})</label>

          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row justify-between items-center">
              <ToggleSwitch
                name="creator"
                label=""
                onChange={handleSwitchChange('creator')}
                checked={switchStates.creator}
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
        isWidthFull={'auto'}
        className="w-64"
        direction="right"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        header="Settings"
      >
        <div className="flex flex-col h-full space-y-5 m-2 overflow-y-auto">
          <UnigueBrandSettings
            brandKey="creator"
            user={user}
            siteInfo={siteInfo}
            handleUniqueBrandSettings={handleServiceSettings}
            pages={pages}
            data={data}
          />

          <div className="flex flex-col sm:flex-row w-full">
            <CustomCard title="Sales Commission">
              <CommRuleInput user={user!} siteInfo={siteInfo!} />
            </CustomCard>
            <CustomCard
              title="Revenue Share"
              topRightWidget={
                <div className="h-4">
                  <ToggleSwitch
                    controlled={false}
                    name="monetize"
                    label=""
                    onChange={() => {
                      setValue('allowMonetization', true);
                      setAllowMonetization((p) => !p);
                    }}
                    checked={allowMonetization}
                  />
                </div>
              }
            >
              {methods.watch('allowMonetization') && (
                <MonetizeRuleInput user={user!} siteInfo={siteInfo!} />
              )}
            </CustomCard>
          </div>

          <div className="flex justify-end items-end">
            <CustomButton
              className="w-auto"
              disabled={useDefault}
              onClick={() => {
                setUseDefault(!useDefault);
                setValue('share_value', 50);
                setValue('sales_commission', 2);
              }}
            >
              Use Default
            </CustomButton>
          </div>
        </div>
      </CustomDrawer>
    </div>
  );
};

export default CreatorSettings;
