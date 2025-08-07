'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { CustomButton } from '@/app/widgets/widgets';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import FormInput from '@/app/widgets/hook_form_input';
import { api_get_addons } from '@/app/src/constants';
import { useBaseContext } from '@/app/contexts/base_context';
import { useUserContext } from '@/app/contexts/user_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { isNull } from '@/app/helpers/isNull';
import FormSelect from '@/app/widgets/hook_form_select';
import { constantAddons, options } from '@/app/package_tags';
import { ConfirmModal } from '@/app/widgets/confirm';
import { FaPaperPlane } from 'react-icons/fa';

interface CourseFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  formData: ProductTypes;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any,
  ) => void;
  handleSelectChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  data: any;
  submitting: boolean;
  options: { value: string; label: string }[];
  actionTitle?: string;
  action?: string;
  iniAddons: any[];
  setIniAddons: (iniAddons: any) => void;
}

interface AddonType {
  id?: string;
  title?: string;
  value?: number;
  tag?: string;
  name?: string;
  available?: boolean;
  hasValue?: boolean;
  [key: string]: any;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  slug: Yup.string().required('Slug is required'),
  level: Yup.string().required('Level is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  reseller_profit: Yup.number()
    .required('Reseller profit is required')
    .min(0, 'Profit must be positive'),
  addons: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      title: Yup.string(),
      value: Yup.number(),
      tag: Yup.string(),
      name: Yup.string(),
      available: Yup.boolean(),
      hasValue: Yup.boolean(),
    }),
  ),
});

const PackageForm: React.FC<CourseFormProps> = ({
  onSubmit,
  formData,
  handleInputChange,
  data,
  submitting,
  actionTitle,
  action,
  iniAddons,
  setIniAddons,
}) => {
  const [addons, setAddons] = useState<AddonType[]>([]);
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>({});
  const [valueStates, setValueStates] = useState<{ [key: string]: boolean }>({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dataAddon = data && data.addons ? data.addons : [];

  const methods = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      yearly_price: 0,
      monthly_price: 0,
      weekly_price: 0,
      title: '',
      slug: '',
      addons: '',
      addon_title: '',
      addon_value: '',
      tag: '',
      description: '',
      level: '',
      action: action,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = methods;

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
            name: item.title,
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
            name: item.title,
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
        name: item.title,
        value: 0,
        available: false,
        hasValue: false,
      }));
    }
  }

  // Initialize addons only once
  useEffect(() => {
    if (!isInitialized) {
      const getAddons = async () => {
        try {
          setAddons(constantAddons);
          let newAddons = processAddons([], constantAddons);

          if (data && data.addons) {
            newAddons = processAddons(data.addons, constantAddons);
          }

          setIniAddons(newAddons);

          // Initialize switch and value states
          const initialSwitchStates: { [key: string]: boolean } = {};
          const initialValueStates: { [key: string]: boolean } = {};

          newAddons.forEach((addon: any) => {
            // Set initial states based on addon data
            initialSwitchStates[addon.id] = addon.available || false;
            initialValueStates[addon.id] = addon.hasValue || false;

            // Set form values for each addon
            setValue(`${addon.id}_addon_title`, addon.title || '');
            setValue(`${addon.id}_addon_value`, addon.value || 0);
            setValue(`${addon.id}_addon_name`, addon.name || '');
            setValue(`${addon.id}_tag`, addon.name || addon.id);
            setValue(`${addon.id}`, addon.available || false);
            setValue(`${addon.id}_hasValue`, addon.hasValue || false);
          });

          setSwitchStates(initialSwitchStates);
          setValueStates(initialValueStates);
        } catch (error) {
          console.error('Error fetching course data:', error);
        }
      };

      getAddons();
      setIsInitialized(true);
    }
  }, [data, isInitialized, setValue, setIniAddons]);

  const handleSwitchChange = useCallback(
    (addon: any) => {
      setSwitchStates((prevStates) => ({
        ...prevStates,
        [addon.id]: addon.available,
      }));

      setIniAddons((prevAddons: any[]) =>
        prevAddons.map((prevAddon) =>
          prevAddon.id === addon.id ? { ...prevAddon, available: addon.available } : prevAddon,
        ),
      );
    },
    [setIniAddons],
  );

  const handleValueAvailable = useCallback(
    (addon: any) => {
      setValueStates((prevStates) => {
        const newState = !prevStates[addon.id];
        return { ...prevStates, [addon.id]: newState };
      });

      setIniAddons((prevAddons: any[]) =>
        prevAddons.map((prevAddon) =>
          prevAddon.id === addon.id
            ? {
                ...prevAddon,
                hasValue: !valueStates[addon.id],
                value: !valueStates[addon.id] ? prevAddon.value : 0,
              }
            : prevAddon,
        ),
      );
    },
    [valueStates, setIniAddons],
  );

  const handleAddonValueChange = useCallback(
    (addon: any) => {
      if (addon.value !== undefined && !valueStates[addon.id]) {
        return;
      }

      setIniAddons((prevAddons: any[]) =>
        prevAddons.map((prevAddon) =>
          prevAddon.id === addon.id ? { ...prevAddon, ...addon } : prevAddon,
        ),
      );
    },
    [valueStates, setIniAddons],
  );

  // Set form values only once when data changes
  useEffect(() => {
    if (data && !isInitialized) {
      (Object.keys(data) as (keyof AddonType)[]).forEach((key) => {
        setValue(key as any, data[key]);
      });
    }
  }, [data, setValue, isInitialized]);

  // Update form values for addons
  useEffect(() => {
    if (!isNull(iniAddons)) {
      setValue('addons', iniAddons);
    }
  }, [iniAddons, setValue]);

  const handleProceedClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalVisible(true);
    }
  };

  return (
    <div className="p-4 m-0 bg-gray-50 dark:bg-gray-900 rounded-b shadow-md">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            onChange={handleInputChange}
            label="Package Title"
            id="title-input"
          />

          <FormInput
            name="slug"
            onChange={handleInputChange}
            label="Package Slug"
            id="slug-input"
          />

          <FormInput
            name="level"
            onChange={handleInputChange}
            label="Package Level"
            id="level-input"
          />

          <FormInput
            name="description"
            onChange={handleInputChange}
            label="Package Short Description"
            id="description-input"
          />

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <FormInput
              name="price"
              type="number"
              onChange={handleInputChange}
              label="Price"
              id="price"
            />

            <FormInput
              name="reseller_profit"
              type="number"
              onChange={handleInputChange}
              label="Reseller Profit %"
              id="reseller_profit"
            />
          </div>

          <div className="flex flex-col space-y-5">
            {addons.map((item, i) => (
              <div
                key={i}
                className="flex flex-wrap md:flex-nowrap justify-between items-center border-b-2 border-gray-200 py-2 space-y-4"
              >
                <div className="flex-shrink-0 w-full md:w-1/5 text-center md:text-left font-bold text-sm">
                  {item.title}
                </div>

                <div className="flex-shrink-0 w-1/2 md:w-1/6 text-center">
                  <ToggleSwitch
                    name={item.id!}
                    label="Available"
                    onChange={(e) => {
                      handleSwitchChange({
                        id: item.id,
                        title: item.title,
                        available: e.target.checked,
                      });
                    }}
                    checked={switchStates[item.id!]}
                  />
                </div>

                <div className="flex-shrink-0 w-1/2 md:w-1/6 text-center">
                  <ToggleSwitch
                    name={`${item.id!}_hasValue`}
                    label="Has Value"
                    onChange={() => {
                      handleValueAvailable({
                        id: item.id,
                        title: item.title,
                      });
                    }}
                    checked={valueStates[item.id!]}
                  />
                </div>

                <div className="flex-grow flex flex-col md:flex-row md:space-x-2 w-full md:w-2/5 space-y-2 md:space-y-0">
                  <FormInput
                    label="long title"
                    className="p-1 text-xs w-full md:w-1/3"
                    name={`${item.id}_addon_title`}
                    type="text"
                    placeholder="Title"
                    onChange={(e) =>
                      handleAddonValueChange({
                        id: item.id,
                        title: e.target.value,
                      })
                    }
                  />
                  <FormInput
                    label="short title"
                    className="p-1 text-xs w-full md:w-1/4"
                    name={`${item.id}_addon_name`}
                    type="text"
                    placeholder="Name"
                    onChange={(e) =>
                      handleAddonValueChange({
                        id: item.id,
                        name: e.target.value,
                      })
                    }
                  />
                  <FormInput
                    label="value"
                    className="p-1 text-xs w-full md:w-1/4"
                    name={`${item.id}_addon_value`}
                    type="number"
                    placeholder="Value"
                    disabled={!valueStates[item.id!]}
                    onChange={(e) =>
                      handleAddonValueChange({
                        id: item.id,
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <CustomButton
            onClick={() => {
              handleProceedClick();
            }}
            submitting={submitting}
            submitted={submitted}
            submittingText="Submitting"
            submittedText="processed"
            buttonText="Proceed"
            iconPosition="after"
            icon={<FaPaperPlane />}
          />

          {isModalVisible && (
            <ConfirmModal
              info="Are you sure you want to place this order?"
              onContinue={() => {
                setModalVisible(false);
                handleSubmit(onSubmit)();
              }}
              onCancel={() => {
                setModalVisible(false);
              }}
              url=""
              headerText="Confirm Order"
            />
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default PackageForm;
