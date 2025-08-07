import React, { useEffect, useState } from 'react';
import CustomCard from '@/app/widgets/custom_card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomButton } from '@/app/widgets/custom_button';
import { Copy, Plus, Trash } from 'lucide-react';
import CustomDrawer from '@/app/src/custom_drawer';
import { isNull } from '@/app/helpers/isNull';
import AddAccount from '@/dashboard/wallet/actions/add_account';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { modHeaders } from '@/app/helpers/modHeaders';
import { toast } from 'sonner';
import { api_add_user_bank_details } from '@/app/routes/api_routes';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

export default function BankDetails({
  user,
  siteInfo,
  banks,
}: {
  user: UserTypes;
  siteInfo: BrandType;
  banks: any[];
}) {
  const { refreshPage } = useDynamicContext();
  const [addType, setAddType] = useState<string>('');
  const [defaultAcc, setDefaultAcc] = useState(user.accountNumber);
  const [depositAccounts, setDepositAccounts] = useState<_FundSouces[]>([]);
  const [withdrawalAccounts, setWithdrawalAccounts] = useState<_FundSouces[]>([]);

  useEffect(() => {
    const fundSources: _FundSouces[] = user?.fundSources || [];

    const depositMap = new Map<string, _FundSouces>();
    const withdrawalMap = new Map<string, _FundSouces>();

    fundSources.forEach((item) => {
      if (item.type === 'bank_account') {
        withdrawalMap.set(item.id, item);
      } else if (item.type === 'virtual') {
        depositMap.set(item.id, item);
      }
    });

    setDepositAccounts(Array.from(depositMap.values()));
    setWithdrawalAccounts(Array.from(withdrawalMap.values()));
  }, [user]);

  const onSubmit = async (values: any, action: string) => {
    let toastId = null;
    if (action === 'delete') {
      toastId = toast.loading('deleting account');
    }

    if (action === 'default_account') {
      toastId = toast.loading('saving default account');
    }
    try {
      let url = await api_add_user_bank_details({ subBase: siteInfo.slug });

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify({ action, ...values }),
      });

      if (!response.ok) {
        toast.error('Failed to submit data');
        return;
      }

      const data = await response.json();

      if (data.success) {
        if (action === 'delete') {
          setWithdrawalAccounts((prev) => prev.filter((acc) => acc.id !== values.id));
          setDepositAccounts((prev) => prev.filter((acc) => acc.id !== values.id));
          toast.success('Account deleted successfully');
        }

        if (action === 'default_account') {
          setDefaultAcc(values.accountNumber);
          toast.success('Account updated successfully');
        }

        refreshPage(['users', 'user']);
      } else {
        toast.error(data.msg || 'Failed to process request');
      }
    } catch (error) {
      toast.error('An error occurred while submitting the form');
    } finally {
      toast.dismiss(toastId ?? '');
    }
  };

  const handleAddAccount = (data: _FundSouces) => {
    if (data.type === 'bank_account') {
      setWithdrawalAccounts((prev) => [...prev, data]);
    } else if (data.type === 'virtual') {
      setDepositAccounts((prev) => [...prev, data]);
    }

    setAddType('');
  };

  return (
    <>
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <CustomCard
            title="Deposit Virtual Account"
            topRightWidget={
              <div className="w-full flex justify-end text-xs h-6">
                <CustomButton
                  icon={<Plus className="w-3 h-3" />}
                  onClick={() => setAddType('virtual_account')}
                >
                  Virtual Account
                </CustomButton>
              </div>
            }
          >
            {depositAccounts.length > 0 ? (
              <ul className="flex flex-col space-y-4">
                {depositAccounts.map((account, index) => (
                  <li key={account.id}>
                    <CustomCard
                      title={`${account?.accountNumber ?? 'Account Number'}`}
                      topRightWidget={
                        <Copy
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(String(account?.accountNumber ?? ''));
                            toast.success('Account number copied to clipboard!');
                          }}
                        />
                      }
                      bottomWidget={<></>}
                    >
                      <p>Bank: {account.bankName ?? account.bankInfo?.name}</p>
                      <p className="pt-5">Account Name: {account.accountName}</p>
                    </CustomCard>
                  </li>
                ))}
              </ul>
            ) : (
              'No deposit accounts yet'
            )}
          </CustomCard>
        </TabsContent>

        <TabsContent value="withdrawal">
          <CustomCard
            title="Withdrawal Bank Accounts"
            topRightWidget={
              <div className="w-full flex justify-end text-xs h-6">
                <CustomButton
                  icon={<Plus className="w-3 h-3" />}
                  onClick={() => setAddType('bank_account')}
                >
                  Bank Account
                </CustomButton>
              </div>
            }
          >
            {withdrawalAccounts.length > 0 ? (
              <ul className="flex flex-col space-y-4">
                {withdrawalAccounts.map((account) => (
                  <li key={account.id} className="text-xs">
                    <CustomCard
                      title={`Account Number: ${account?.accountNumber ?? ''}`}
                      topRightWidget={
                        <div className="flex flex-row space-x-4">
                          <Copy
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(String(account?.accountNumber ?? ''));
                              toast.success('Account number copied to clipboard!');
                            }}
                          />
                          <Trash
                            className="h-3 w-3 text-red-500 cursor-pointer"
                            onClick={() => onSubmit(account, 'delete')}
                          />
                        </div>
                      }
                      bottomWidget={
                        <div className="flex flex-row justify-between">
                          <div>Make this default withdrawal account?</div>
                          <ToggleSwitch
                            className="text-xs flex flex-row justify-between"
                            name="defaultAcc"
                            label=""
                            onChange={() => onSubmit(account, 'default_account')}
                            checked={defaultAcc === account.accountNumber}
                          />
                        </div>
                      }
                    >
                      <p>Bank: {account.bankName ?? account.bankInfo?.name}</p>
                      <p className="pt-5">Account Name: {account.accountName}</p>
                    </CustomCard>
                  </li>
                ))}
              </ul>
            ) : (
              'No withdrawal accounts yet'
            )}
          </CustomCard>
        </TabsContent>
      </Tabs>

      <CustomDrawer
        direction="right"
        isWidthFull={false}
        isHeightFull={true}
        showHeader={true}
        isOpen={!isNull(addType)}
        onClose={() => setAddType('')}
        header="Add Account"
      >
        <AddAccount
          type={addType as any}
          siteInfo={siteInfo}
          user={user}
          onAddAccount={handleAddAccount}
        />
      </CustomDrawer>
    </>
  );
}
