'use client';
import React, { useCallback, useEffect, useState } from 'react';
import FormInput from '@/app/widgets/hook_form_input';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { constantAddons, options } from '@/app/package_tags';
import { UseFormReturn } from 'react-hook-form';
import CustomCard from '@/app/widgets/custom_card';
import { toast } from 'sonner';
import { isAdmin } from '@/app/helpers/isAdmin';

interface PackageAddonProps {
  data: DataType;
  parentData: DataType;
  setAddons: React.Dispatch<React.SetStateAction<AddonType[]>>;
  addons: AddonType[];
  setValue: (name: string, value: any) => void;
  methods: UseFormReturn<any>;
  isDroping?: boolean;
  user?: UserTypes;
}

interface AddonType {
  id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  value: number;
  tag: any;
  available: boolean;
  hasValue: boolean;
}

const PackageAddonsSelection: React.FC<PackageAddonProps> = ({
  data,
  parentData,
  addons,
  isDroping,
  user,
  setAddons,
  setValue,
  methods,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const handleValueChange = useCallback(
    ({ addon, id, value }: { addon: any; id: string; value: any }) => {
      setValue(`${addon.id}_${id}`, value);
      setAddons((prevAddons: AddonType[]) =>
        prevAddons.map((a: AddonType) => (a.id === addon.id ? { ...a, [id]: value } : a)),
      );
    },
    [setAddons, setValue],
  );

  useEffect(() => {}, [addons]);

  function processAddons(dataAddons: any[], resData: any[]): AddonType[] {
    if (dataAddons && dataAddons.length > 0) {
      const existingAddonsMap = new Map<string, AddonType>(
        dataAddons.map((item) => [
          item.id,
          {
            id: item.id,
            title: item.title,
            value: parseInt(item.value, 10),
            tag: item.id,
            short_desc: item.short_desc,
            long_desc: item.long_desc,
            available: item.available,
            hasValue: item.hasValue,
          },
        ]),
      );

      resData.forEach((item) => {
        if (!existingAddonsMap.has(item.id)) {
          existingAddonsMap.set(item.id, {
            id: item.id,
            title: item.title,
            tag: item.id,
            short_desc: item.short_desc,
            long_desc: item.long_desc,
            value: 0,
            available: false,
            hasValue: false,
          });
        }
      });

      return Array.from(existingAddonsMap.values());
    } else {
      return resData.map((item) => ({
        id: item.id,
        title: item.title,
        tag: item.id,
        short_desc: item.short_desc,
        long_desc: item.long_desc,
        value: 0,
        available: false,
        hasValue: false,
      }));
    }
  }

  useEffect(() => {
    if (!isInitialized) {
      const getAddons = async () => {
        try {
          let newAddons = processAddons([], constantAddons);

          if (data && data.addons) {
            newAddons = processAddons(data.addons, constantAddons);
          }

          setAddons(newAddons);

          newAddons.forEach((addon: any) => {
            // Set form values for each addon
            setValue(`${addon.id}_title`, addon.title || '');
            setValue(`${addon.id}_value`, addon.value || 0);
            setValue(`${addon.id}_short_desc`, addon.title ?? '');
            setValue(`${addon.id}_long_desc`, addon.title ?? '');
            setValue(`${addon.id}_tag`, addon.tag || addon.id);
            setValue(`${addon.id}`, addon.available || false);
            setValue(`${addon.id}_hasValue`, addon.hasValue || false);
            setValue(`${addon.id!}_available`, addon.available ?? false);
          });
        } catch (error) {
          console.error('Error fetching course data:', error);
        }
      };
      getAddons();
      setIsInitialized(true);
    }
  }, [data, isInitialized, setValue, setAddons]);

  return (
    <div className="flex flex-col space-y-2 text-xs">
      {addons.map((item, i) => {
        const parentAddon = parentData.addons?.find((a) => a.id === item.id);

        return (
          <div key={i}>
            <CustomCard
              title={item.title}
              topRightWidget={
                <ToggleSwitch
                  className="text-xs"
                  name={`${item.id!}_available`}
                  label=""
                  onChange={(e) => {
                    if (!isAdmin(user) && !parentAddon?.available && e.target.checked) {
                      toast.error("you can't enable this");
                      return;
                    }

                    handleValueChange({
                      addon: item,
                      id: 'available',
                      value: e.target.checked,
                    });
                  }}
                  checked={methods.watch(`${item.id!}_available`)}
                />
              }
              bottomWidget={
                methods.watch(`${item.id!}_available`) && (
                  <div className="flex flex-row justify-between py-0 inset-0">
                    <ToggleSwitch
                      className="text-xs"
                      name={`${item.id!}_hasValue`}
                      label="Has Value"
                      onChange={(e) => {
                        if (!isAdmin(user)) {
                          toast.error("you can't do this");
                          return;
                        }
                        handleValueChange({
                          addon: item,
                          id: 'hasValue',
                          value: e.target.checked,
                        });
                      }}
                      checked={methods.watch(`${item.id!}_hasValue`)}
                    />
                    <div className="w-28">
                      <FormInput
                        label="value"
                        showPrefix={false}
                        className="w-full text-xs h-6 py-0"
                        name={`${item.id}_value`}
                        type="number"
                        placeholder="Value"
                        disabled={!methods.watch(`${item.id!}_hasValue`) || !isAdmin(user)}
                        onBlur={(e) => {
                          if (methods.watch(`${item.id!}_hasValue`) || isAdmin(user)) {
                            handleValueChange({
                              addon: item,
                              id: 'value',
                              value: e.target.value,
                            });
                          } else {
                            toast.error("You can't do this");
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              }
            >
              {methods.watch(`${item.id!}_available`) && (
                <div className="flex flex-row justify-between w-full space-x-4">
                  <FormInput
                    label="long title"
                    showPrefix={false}
                    className="w-full text-xs h-4 sm:py-2"
                    name={`${item.id}_long_desc`}
                    type="text"
                    placeholder="Title"
                    onBlur={(e) =>
                      handleValueChange({
                        addon: item,
                        id: 'long_desc',
                        value: e.target.value,
                      })
                    }
                  />
                  <FormInput
                    label="short title"
                    showPrefix={false}
                    className="w-full text-xs"
                    name={`${item.id}_short_desc`}
                    type="text"
                    placeholder="Name"
                    onBlur={(e) =>
                      handleValueChange({
                        addon: item,
                        id: 'short_desc',
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </CustomCard>
          </div>
        );
      })}
    </div>
  );
};

export default PackageAddonsSelection;
