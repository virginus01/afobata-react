import React, { useState } from 'react';
import { ConfirmModal } from '@/app/widgets/confirm';
import { toast } from 'sonner';
import { modHeaders } from '@/app/helpers/modHeaders';
import { api_create_update_brand } from '@/app/src/constants';
import { checkAddon } from '@/app/helpers/checkAddon';
import { isNull } from '@/app/helpers/isNull';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/contexts/user_context';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

interface BrandTypeSelectionProps {
  title: string;
  subtitle: string;
  profiles: any[];
  selectedProfile: any;
  onSelectProfile: (selectedProfile: any) => void;
  onSubmit: (profileId?: string) => void;
  submitting: boolean;
  submitted: boolean;
  user: UserTypes;
  siteInfo: BrandType;
  upload?: boolean;
}

const BrandTypeSelection: React.FC<BrandTypeSelectionProps> = ({
  title,
  subtitle,
  profiles,
  user,
  selectedProfile,
  onSelectProfile,
  onSubmit,
  siteInfo,
  upload = true,
}) => {
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [profileToSubmit, setProfileToSubmit] = useState<any>(null);
  const { updateEssentialData, essentialData } = useUserContext();
  const { refreshPage } = useDynamicContext();

  const router = useRouter();

  const handleProfileClick = (profile: any) => {
    setProfileToSubmit(profile);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleOnConfirm = async (bussinessTypeId: string) => {
    if (!upload) {
      onSelectProfile(profileToSubmit);
      return;
    }

    if (isNull(user?.brand?.id!)) {
      toast.error('no id found');
      return;
    }

    const canHost = checkAddon({
      data: user?.subscription,
      addon: 'can_monetize',
    }).available;

    const toastId = toast.loading('changing brand type...');

    try {
      let url = await api_create_update_brand({ subBase: siteInfo.slug! });

      let formDataWith: BrandType = {
        id: user?.brand?.id!,
        type: bussinessTypeId,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formDataWith),
      });

      if (!response.ok) {
        console.error('Network response was not ok');
        toast.error('error, try again');
        toast.dismiss(toastId);
        return;
      }

      const res = await response.json();

      if (res.status) {
        refreshPage(['user']);
        updateEssentialData({
          ...essentialData,
          brand: { ...essentialData?.brand, type: bussinessTypeId },
        });
        toast.success('Brand Type Changed');
      } else {
        toast.error(res.msg);
      }

      onSubmit(bussinessTypeId);
    } catch (error) {
      console.error('Error switching brand:', error);
      toast.error('An error occurred while submitting the form');
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <section className="flex flex-col flex-grow items-center justify-center h-screen w-full px-5 sm:px-10 text-center justify-items-center">
      <div className="text-sm font-bold leading-tight tracking-tight text-gray-900 md:text-sm dark:text-white">
        {title}
      </div>
      <div className="pb-20 pt-5">{subtitle}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {profiles &&
          Array.isArray(profiles) &&
          profiles.map((profile) => (
            <div
              key={profile.id}
              className={`${
                selectedProfile?.id === profile.id
                  ? 'border-2 border-green-600 bg-transparent rounded-md text-sm text-gray-600 hover:animate-pulse hover:border-blue-500 hover:border-2 hover:pl-2 transition-all duration-300 ease-in-out cursor-pointer'
                  : 'border border-gray-300 bg-transparent rounded-md text-xs text-gray-600 hover:animate-pulse hover:border-blue-500 hover:border-2 hover:pl-3 transition-all duration-300 ease-in-out cursor-pointer'
              }`}
              onClick={() => handleProfileClick(profile)}
            >
              <div className="flex flex-col text-start justify-items-start justify-start ">
                <p className="font-bold border-b border-gray-200 p-1">{profile.name}</p>
                <p className="p-1 line-clamp-4"> {profile.brandShortDesc}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Confirm Modal */}
      {isModalVisible && (
        <ConfirmModal
          info="Are you sure you want to continue? this will change some of the looks and the features of your platform"
          onContinue={async () => {
            setModalVisible(false);
            await handleOnConfirm(profileToSubmit.id);
          }}
          onCancel={handleCancel}
          url=""
          headerText={`Confirm changing ${user.brand?.name} business type`}
        />
      )}
    </section>
  );
};

export default BrandTypeSelection;
