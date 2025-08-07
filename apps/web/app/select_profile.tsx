'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useUserContext } from '@/app/contexts/user_context';
import { api_crud } from '@/app/routes/api_routes';
import { useRouter } from 'next/navigation';
import { useBaseContext } from '@/app/contexts/base_context';
import ProfileSelection from '@/app/widgets/profile_switch_form';
import { isNull } from '@/app/helpers/isNull';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

interface PlanUseProps {
  profiles: any[]; // Adjust the type as necessary
  page?: string;
  user?: UserTypes;
  siteInfo: BrandType;
}

export const PlanUse: React.FC<PlanUseProps> = ({ profiles, page = 'welcome', user, siteInfo }) => {
  const {
    setIsSwitchProfileOpen,
    setSelectedProfile,
    selectedProfile,
    updateEssentialData,
    essentialData,
  } = useUserContext();

  const { refreshPage } = useDynamicContext();
  const [submitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { removeRouteData } = useBaseContext();

  const onSubmit = async (selectedProfileData?: any) => {
    const toastId = toast.loading('changing profile please wait');
    if (isNull(user)) {
      toast.warning('Page loading... try again');
      return;
    }

    const profileId = selectedProfileData?.id;

    if (!profileId) {
      toast.error('Please select a profile');
      return;
    }

    setSubmitting(true);

    const userData: any = {
      id: user?.id,
      table: 'users',
      data: { id: user?.id, selectedProfile: profileId },
    };

    try {
      const url = await api_crud({
        subBase: siteInfo.slug,
        method: 'patch',
        id: user?.id!,
        action: 'crud_patch',
        table: 'users',
      });
      const response = await fetch(url, {
        method: 'PATCH',
        headers: await modHeaders('patch'),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        toast.error('network error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        refreshPage(['user']);
        setSelectedProfile(selectedProfileData.id);
        removeRouteData();
        updateEssentialData({
          ...essentialData,
          user: { ...essentialData.user, selectedProfile: profileId },
        } as any);
        setIsSwitchProfileOpen(false);
        toast.success(`Profile switched to ${selectedProfileData.name}`.toLowerCase());
      } else {
        toast.error('Unknown error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Try again');
    } finally {
      setSubmitting(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <ProfileSelection
      title={`How do you plan to use ${siteInfo.name} today?`}
      subtitle="Don't worry okay, you can still switch profiles anytime so choose any one"
      profiles={profiles}
      selectedProfile={selectedProfile}
      onSelectProfile={setSelectedProfile}
      onSubmit={onSubmit}
      submitting={submitting}
      submitted={submitted}
    />
  );
};
