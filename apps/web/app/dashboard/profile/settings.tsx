'use client';
import React, { useState } from 'react';
import { CustomButton } from '@/app/widgets/custom_button';
import { FaPaperPlane } from 'react-icons/fa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInfoForm from '@/dashboard/profile/basic_info_form';
import CustomCard from '@/app/widgets/custom_card';
import * as Yup from 'yup';
import { api_update_user } from '@/app/routes/api_routes';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/app/widgets/confirm';
import { useUserContext } from '@/app/contexts/user_context';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

const validationSchema = Yup.object({
  phone: Yup.string().when('action', {
    is: (action: string) => ['settings'].includes(action),
    then: (schema) => schema.required("Phone number can't be empty"),
  }),
  firstName: Yup.string().when('action', {
    is: (action: string) => ['settings'].includes(action),
    then: (schema) => schema.required('First Name is required'),
  }),
  lastName: Yup.string().when('action', {
    is: (action: string) => ['settings'].includes(action),
    then: (schema) => schema.required('Last Name is required'),
  }),
  dob: Yup.string().when('action', {
    is: (action: string) => ['settings'].includes(action),
    then: (schema) => schema.required('Date of birth is required'),
  }),
  gender: Yup.string().when('action', {
    is: (action: string) => ['settings'].includes(action),
    then: (schema) => schema.required('your gender is required'),
  }),
});

interface ProfileSettingsProps {
  user: UserTypes;
  action: string;
  siteInfo: BrandType;
}

export default function ProfileSettings({ user, action, siteInfo }: ProfileSettingsProps) {
  const { updateEssentialData, essentialData } = useUserContext();
  const { refreshPage } = useDynamicContext();
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const methods = useForm<FormValues | any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      phone: user.phone || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      gender: user.gender || '',
      dob: user.dob || '',
      action: action || '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = methods;

  const onSubmit = async (values: UserTypes) => {
    setSubmitting(true);

    try {
      let url = '';
      let formDataWith: UserTypes = {
        id: user?.id || '',
      };

      switch (action) {
        case 'settings':
          url = await api_update_user({ subBase: siteInfo.slug });
          formDataWith = { ...values, id: user?.id };
          break;

        default:
          break;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify({ ...formDataWith }),
      });

      if (!response.ok) {
        console.error('Network response was not ok');
        return;
      }

      const data = await response.json();

      if (data.success) {
        refreshPage(['users', 'user']);
        updateEssentialData({ user: { ...essentialData.user, ...values } });
        toast.success(data.msg);
        router.refresh();
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalVisible(true);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-5">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-3/4">
            <Tabs className="mt-4" defaultValue="basic-info" orientation="horizontal">
              <TabsList className="grid w-full grid-cols-2 gap-4 items-center border-b border-gray-300 pb-16">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                {/* <TabsTrigger value="security-settings">Security Settings</TabsTrigger> */}
              </TabsList>

              <TabsContent value="basic-info" className="flex flex-col space-y-8">
                <CustomCard title="Basic Data">
                  <BasicInfoForm
                    methods={methods}
                    action={action}
                    formData={user}
                    user={user}
                    setValue={setValue}
                  />
                </CustomCard>
              </TabsContent>
            </Tabs>
          </div>
          <div className="w-full sm:w-1/4">
            <CustomCard title="Action">
              <div className="h-6 w-full">
                <CustomButton
                  onClick={() => {
                    handleProceedClick();
                  }}
                  submitting={submitting}
                  submitted={false}
                  submittingText="Submitting"
                  buttonText="Submit"
                  iconPosition="after"
                  icon={<FaPaperPlane />}
                />
              </div>
            </CustomCard>
          </div>

          {isModalVisible && (
            <ConfirmModal
              // info={
              //   <PinInput
              //     setPin={(pin) => {
              //       console.info(pin);
              //     }}
              //   />
              // }
              info={'Proceed with submission?'}
              onContinue={() => {
                setModalVisible(false);
                handleSubmit(onSubmit)();
              }}
              onCancel={() => {
                setModalVisible(false);
              }}
              url=""
              //headerText="Enter Your 4 digit security pin"
              headerText="Confirm Submission"
            />
          )}
        </div>
      </form>
    </FormProvider>
  );
}
