import BankValidation from '@/app/widgets/bankValidation';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import React, { useState } from 'react';
import { api_add_user_bank_details, api_create_va } from '@/app/routes/api_routes';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import { random_code } from '@/app/helpers/random_code';
import { toast } from 'sonner';
import { modHeaders } from '@/app/helpers/modHeaders';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { clearCache } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { BVNSection } from '@/app/dashboard/profile/kyc/bvn_section';

interface AddAccountProps {
  onAddAccount: (data: any) => void;
  type: 'bank_account' | 'virtual_account';
  user: UserTypes;
  siteInfo: BrandType;
}

const AddAccount: React.FC<AddAccountProps> = ({ onAddAccount, type, user, siteInfo }) => {
  const [accountName, setAccountName] = useState('');
  const [bankData, setBankData] = useState<any | null>(null);
  const [preferredBank, setPreferredBank] = useState('wema-bank');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async (values: any) => {
    if (isNull(user) || isNull(user.id)) {
      toast.error('User not initialized');
      return;
    }

    if (type === 'bank_account' && isNull(bankData)) {
      toast.error("Customer's name needs to be validated");
      return;
    }

    if (type === 'virtual_account' && isNull(bankData?.bvn)) {
      toast.error('BVN needs to be validated');
      return;
    }

    const referenceId = `${siteInfo.slug}-${random_code(10)}`;

    const missing = findMissingFields({
      email: user?.email,
      preferred_bank: preferredBank,
      country: user?.country,
      account_number: bankData?.accountNumber,
      bank_code: bankData?.bankCode,
      referenceId,
      user,
    });

    if (missing) {
      console.error('Missing fields:', missing);
      toast.error('some data missing');
      return;
    }

    setSubmitting(true);

    try {
      let url = '';
      let formDataWith: any = {
        email: user?.email,
        phone: user?.phone,
        preferred_bank: preferredBank,
        country: user?.country,
        account_number: bankData?.accountNumber,
        bvn: bankData?.bvn,
        bank_code: bankData?.bankCode,
        referenceId,
        walletId: user?.wallet?.id,
        user,
        ...bankData,
      };

      switch (type) {
        case 'bank_account':
          url = await api_add_user_bank_details({ subBase: siteInfo.slug });
          break;

        case 'virtual_account':
          url = await api_create_va({ subBase: siteInfo.slug });
          break;

        default:
          toast.error('Invalid action type');
          return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formDataWith),
      });

      if (!response.ok) {
        console.error('unable to add account: ', response.statusText);
        toast.error('unable to add account please contact support');
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Account added successfully');
        clearCache('user');
        router.refresh();
        onAddAccount(data?.data);
        setBankData(null);
      } else {
        toast.error(data.msg || 'Failed to add account');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ accountName });
  };

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="w-full sm:w-3/4">
        <CustomCard title={`Add ${type === 'bank_account' ? 'Bank' : 'Virtual'} Account`}>
          {['virtual_account'].includes(type) && (
            <>
              <BVNSection
                user={user}
                siteInfo={siteInfo}
                setValue={(name, value) => {
                  setBankData({ ...bankData, bvn: value });
                }}
                verificationData={(data) => {
                  setBankData({ ...bankData, ...data });
                }}
              />
              <div className="">
                <SearchableSelect
                  label="Preferred Bank"
                  id="preferredBank"
                  items={[
                    { value: 'wema-bank', label: 'Wema Bank' },
                    { value: 'palmpay', label: 'PalmPay', disabled: true },
                  ]}
                  defaultValues={[preferredBank]}
                  onSelect={(value: any) => setPreferredBank(value)}
                />
              </div>
            </>
          )}

          {['bank_account'].includes(type) && (
            <BankValidation
              user={user}
              siteInfo={siteInfo}
              onSuccess={(data) => {
                setBankData(data);
              }}
            />
          )}
        </CustomCard>
      </div>

      <div className="w-full sm:w-1/4">
        <CustomCard title="Action">
          <form onSubmit={handleSubmit}>
            <CustomButton type="submit" submitting={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </CustomButton>
          </form>
        </CustomCard>
      </div>
    </div>
  );
};

export default AddAccount;
