import { CustomBadge, SearchableSelect } from '@/app/widgets/widgets';
import React, { useState } from 'react';
import { useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, Minus, Mail, Building2, Phone, MessageSquare, MapPin, Globe2 } from 'lucide-react';
import FormInput from '@/app/widgets/hook_form_input';
import CustomCard from '@/app/widgets/custom_card';
import ImageUploadGallary from '@/app/media/editor_image_gallary';
import CustomColorPicker from '@/app/src/CustomColorPicker';

interface CreatorSettingsProps {
  methods: UseFormReturn<any>;
  user: UserTypes;
  siteInfo: BrandType;
  data: BrandType;
  setValue: (name: string, value: any) => void;
}

const BrandBasicSettings: React.FC<CreatorSettingsProps> = ({
  methods,
  user,
  siteInfo,
  data,
  setValue,
}) => {
  const [coverageCountries, setCoverageCountries] = useState(
    data.coverageCountries || user.country,
  );
  const [coverageStates, setCoverageStates] = useState(data.coverageStates || 'all');
  const [coverageCities, setCoverageCities] = useState([data.coverageCities || 'all']);
  const [businessCountry, setBusinessCountry] = useState(data.businessCountry || user.country);
  const [businessState, setBusinessState] = useState(data.businessState || user.state);
  const [businessCity, setBusinessCity] = useState(data.businessCity || user.city);

  const handleColorChange = ({ key, value }: { key: string; value: string }) => {
    const updatedColors = {
      ...methods.getValues('colors'),
      [key]: value,
    };
    setValue('colors', updatedColors);
  };

  const countries = [
    {
      label: 'Nigeria',
      value: 'ng',
      disabled: false,
    },
    {
      label: 'Ghana',
      value: 'gh',
      disabled: false,
    },
    {
      label: 'America',
      value: 'us',
      disabled: false,
    },
  ];

  const states = [
    {
      label: 'Anambra',
      value: 'anam',
      disabled: false,
    },
    {
      label: 'Lagos',
      value: 'lag',
      disabled: false,
    },
    {
      label: 'Imo',
      value: 'im',
      disabled: false,
    },
  ];

  const cities = [
    {
      label: 'Lekki',
      value: 'lek',
      disabled: false,
    },
    {
      label: 'Iyana Ipaja',
      value: 'iya',
      disabled: false,
    },
    {
      label: 'Ikeja',
      value: 'ike',
      disabled: false,
    },
  ];

  return (
    <div className="space-y-4 p-1">
      <CustomCard title="Business Details" className="">
        <div className="flex flex-col space-y-5">
          <div className="relative">
            <FormInput
              methods={methods}
              icon={<Building2 className="h-3 w-3 text-gray-400" />}
              id="name"
              name="name"
              label="Business Name"
              placeholder="business name"
              className="w-full"
            />
          </div>
          {/* Coverage Selection */}
          <div className="space-y-4">
            <div className="relative items-center">
              <SearchableSelect
                icon={<Globe2 className="h-3 w-3 text-gray-400" />}
                className="pl-8"
                label=" Business Coverage Countries"
                items={[
                  {
                    label: 'Select Option',
                    value: '',
                    disabled: false,
                  },
                  {
                    label: 'WorldWide',
                    value: 'all',
                    disabled: false,
                  },
                  ...countries,
                ]}
                onSelect={(v: any) => {
                  setCoverageCountries(v);
                  setValue('coverageCountries', v);
                }}
                allowMultiSelect={false}
                selectPlaceholder="Select coverage area"
                defaultValues={[coverageCountries || 'all']}
              />
            </div>
          </div>
          {coverageCountries !== 'all' && (
            <div className="space-y-4">
              <div className="relative">
                <SearchableSelect
                  icon={<Globe2 className="h-3 w-3 text-gray-400" />}
                  className="pl-8"
                  label="Bussiness Coverage States"
                  items={[
                    {
                      label: 'Select Option',
                      value: '',
                      disabled: false,
                    },
                    {
                      label: 'Nationwide',
                      value: 'all',
                      disabled: false,
                    },
                    ...states,
                  ]}
                  onSelect={(v: any) => {
                    setCoverageStates(v);
                    setValue('coverageStates', v);
                  }}
                  allowMultiSelect={false}
                  selectPlaceholder="Select States"
                  defaultValues={[coverageStates || 'all']}
                />
              </div>
            </div>
          )}
          {coverageStates !== 'all' && coverageCountries !== 'all' && (
            <div className="space-y-4">
              <div className="relative">
                <SearchableSelect
                  icon={<Globe2 className="h-3 w-3 text-gray-400" />}
                  label="Bussiness Coverage Cites"
                  items={[
                    {
                      label: 'Select Options',
                      value: '',
                      disabled: false,
                    },
                    {
                      label: 'All Cities',
                      value: 'all',
                      disabled: false,
                    },
                    ...cities,
                  ]}
                  onSelect={(v: any) => {
                    if ((v as any[]).includes('all')) {
                      setCoverageCities(['all']);
                      setValue('coverageCities', 'all');
                    } else {
                      setCoverageCities(v);
                      setValue('coverageCities', v);
                    }
                  }}
                  allowMultiSelect={true}
                  selectPlaceholder="Select Cities"
                  defaultValues={coverageCities}
                />
              </div>
            </div>
          )}
          {/* Rest of the form fields */}
          <div className="relative">
            <FormInput
              icon={<Mail className="h-3 w-3 text-gray-400" />}
              id="email"
              name="email"
              type="email"
              placeholder="business email"
              className="w-full"
              label=" Business Email Contact"
            />
          </div>
          <div className="relative">
            <FormInput
              icon={<Phone className="h-3 w-3 text-gray-400" />}
              id="businessPhone"
              name="businessPhone"
              type="number"
              placeholder="business phone"
              className="w-full"
              label=" Business Call Line"
            />
          </div>
          <div className="relative ">
            <FormInput
              icon={<MessageSquare className="h-3 w-3 text-gray-400" />}
              id="whatsapp"
              name="whatsappPhone"
              type="number"
              placeholder="WhatsApp number"
              className="w-full"
              label=" Business WhatsApp Contact"
            />
          </div>
          <div className="space-y-4">
            <div className="relative">
              <SearchableSelect
                icon={<Globe2 className="h-3 w-3 text-gray-400" />}
                label="Business HQ Country"
                items={[
                  {
                    label: 'Select Option',
                    value: '',
                    disabled: false,
                  },
                  ...countries,
                ]}
                onSelect={(v: any) => {
                  setValue('businessCountry', v);
                }}
                allowMultiSelect={false}
                selectPlaceholder="Select Business Country"
                defaultValues={[businessCountry || 'all']}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <SearchableSelect
                icon={<Globe2 className="h-3 w-3 text-gray-400" />}
                label="Bussiness HQ State"
                items={[
                  {
                    label: 'Select Option',
                    value: '',
                    disabled: false,
                  },

                  ...states,
                ]}
                onSelect={(v: any) => {
                  setValue('businessState', v);
                }}
                allowMultiSelect={false}
                selectPlaceholder="Select Business State"
                defaultValues={[businessState || 'all']}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <SearchableSelect
                icon={<Globe2 className="h-3 w-3 text-gray-400" />}
                label="Bussiness HQ City"
                items={[
                  {
                    label: 'Select Option',
                    value: '',
                    disabled: false,
                  },

                  ...cities,
                ]}
                onSelect={(v: any) => {
                  setValue('businessCity', v);
                }}
                allowMultiSelect={false}
                selectPlaceholder="Select Business City"
                defaultValues={[businessCity || '']}
              />
            </div>
          </div>

          <div className="relative">
            <FormInput
              icon={<MapPin className="top-3 h-3 w-3 text-gray-400" />}
              id="businessAddress"
              type="textarea"
              rows={1}
              name="businessAddress"
              placeholder="Business Address"
              className="w-full"
              label="Business Address"
            />
          </div>
        </div>
      </CustomCard>

      <CustomCard title="Brand Color Designs">
        <div className="flex flex-col space-y-6">
          {['Light', 'Dark'].map((mode) => {
            const modeKey = mode.toLowerCase(); // 'light' | 'dark'

            const colorFields = [
              { label: 'Primary Foreground', key: `primaryForeground${mode}` },
              { label: 'Secondary Foreground', key: `secondaryForeground${mode}` },
              { label: 'Primary Background', key: `primaryBackground${mode}` },
              { label: 'Secondary Background', key: `secondaryBackground${mode}` },
              { label: 'General Foreground', key: `foreground${mode}` },
              { label: 'General Background', key: `background${mode}` },
              { label: 'Card Foreground', key: `cardForeground${mode}` },
              { label: 'Card Background', key: `cardBackground${mode}` },
            ];

            return (
              <div key={mode} className="space-y-4">
                <h3 className="text-sm font-semibold">{mode} Mode</h3>

                {colorFields.map(({ label, key }) => (
                  <CustomColorPicker
                    key={key}
                    label={label}
                    name={key}
                    id={key}
                    className="h-10 w-full"
                    showPrefix={false}
                    value={(data?.colors as any)?.[key] ?? ''}
                    onChange={(e) => handleColorChange({ key, value: e.target.value })}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </CustomCard>

      <CustomCard
        title="Brand Images"
        className=""
        childrenClass="p-0"
        topRightWidget={<div></div>}
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Logo', field: 'logo', file: data.logo },
            { label: 'Icon', field: 'icon', file: data.icon },
          ].map(({ label, field, file }, index, array) => (
            <div
              key={field}
              className={`flex flex-col w-full ${
                index < array.length - 1 ? 'border-r pr-4' : 'pl-4'
              }`}
            >
              <span className="text-xs font-medium m-2 text-left w-full h-6">
                <CustomBadge size="sm" text={label} />
              </span>
              <div className="p-2">
                <ImageUploadGallary
                  maxImages={1}
                  onImagesSelected={(e: any) => {
                    setValue(field, e[0]);
                  }}
                  user={user}
                  siteInfo={siteInfo}
                  initialImages={[(file ?? '') as any] as any}
                />
              </div>
            </div>
          ))}
        </div>
      </CustomCard>
    </div>
  );
};

export default BrandBasicSettings;
