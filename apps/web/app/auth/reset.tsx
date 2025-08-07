'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api_generate_user_token, api_get_user, api_update_user } from '@/app/routes/api_routes';
import { baseUrl } from '@/app/helpers/baseUrl';
import { modHeaders } from '@/app/helpers/modHeaders';
import { isDateExpired } from '@/app/helpers/isDateExpired';
import { toast } from 'sonner';
import { FormProvider, useForm } from 'react-hook-form';
import FormInput from '@/app/widgets/hook_form_input';
import { RaisedButton } from '@/app/widgets/widgets';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import PasswordInput from '@/app/widgets/password_update';
import { login_page } from '@/app/routes/page_routes';

interface FormValues {
  email: string;
  password: string;
  password_confirm: string;
  action: string;
}

const validationSchema = Yup.object({
  email: Yup.string().when('action', {
    is: (action: string) => action === 'check_email',
    then: (schema) => schema.required('Invalid email address').email('Invalid email format'),
  }),
  password: Yup.string().when('action', {
    is: (action: string) => action === 'change_password',
    then: (schema) =>
      schema
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
        .matches(/\d/, 'Password must contain at least one number'),
  }),
  password_confirm: Yup.string().when('action', {
    is: (action: string) => action === 'change_password',
    then: (schema) =>
      schema
        .oneOf([Yup.ref('password'), ''], 'Passwords must match')
        .required('Confirm password is required'),
  }),
});

export function Reset({ siteInfo }: { siteInfo: BrandType }) {
  const searchParams = useSearchParams();
  const id = searchParams.get('user') || '';
  const token = searchParams.get('token') || '';
  const [isVerified, setIsVerified] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<UserTypes | null>(null);
  const router = useRouter();

  const methods = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirm: '',
      action: 'check_email',
    },
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  useEffect(() => {
    const updateUser = async () => {
      try {
        const url = await api_get_user({
          subBase: siteInfo.slug,
          id: id,
          remark: 'reset',
        });
        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders(),
          next: {
            revalidate: 60,
            tags: ['user'],
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const res = await response.json();

        if (res.status && res.data && res.data.token && res.data.token.value === token) {
          const checkExpire = isDateExpired(res.data.token.expireDate);

          if (!checkExpire) {
            toast.success('Authentication successful');
            setIsVerified(true);
            setUserId(res.data.id);
            setUser(res.data);
            setValue('action', 'change_password');
          } else {
            setIsExpired(true);
          }
        } else {
          console.error(res.msg);
          toast.error('User not found');
        }
      } catch (error) {
        toast.error((error as Error).message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) {
      updateUser();
    } else {
      setIsLoading(false);
    }
  }, [id, token, siteInfo.slug, setValue]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);

    try {
      if (values.action === 'change_password') {
        if (!userId) {
          toast.error('No user found');
          return;
        }
        const url = await api_update_user({
          subBase: siteInfo.slug,
        });
        const formData = {
          id: userId,
          password: values.password,
          password_confirm: values.password_confirm,
        };
        const updateResponse = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('post'),
          body: JSON.stringify(formData),
        });

        const updateRes = await updateResponse.json();

        if (updateRes.status) {
          toast.success('Password changed');
          const loginPage = login_page({ subBase: siteInfo.slug! });
          router.push(loginPage);
        } else {
          toast.error(updateRes.msg);
        }
      } else {
        const url = await api_get_user({
          subBase: siteInfo.slug,
          id: values.email,
          remark: 'reset 2',
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders(),
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const user = await response.json();

        if (user.success) {
          const toastId = toast.loading('Sending verification email...');

          try {
            const tokenUrl = await api_generate_user_token({
              subBase: siteInfo.slug,
            });
            const formData = { id: user.data?.id };
            const tokenResponse = await fetch(tokenUrl, {
              method: 'POST',
              headers: await modHeaders(),
              body: JSON.stringify(formData),
            });

            const tokenRes = await tokenResponse.json();

            if (tokenRes.status) {
              const link = await baseUrl(
                `${siteInfo.slug}/auth/reset?token=${tokenRes.data.token.value}&user=${user.data?.id}`,
              );
              // await sendMail({
              //   siteInfo: siteInfo,
              //   user: user.data,
              //   emails: user.data.email,
              //   subject: "Password Reset",
              //   body: <PasswordResetEmail link={link} siteInfo={siteInfo} user={user.data} />,
              // });
              toast.dismiss(toastId);
              toast.success('Please check your email for the link');
            }
          } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send verification email');
          } finally {
            toast.dismiss(toastId);
          }
        } else {
          toast.error('No user found with the email');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex justify-center items-center shadow-xl bg-[url('/images/beams-with.png')] bg-no-repeat bg-cover bg-center bg-fixed">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto sm:max-w-md w-full">
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow dark:border  dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="text-normal font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-white text-center">
              Reset Your Password
            </div>
            {id && token ? (
              isLoading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-gray-900 dark:border-white"></div>
                  <span className="ml-3 text-gray-900 dark:text-white">Authenticating...</span>
                </div>
              ) : (
                <div>
                  {isVerified ? (
                    <FormProvider {...methods}>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <input type="hidden" name="action" value="change_password" />
                        <PasswordInput name="password" label="New Password" />

                        <PasswordInput
                          name="password_confirm"
                          label="Confirm Password"
                          showConfirm
                        />

                        <div className="mt-8">
                          <RaisedButton
                            type="submit"
                            size="md"
                            color="auto"
                            iconPosition="after"
                            className="w-full flex flex-row justify-center items-center my-6 md:my-10"
                            disabled={submitting}
                          >
                            {submitting ? 'Resetting...' : 'Reset Password'}
                          </RaisedButton>
                        </div>
                      </form>
                    </FormProvider>
                  ) : isExpired ? (
                    <div className="text-gray-900 dark:text-white text-sm">
                      Your token has expired, please regenerate another token.
                    </div>
                  ) : (
                    <div className="text-gray-900 dark:text-white text-sm">
                      Your token is not valid, please regenerate another token.
                    </div>
                  )}
                </div>
              )
            ) : (
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                  <input type="hidden" name="action" value="check_email" />
                  <FormInput
                    className="h-full flex-grow"
                    placeholder=""
                    name="email"
                    label="Enter your registered email"
                    type="email"
                  />

                  <div className="mt-8">
                    <RaisedButton
                      type="submit"
                      size="md"
                      color="auto"
                      iconPosition="after"
                      className="w-full flex flex-row justify-center items-center my-6 md:my-10"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Reset Password'}
                    </RaisedButton>
                  </div>
                </form>
              </FormProvider>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
