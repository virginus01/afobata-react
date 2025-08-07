import React, { useEffect, useLayoutEffect, useState } from 'react';
import ActionInputField from '@/app/widgets/validations';
import { api_get_banks, api_verifications } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';
import { isNull } from '@/app/helpers/isNull';
import { toast } from 'sonner';
import { emptySelect } from '@/app/src/constants';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import indexedDB from '@/app/utils/indexdb';

interface BankValidationProps {
  onSuccess: (data: any) => void;
  user: UserTypes;
  siteInfo: BrandType;
}

const BankValidation: React.FC<BankValidationProps> = ({ onSuccess, user }) => {
  const [submitted, setSubmitted] = useState(false);
  const [banks, setBanks] = useState<any[] | null>(null);
  const [customerNameValidated, setCustomerNameValidated] = useState(false);
  const [accountName, setAccountName] = useState(user.accountName);
  const [accountNumber, setAccountNumber] = useState(user.accountNumber);
  const [bankCode, setBankCode] = useState(user.bankCode);
  const [onValidated, setOnValidated] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const bankOptions =
    banks?.map((bank) => ({
      value: bank.code,
      label: bank.name,
      disabled: false,
    })) || [];

  // Fetch available banks on component mount
  useLayoutEffect(() => {
    const getBanks = async () => {
      try {
        const result = await indexedDB.queryData({ table: 'banks', conditions: {} });

        if (!isNull(result)) {
          setBanks(result);
        } else {
          toast.error('Failed to fetch banks');
        }
      } catch (error) {
        console.error('Error fetching cached banks:', error);
        toast.error('An error occurred while fetching cached banks');
      }
    };

    getBanks();
  }, []);

  useEffect(() => {
    const getBanks = async () => {
      try {
        const url = await api_get_banks({});
        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
          credentials: 'include',
          next: { revalidate: 10000, tags: ['banks'] },
        });

        const res = await response.json();

        if (res.success && !isNull(res.data)) {
          setBanks(res.data);
          indexedDB.saveOrUpdateData({ table: 'banks', data: res.data });
        } else {
          toast.error('Failed to fetch banks');
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
        toast.error('An error occurred while fetching banks');
      }
    };

    getBanks();
  }, []);

  const handleVerifications = async (id: string, spId: string) => {
    if (isNull(spId)) {
      toast.error('Please select a bank first');
      return;
    }

    if (isNull(id)) {
      toast.error('Please enter account number');
      return;
    }

    setIsVerifying(true);

    try {
      const url = await api_verifications({ id, spId, type: 'acc_num' });
      const response = await fetch(url, {
        method: 'GET',
        headers: await modHeaders('get'),
        credentials: 'include',
      });

      const res = await response.json();

      if (res.success) {
        setCustomerNameValidated(true);
        setOnValidated(true);
        setAccountName(res.data);

        const bank = banks?.find((bank) => bank.id === spId || bank.code === spId) ?? {};

        if (bank.active) {
          onSuccess({
            status: bank.active,
            accountName: res.data,
            bankCode: bankCode || user.bankCode,
            bankName: bank.name,
            accountNumber: accountNumber || user.accountNumber,
            bankCodeSp: 'paystack',
            customerName: res.data,
            bankInfo: bank,
          });
        } else {
          toast.error("Bank can't be used here");
        }
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error('Error verifying customer ID:', error);
      toast.error('An error occurred while verifying customer ID');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5 h-full w-full">
      <SearchableSelect
        controlled={false}
        onSelect={(v) => {
          setBankCode(v as any);
          setCustomerNameValidated(false);
        }}
        name="bankCode"
        label="Your Bank Name"
        allowMultiSelect={false}
        items={emptySelect.concat(bankOptions || []) || []}
        defaultValues={[bankCode ?? '']}
      />

      <div>
        <ActionInputField
          verifying={isVerifying}
          label="Your Account Number"
          placeholder="Enter account number"
          name="accountNumber"
          id="account_number"
          handleVerifications={async (value: string) => {
            await handleVerifications(accountNumber, bankCode ?? '');
          }}
          onChange={(e) => {
            setAccountNumber(e.target.value);
            if ((e.target.value ?? 'none').length === 10) {
              setCustomerNameValidated(false);
            }
          }}
          action="add"
          accountNumber={accountNumber}
          customerName={accountName}
          customerNameValidated={customerNameValidated}
        />
      </div>
    </div>
  );
};

export default BankValidation;
