'use client';
import React, { useCallback, useState } from 'react';
import FormInput from '@/app/widgets/hook_form_input';
import BankValidation from '@/app/widgets/bankValidation';
import { useRouter } from 'next/navigation';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import CustomCard from '@/app/widgets/custom_card';
import { CustomButton } from '@/app/widgets/custom_button';
import { FaPaperPlane } from 'react-icons/fa';
import { FormProvider, useForm } from 'react-hook-form';
import { isNull } from '@/app/helpers/isNull';
import { toast } from 'sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { modHeaders } from '@/app/helpers/modHeaders';
import { api_user_account_verifications } from '@/app/routes/api_routes';
import { clearCache } from '@/app/actions';
import { BVNSection } from '@/dashboard/profile/kyc/bvn_section';

const validationSchema = Yup.object({
  phone: Yup.string().when('tier', {
    is: (tier: number) => [1, 2].includes(tier),
    then: (schema) => schema.required("Phone number can't be empty"),
  }),
  name: Yup.string().when('tier', {
    is: (tier: number) => [1, 2].includes(tier),
    then: (schema) =>
      schema.required('Full Name is required').matches(/^\w+\s+\w+/, 'Enter a valid full name'),
  }),
  bvn: Yup.string().when('verificationDocType', {
    is: 'bvn',
    then: (schema) => schema.required('BVN is required').min(11, 'BVN must be 11 digits'),
    otherwise: (schema) => schema,
  }),
});

export default function KYCForm({
  user,
  siteInfo,
  level,
  auth,
  onComplete,
}: {
  user: UserTypes;
  siteInfo: BrandType;
  level: _Level;
  auth: AuthModel;
  onComplete: (data: any) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [verificationData, setVerificationData] = useState<any>({});
  const router = useRouter();

  const methods = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      phone: user.phone || '',
      name: auth.name ?? '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      gender: user.gender || '',
      dob: user.dob || '',
      email: user.email || '',
      customerName: '',
      bank: user.bankCode || '',
      emailCode: '',
      bankCode: user.bankCode || '',
      nin: '',
      bvn: '',
      accountNumber: user.accountNumber || '',
      verificationDocType: '',
      tier: level.tier ?? 1,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    trigger,
    watch,
  } = methods;

  const docType = watch('verificationDocType');
  const bvn = watch('bvn');

  const onSubmit = useCallback(
    async (data: any) => {
      setSubmitting(true);

      try {
        // Form validation
        if (level.reguirements.includes('id') && !data.verificationDocType) {
          toast.error('Please select an ID type');
          setSubmitting(false);
          return;
        }

        if (data.verificationDocType === 'bvn') {
          if (isNull(verificationData)) {
            toast.error('Please validate your bank account');
            setSubmitting(false);
            return;
          }

          if (isNull(verificationData.bankCode)) {
            toast.error('Bank information not found');
            setSubmitting(false);
            return;
          }

          if (isNull(bvn) && isNull(verificationData.bvn)) {
            toast.error('BVN is required');
            setSubmitting(false);
            return;
          }
        }

        const url = await api_user_account_verifications({
          subBase: siteInfo.slug,
        });

        const formDataWith = {
          auth,
          user,
          data: { ...data, ...getValues(), ...verificationData, bvn: bvn ?? '' },
          tierData: level,
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: await modHeaders('post'),
          body: JSON.stringify({ ...formDataWith }),
        });

        if (!response.ok) {
          console.error('Network response was not ok');
          return;
        }

        const res = await response.json();

        if (res.success) {
          toast.success('KYC information submitted successfully');
          clearCache('user');
          router.refresh();
          setSubmitted(true);
          onComplete(res.data);
        } else {
          toast.error(res.msg);
          setSubmitted(false);
        }

        setSubmitted(true);
      } catch (error) {
        console.error('KYC submission error:', error);
        toast.error('An error occurred. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [level, verificationData, bvn, router, auth, getValues, onComplete, siteInfo.slug, user],
  );

  const handleProceedClick = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit(onSubmit)();
    } else {
      // Get all error messages
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => error?.message || `${field} is invalid`)
        .join(', ');
      toast.error(errorMessages || 'Please fill in all required fields');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-5">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-3/4">
            <CustomCard title="KYC Information">
              <div className="flex flex-col space-y-5">
                <FormInput
                  name="name"
                  label="Your Full Name"
                  type="text"
                  onChange={(e) => setValue('name', e.target.value)}
                />

                <FormInput
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  onChange={(e) => setValue('phone', e.target.value)}
                />

                {level.reguirements.includes('id') && (
                  <>
                    <SearchableSelect
                      className="my-4"
                      name="verificationDocType"
                      label="ID/Document Type"
                      showSearch={false}
                      items={[
                        { value: '', label: 'Select ID Type' },
                        { value: 'bvn', label: 'BVN' },
                      ]}
                      onSelect={(v) => {
                        setValue('verificationDocType', v as string);
                      }}
                      defaultValues={[docType]}
                    />

                    {docType === 'bvn' && (
                      <BVNSection
                        user={user}
                        siteInfo={siteInfo}
                        setValue={setValue}
                        verificationData={setVerificationData}
                      />
                    )}

                    {docType === 'nin' && (
                      <FormInput
                        name="nin"
                        label="Your NIN Number"
                        type="number"
                        onChange={(e) => setValue('nin', e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>
            </CustomCard>
          </div>
          <div className="w-full sm:w-1/4">
            <CustomCard title="Action">
              <div className="space-y-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {level.tier === 1
                    ? 'Basic verification unlocks initial transaction limits.'
                    : 'Advanced verification provides higher transaction limits.'}
                </div>

                <div className="h-8 w-full">
                  <CustomButton
                    onClick={handleProceedClick}
                    submitting={submitting}
                    submitted={submitted}
                    submittingText="Submitting..."
                    buttonText="Submit"
                    iconPosition="after"
                    icon={<FaPaperPlane />}
                    style={1}
                  />
                </div>
              </div>
            </CustomCard>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
