import React, { useMemo, useState } from "react";
import { ToggleSwitch } from "@/app/widgets/toggle_switch_button";
import { UseFormReturn } from "react-hook-form";
import CustomDrawer from "@/app/src/custom_drawer";
import { RaisedButton } from "@/app/widgets/raised_button";
import { Settings } from "lucide-react";
import IconButton from "@/app/widgets/icon_button";
import { Card, CardContent } from "@/components/ui/card";
import UnigueBrandSettings from "./unique_brand_settings";
import { CustomButton } from "@/app/widgets/custom_button";

interface BloggerSettingsProps {
  handleSwitchChange: (
    name: keyof SwitchStates
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: (name: string, value: any) => void;
  switchStates: SwitchStates;
  methods: UseFormReturn<any>;
  rules: any[];
  user: UserTypes;
  siteInfo: BrandType;
  pages: PageModel[];
  handleServiceSettings: (key: string, name: string, value: any) => void;
  data: BrandType;
}

const BloggerSettings: React.FC<BloggerSettingsProps> = ({
  handleSwitchChange,
  switchStates,
  setValue,
  methods,
  rules,
  user,
  siteInfo,
  pages,
  data = {},
  handleServiceSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [blogMonetization, setblogMonetization] = useState<boolean>(
    methods.watch("blogMonetization") || false
  );

  return (
    <div className="m-0">
      <div className="border-y border-gray-500 bg-white">
        <div className="flex flex-row justify-between items-center my-1 mx-2">
          <label className="text-xs sm:text-sm w-full">Blog & News Portal</label>

          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row justify-between items-center">
              <ToggleSwitch
                controlled={false}
                name="blog"
                label=""
                onChange={handleSwitchChange("blog")}
                checked={switchStates.blog}
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
        <div className="m-2">
          <UnigueBrandSettings
            brandKey="creator"
            user={user}
            siteInfo={siteInfo}
            handleUniqueBrandSettings={handleServiceSettings}
            pages={pages}
            data={data}
          />
        </div>
      </CustomDrawer>
    </div>
  );
};

export default BloggerSettings;
