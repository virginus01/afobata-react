import { UseFormReturn, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useState } from 'react';
import ActionInputField from '@/app/widgets/validations';
import { api_verifications } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';

const TvAndElectric = ({
  wallets,
  setValue,
  methods,
  params,
  auth,
  user,
  siteInfo,
}: {
  wallets?: WalletTypes[];
  setValue: (name: string, value: any) => void;
  methods: UseFormReturn<any>;
  auth: AuthModel;
  siteInfo: BrandType;
  user: UserTypes;
  params: {
    action: string;
    base: string;
    seg1: string;
  };
}) => {
  const [verifying, setVerifying] = useState(false);
  const spId = useWatch({ control: methods.control, name: 'spId' });
  const customerIds = useWatch({ control: methods.control, name: 'customerIds' });

  const handleVerications = async (spId: string, type: string) => {
    try {
      if (!spId) {
        toast.error('please selelect product first');
        return;
      }

      if (!customerIds) {
        toast.error('please enter unique identifier');
        return;
      }

      setVerifying(true);

      const url = await api_verifications({ id: customerIds, spId, type });
      const response = await fetch(url, {
        method: 'GET',
        headers: await modHeaders('get'),
      });
      const res = await response.json();

      if (res.success) {
        setValue('customerName', res.data);
        setValue('customerValidated', true);
        toast.success(res.msg);
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error('error verying customer id');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 h-full w-full">
      <ActionInputField
        setValue={setValue as any}
        verifying={verifying}
        label={`${params.action === 'tv' ? 'IUC Number' : 'Meter Number'}`}
        name="customerIds"
        id="customerIds"
        handleVerifications={(value: string) => handleVerications(spId, params.action)}
        onChange={(e: any) => {
          setValue('customerIds', e.target.value);
        }}
        action={params.action}
        customerName={methods.watch('customerName') ?? ''}
        customerNameValidated={methods.watch('customerValidated') ?? false}
        placeholder={''}
      />
    </div>
  );
};

export default TvAndElectric;
