'use client';
import { useState } from 'react';
import { useUserContext } from '@/app/contexts/user_context';
import CustomModal from '@/app/widgets/custom_modal';
import PinVerification from '@/app/widgets/pin_verification';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { randomNumber } from '@/helpers/randomNumber';
import { api_update_auth } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';
import { toast } from 'sonner';

const EmailVerification: React.FC<any> = () => {
  const { essentialData, updateEssentialData } = useUserContext();
  const { refreshPage } = useDynamicContext();
  const [pinOpen, setPinOpen] = useState(!essentialData?.user?.auth?.emailVerified);
  const user = essentialData.user;
  const siteInfo = essentialData.siteInfo;

  const handleRequest = async (code: string) => {
    const body = {
      emailVerified: true,
      id: essentialData?.auth?.id,
    };

    const url = await api_update_auth({
      subBase: siteInfo.slug ?? '',
    });

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: await modHeaders('post'),
    });

    if (!response.ok) {
      toast.error('error occured. try again');
      setPinOpen(true);
      return;
    }
    const res = await response.json();
    if (res?.status || res.code === 'exists') {
      toast.success('successful');
      refreshPage(['user', 'users']);
      updateEssentialData({
        ...essentialData,
        auth: { ...essentialData.auth, emailVerified: true },
      });
    } else {
      toast.error('error occured. try again');
      setPinOpen(true);
      return;
    }
  };

  return (
    <CustomModal isOpen={pinOpen} onClose={() => {}} title="">
      <PinVerification
        user={user}
        siteInfo={siteInfo as any}
        mode="email"
        code={process.env.NODE_ENV === 'development' ? '0000' : randomNumber(4)}
        switchable={false}
        onVerified={(code) => {
          setPinOpen(false);
          handleRequest(code);
        }}
      />
    </CustomModal>
  );
};
export default EmailVerification;
