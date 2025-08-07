'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { CustomBadge, CustomButton } from '@/app/widgets/widgets';
import { FaPaperPlane } from 'react-icons/fa6';
import { toast } from 'sonner';
import { api_create_update_brand } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useRouter } from 'next/navigation';
import CustomDrawer from '@/app/src/custom_drawer';
import BrandTypeSelection from '@/app/widgets/brand_switch';
import { ConfirmModal } from '@/app/widgets/confirm';
import CreatorSettings from '@/dashboard/brand/creator_settings';
import DASettings from '@/dashboard/brand/digital_asset_settings';
import StoreSettings from '@/dashboard/brand/store_settings';
import BrandBasicSettings from '@/dashboard/brand/brand_basic_settings';
import UtilitySettings from '@/dashboard/brand/utility_settings';
import BloggerSettings from '@/dashboard/brand/blogging';
import { iniRules, mergeRulesTubor } from '@/dashboard/brand/rules';
import GetNavigation from '@/app/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import IconButton from '@/app/widgets/icon_button';
import BrandSEOSettings from '@/dashboard/brand/seo';
import CustomSettings from '@/dashboard/brand/custom';
import CustomCard from '@/app/widgets/custom_card';
import { Shuffle } from 'lucide-react';
import { Brand } from '@/app/models/Brand';
import { mergeMatchingKeys } from '@/app/helpers/mergeMatchingKeys';
import { useBaseContext } from '@/app/contexts/base_context';
import { useUserContext } from '@/app/contexts/user_context';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { beforeUpdate } from '@/app/helpers/beforeUpdate';

const validationSchema = Yup.object({
  phone: Yup.string().when('action', {
    is: (action: string) => action === 'basic-info',
    then: (schema) => schema.required("Phone number can't be empty"),
  }),
  rules: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required(),
      adjustmentType: Yup.string().required(),
      value: Yup.number().required(),
      direction: Yup.string().required(),
    }),
  ),
});

interface BrandPageIndexProps {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
  iniProfiles: any[];
}

function mergeRules(existingRules: Rule[], newRule: Rule): Rule[] {
  const index = existingRules.findIndex((rule) => rule.name === newRule.name);
  if (index !== -1) {
    // Update the existing rule
    existingRules[index] = { ...existingRules[index], ...newRule };
  } else {
    // Add new rule
    existingRules.push(newRule);
  }
  return [...existingRules];
}

export function BrandPageIndex({ params, user, siteInfo, iniProfiles = [] }: BrandPageIndexProps) {
  const router = useRouter();
  const { removeRouteData } = useBaseContext();
  const { updateEssentialData, essentialData } = useUserContext();
  const { refreshPage } = useDynamicContext();
  // State management
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState(params.action);
  const [profiles, setProfiles] = useState(iniProfiles);
  const [isBrandTypeSelectorOpen, setIsBrandTypeSelectorOpen] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userBrand, setUserBrand] = useState<BrandType>(user?.brand || {});
  const [updatedProfiles, setUpdatedProfiles] = useState<string[]>(user?.brand?.profiles || []);
  const [pages, setPages] = useState<PageModel[]>([]);
  const [storeType, setStoreType] = useState(user?.brand?.type);
  const [rules, setRules] = useState<Rule[]>(mergeRulesTubor(user?.brand?.rules));

  const defaultDataInstance = new Brand();

  useEffect(() => {
    const es = async () => {
      const navigation = await GetNavigation({
        selectedProfile: user?.selectedProfile ?? 'custom',
        user,
        siteInfo,
      });
      setProfiles(navigation?.allNavs);
      setUserBrand(essentialData?.brand ?? user?.brand ?? {});
    };
    es();
  }, [user.selectedProfile, user?.brand, essentialData.user]);

  // Initialize switch states based on profiles
  const [switchStates, setSwitchStates] = useState<SwitchStates>(() => ({
    utility: user?.brand?.profiles?.includes('utility') || false,
    creator: user?.brand?.profiles?.includes('creator') || false,
    store: user?.brand?.profiles?.includes('store') || false,
    digital_asset: user?.brand?.profiles?.includes('digital_asset') || false,
    blog: user?.brand?.profiles?.includes('blog') || false,
    custom: user?.brand?.profiles?.includes('custom') || false,
  }));

  const [serviceSettings, setServiceSettings] = useState<any[]>(user?.brand?.serviceSettings || []);

  const handleServiceSettings = (key: string, name: string, value: any) => {
    setServiceSettings((prev) => {
      const existingIndex = prev.findIndex(
        (item) => Object.keys(item)[0] === key && Object.keys(item[key])[0] === name,
      );

      if (existingIndex >= 0) {
        const newArray = [...prev];
        newArray[existingIndex] = { [key]: { [name]: value } };
        return newArray;
      }

      return [...prev, { [key]: { [name]: value } }];
    });
  };

  // Form setup with persistent default values
  const methods = useForm<BrandType | any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ...beforeUpdate(defaultDataInstance, true),
      ...beforeUpdate(user.brand, true),
      action: action,
      rules,
      ...iniRules(user?.brand?.rules || []),
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
    trigger,
  } = methods;

  const handleRuleUpdate = (updatedRule: Rule) => {
    const updatedRules = mergeRules(rules, updatedRule);
    setRules(updatedRules);
    setValue('rules', updatedRules);
    setSubmitted(false);
  };

  // Handle switch changes with memoization
  const handleSwitchChange = useCallback(
    (name: keyof SwitchStates) => (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const checked = e.target.checked;
        const active = allowedBusinesses();

        if (checked && !active.includes(name)) {
          // toast.error("Not available, try later");
          // return;
        }

        setSwitchStates((prev) => ({ ...prev, [name]: checked }));

        setUpdatedProfiles((prev) => {
          const newProfiles = checked
            ? prev.includes(name)
              ? prev
              : [...prev, name]
            : prev.filter((profile) => profile !== name);
          setValue('profiles', newProfiles);

          return newProfiles;
        });

        setSubmitted(false);
      } catch (error) {
        console.error('Error handling switch change:', error);
        toast.error('Failed to update profile settings');
      }
    },
    [setValue],
  );

  // Form submission
  const onSubmit = async (values: BrandType) => {
    try {
      if (!action) {
        toast.error('No action specified');
        return;
      }

      // Get current form values to ensure we have the latest data

      const currentValues = getValues();

      const uniqueProfiles = [...new Set(updatedProfiles)];

      const numericValues = {
        additional_inhouse_product_price: parseFloat(
          String(currentValues.additional_inhouse_product_price || 0),
        ),
        additional_pack_inclusion: parseFloat(String(currentValues.additional_pack_inclusion || 0)),
        crypto_rate: parseFloat(String(currentValues.crypto_rate || 0)),
        sales_commission: parseFloat(String(currentValues.sales_commission || 0)),
        share_value: parseFloat(String(currentValues.share_value || 0)),
      };

      const finalData = mergeMatchingKeys(defaultDataInstance, currentValues);

      const formDataToSubmit: BrandType = stripRuleFields({
        ...finalData,
        serviceSettings: serviceSettings,
        id: userBrand?.id,
        profiles: uniqueProfiles,
        rules: rules,
        userId: user?.id,
        ...numericValues,
      });

      setSubmitting(true);

      const url = await api_create_update_brand({ subBase: siteInfo.slug! });

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formDataToSubmit),
      });

      if (!response.ok) {
        console.error(response.statusText);
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.success) {
        updateEssentialData({
          brand: { ...userBrand, ...formDataToSubmit },
        });

        setSubmitted(true);

        // Prevent form reset by updating form values
        Object.entries(formDataToSubmit).forEach(([key, value]) => {
          setValue(key as keyof BrandType, value);
        });
        refreshPage(['users', 'user']);
        toast.success('Updated Successfully');
      } else {
        throw new Error(data.msg);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(
        error instanceof Error ? error.message : 'An error occurred while submitting the form',
      );
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalVisible(true);
    } else {
      setSubmitted(false);
      console.error('Validation failed:', errors);
      toast.error('Please fill in all required fields correctly');
    }
  };

  const filteredProfiles = profiles.filter((profile) => profile.availableToBrands === true);

  const sets = [
    <CreatorSettings
      key="creator-settings"
      pages={pages}
      handleServiceSettings={handleServiceSettings}
      data={{ ...getValues() } as any}
      onRuleChange={(e) => handleRuleUpdate(e)}
      siteInfo={siteInfo}
      user={user}
      handleSwitchChange={handleSwitchChange}
      switchStates={switchStates}
      methods={methods}
      rules={rules}
      setValue={setValue}
    />,
    <StoreSettings
      key="store-settings"
      pages={pages}
      handleServiceSettings={handleServiceSettings}
      data={{ ...getValues() } as any}
      onRuleChange={(e) => handleRuleUpdate(e)}
      siteInfo={siteInfo}
      user={user}
      handleSwitchChange={handleSwitchChange}
      switchStates={switchStates}
      methods={methods}
      rules={rules}
    />,
    <DASettings
      key="da-settings"
      pages={pages}
      handleServiceSettings={handleServiceSettings}
      data={{ ...getValues() } as any}
      siteInfo={siteInfo}
      user={user}
      handleSwitchChange={handleSwitchChange}
      switchStates={switchStates}
      methods={methods}
      rules={rules}
    />,
    <UtilitySettings
      key="utility-settings"
      pages={pages}
      handleServiceSettings={handleServiceSettings}
      data={{ ...getValues() } as any}
      siteInfo={siteInfo}
      user={user}
      handleSwitchChange={handleSwitchChange}
      switchStates={switchStates}
      methods={methods}
      rules={rules}
      onRuleChange={(e: any) => handleRuleUpdate(e)}
    />,
    <BloggerSettings
      key="blogger-settings"
      pages={pages}
      handleServiceSettings={handleServiceSettings}
      data={{ ...getValues() } as any}
      siteInfo={siteInfo}
      user={user}
      handleSwitchChange={handleSwitchChange}
      switchStates={switchStates}
      methods={methods}
      rules={rules}
      setValue={setValue}
    />,
    <CustomSettings
      key="custom-settings"
      pages={pages}
      handleServiceSettings={handleServiceSettings}
      data={{ ...getValues() } as any}
      siteInfo={siteInfo}
      user={user}
      handleSwitchChange={handleSwitchChange}
      switchStates={switchStates}
      methods={methods}
      rules={rules}
      setValue={setValue}
    />,
  ];

  return (
    <>
      <div className="flex flex-col flex-grow-0">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-3/4">
                {' '}
                <Tabs className="mt-4" defaultValue="basic-info" orientation="horizontal">
                  <TabsList className="grid w-full grid-cols-3 gap-4 items-center">
                    <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                    <TabsTrigger value="feature-settings">Feature Settings</TabsTrigger>
                    <TabsTrigger value="seo-settings">SEO Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic-info">
                    <BrandBasicSettings
                      siteInfo={siteInfo}
                      user={user!}
                      data={userBrand}
                      methods={methods}
                      setValue={setValue}
                    />
                  </TabsContent>

                  <TabsContent value="seo-settings">
                    <BrandSEOSettings
                      siteInfo={siteInfo}
                      user={user!}
                      data={userBrand}
                      methods={methods}
                    />
                  </TabsContent>

                  <TabsContent value="feature-settings" className="m-1 mt-5">
                    <CustomCard
                      title={
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="mr-2 text-xs">Primary Brand Type:</span>
                            <CustomBadge
                              size="xs"
                              variant="secondary"
                              className="bg-green-600 text-white text-xs"
                              text={user?.brand?.type}
                            />
                          </div>
                        </div>
                      }
                      topRightWidget={
                        <IconButton
                          type="button"
                          variant="outline"
                          onClick={() => setIsBrandTypeSelectorOpen(true)}
                          className="text-xs"
                          icon={<Shuffle size={20} color="currentColor" />}
                        >
                          Change
                        </IconButton>
                      }
                      childrenClass="p-0"
                    >
                      <div className="flex flex-col space-y-0 pb-5">
                        <div className="w-full p-2">
                          Toggle on all the businesses you want to run on{' '}
                          {user?.brand?.name || 'your plateform'}.
                          <span className="font-semibold">
                            {' '}
                            Note: {user?.brand?.type} is the primary business.
                          </span>
                        </div>
                        {sets.map((Component, index) => (
                          <React.Fragment key={index}>{Component}</React.Fragment>
                        ))}
                      </div>
                    </CustomCard>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="w-full sm:w-1/4">
                <CustomCard title="Action">
                  <CustomButton
                    onClick={handleProceedClick}
                    submitting={submitting}
                    submitted={submitted}
                    submittingText="Submitting..."
                    submittedText="Changes Saved"
                    buttonText="Save Changes"
                    iconPosition="after"
                    icon={<FaPaperPlane />}
                  />
                </CustomCard>
              </div>
            </div>

            {isModalVisible && (
              <ConfirmModal
                info="Are you sure you want to save these brand settings? This will update the features and appearance of your brand."
                onContinue={async () => {
                  setModalVisible(false);
                  await handleSubmit(onSubmit)();
                }}
                onCancel={() => setModalVisible(false)}
                url=""
                headerText="Confirm Changes"
              />
            )}
          </form>
        </FormProvider>
      </div>

      <CustomDrawer
        direction="right"
        isWidthFull={true}
        isHeightFull={true}
        showHeader={true}
        isOpen={isBrandTypeSelectorOpen}
        onClose={() => setIsBrandTypeSelectorOpen(false)}
        header="Switch Business Type"
      >
        <BrandTypeSelection
          siteInfo={siteInfo}
          user={user}
          title="What type of business do you want to set up?"
          subtitle="Select the type of business you want to run. The platform features will be tailored to your selection. Below are the business types most people successfully profit from"
          profiles={filteredProfiles}
          selectedProfile={storeType || ''}
          onSelectProfile={(newType) => {}}
          onSubmit={() => {
            setIsBrandTypeSelectorOpen(false);
          }}
          submitting={submitting}
          submitted={submitted}
        />
      </CustomDrawer>
    </>
  );
}

export const allowedBusinesses = () => {
  const businesses = ['blog'];
  return businesses;
};

function stripRuleFields(obj: any) {
  const strippedObj = { ...obj };

  // Remove rule object
  if (strippedObj.rule) {
    delete strippedObj.rule;
  }

  // Remove rule-specific flat fields
  Object.keys(strippedObj).forEach((key) => {
    if (key.startsWith('rule.')) {
      delete strippedObj[key];
    }
  });

  return strippedObj;
}
3;
