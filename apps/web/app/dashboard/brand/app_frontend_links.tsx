'use client';

import { Brand } from '@/app/models/Brand';
import FormInput from '@/app/widgets/hook_form_input';
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CustomButton } from '@/app/widgets/custom_button';
import { api_create_update_brand } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';
import { toast } from 'sonner';
import { useUserContext } from '@/app/contexts/user_context';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

export default function AppFrontendLinks({
  siteInfo,
  iosAppLink,
  apkAppLink,
}: {
  siteInfo: Brand;
  brand: Brand;
  iosAppLink: string;
  apkAppLink: string;
}) {
  const { updateEssentialData, essentialData } = useUserContext();

  const { brand } = essentialData;

  const methods = useForm({
    defaultValues: {
      iosLink: (brand?.mobileAppsData as any)?.iosDownloadUrl ?? '',
      androidLink: (brand?.mobileAppsData as any)?.androidDownloadUrl ?? '',
    },
  });

  const { setValue, handleSubmit } = methods;

  const { refreshPage } = useDynamicContext();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async (value: any) => {
    try {
      const formDataToSubmit = {
        ...brand,
        mobileAppsData: {
          ...brand.mobileAppsData,
          iosDownloadUrl: value.iosLink,
          androidDownloadUrl: value.androidLink,
        },
      };

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
          brand: { ...brand, ...formDataToSubmit } as any,
        });

        setSubmitted(true);
        refreshPage(['users', 'user']);
        toast.success('Updated Successfully');
      } else {
        throw new Error(data.msg);
      }
    } catch (error: any) {
      console.error('Error updating download links:', error?.message || error);
      toast.error('Failed to update links');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods} key={siteInfo.slug}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-4 max-w-xl">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Download link for iOS</label>
            {iosAppLink && (
              <div className="h-6">
                <CustomButton onClick={() => setValue('iosLink', iosAppLink)}>
                  Use direct link
                </CustomButton>
              </div>
            )}
          </div>
          <FormInput name="iosLink" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Download link for Android</label>
            {apkAppLink && (
              <div className="h-6">
                <CustomButton onClick={() => setValue('androidLink', apkAppLink)}>
                  Use direct link
                </CustomButton>
              </div>
            )}
          </div>
          <FormInput name="androidLink" />
        </div>

        <CustomButton submitting={submitting} type="submit">
          Update Download Links
        </CustomButton>
      </form>
    </FormProvider>
  );
}
