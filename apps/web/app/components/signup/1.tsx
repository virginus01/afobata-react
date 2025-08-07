'use client';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api_signup, route_public_page, dashboard_page, emptySelect } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';
import { CustomButton, SearchableSelect } from '@/app/widgets/widgets';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import FormInput from '@/app/widgets/hook_form_input';
import Link from 'next/link';
import { isNull } from '@/app/helpers/isNull';
import { isPWA } from '@/app/helpers/isPWA';
import { lowercase } from '@/app/helpers/lowercase';
import PasswordInput from '@/app/widgets/password_update';
import { signIn } from 'next-auth/react';
import HoneyPot from '@/app/widgets/honey_pot';
import indexedDB from '@/app/utils/indexdb';
import { Country } from '@/app/models/Country';
import { countryList } from '@/app/data/countries';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

// Validation Schema
const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  country: Yup.string().required('Country is required'),
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/\d/, 'Password must contain at least one number'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .required('Confirm password is required'),
  terms: Yup.bool().oneOf([true], 'You must accept the terms and conditions'),
});

function SignUp({
  siteInfo,
  viewType,
  data,
  pageEssentials,
}: {
  siteInfo: BrandType;
  viewType?: any;
  data: any;
  pageEssentials: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [honeyPot, setHoneyPot] = useState('');
  const { refreshPage } = useDynamicContext();
  const [country, setCountry] = useState<Country>({
    id: 'ng',
    code: 'ng',
    label: 'Nigeria',
    value: 'ng',
  } as any);

  const methods = useForm<UserTypes | any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password_confirm: '',
      country: country.id,
      registeredBy: siteInfo?.userId!,
      registeredUnder: siteInfo.id,
      loggedUnder: siteInfo.id,
      loggedUnderSlug: siteInfo.slug,
      selectedProfile: siteInfo.type === 'creator' ? 'creator' : siteInfo.type || 'custom',
      terms: false,
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const onSubmit = async (values: any) => {
    if (honeyPot) {
      console.info('Bot detected');
      return;
    }

    if (isNull(siteInfo.slug)) {
      toast.error('Brand info missing. Contact support.');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { auth: firebaseAuth } = await import('@/app/lib/firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');

      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        values.email,
        values.password,
      );

      const user: any = userCredential.user;

      const url = await api_signup({ subBase: siteInfo.slug });

      const payload: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        defaultCurrency: values.defaultCurrency,
        country: values.country,
        accessToken: user.accessToken,
        providerId: user.providerId,
        uid: user.uid,
        ipInfo: {},
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(res.statusText);
        toast.error('Error Creating Account, contact us');
        return;
      }

      const response = await res.json();

      if (response.status && !isNull(response.data)) {
        toast.success('Signup successful');

        indexedDB.clearAllTables();

        const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result.ok && !result.error) {
          toast.success('Login successful');
          refreshPage(['all'], true, true);
          router.push(
            dashboard_page({ subBase: siteInfo.slug!, plateform: 'web', action: 'success' }),
          );
        } else {
          toast.error(result.error || 'Login failed');
        }
      } else {
        toast.error(response.msg || 'Signup failed. Please try again.');
      }
    } catch (error: any) {
      if (error?.code === 'auth/email-already-in-use') {
        toast.error('Email already in use');
      } else {
        console.error('Error during signup:', error);
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <div className="text-center text-gray-500 text-lg font-bold">
          Create your {!isNull(siteInfo) ? siteInfo.name : ' '} account
        </div>
        <div className="text-center text-gray-500 text-xs">
          Already have an account?{' '}
          <Link
            href={route_public_page({
              paths: ['login'],
              params: [{ plateform: isPWA() ? 'web' : (viewType ?? '') }],
            })}
            className="text-xs text-blue-700"
          >
            {' login here '}
          </Link>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <HoneyPot
            onChange={() => {
              setHoneyPot('bot');
            }}
          />
          <div className="flex flex-col space-y-6 h-full w-full">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
              <FormInput name="firstName" label="First Name" error={errors.firstName?.message} />
              <FormInput name="lastName" label="Last Name" error={errors.lastName?.message} />
            </div>

            <FormInput
              type="email"
              name="email"
              label="Email Address"
              error={errors.email?.message}
            />

            <PasswordInput name="password" label="Password" />
            <PasswordInput name="password_confirm" label="Confirm Password" showConfirm />

            <div className="my-4">
              <SearchableSelect
                label="Select your country"
                items={emptySelect.concat(
                  countryList?.map((country: any) => ({
                    id: country.code,
                    value: country.code,
                    label: country.name,
                    disabled: false,
                  })) || [],
                )}
                onSelect={(selectedCountry: any) => {
                  if (isNull(selectedCountry)) return;

                  const matched = countryList?.find(
                    (country: any) => lowercase(country?.code ?? '') === lowercase(selectedCountry),
                  );
                  setCountry(matched ?? {});
                  setValue('country', selectedCountry);
                  setValue('defaultCurrency', matched?.currency ?? '');
                }}
                allowMultiSelect={false}
                selectPlaceholder="Select Country"
                defaultValues={[country.code ?? 'ng']}
              />
              {errors.country && (
                <p className="text-xs my-2 text-red-500">{errors.country.message as string}</p>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  {...methods.register('terms')}
                  className="h-4 w-4 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] border-gray-300 rounded"
                />

                <label htmlFor="terms" className="text-sm">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline" target="_blank">
                    terms and conditions
                  </a>
                  .
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-500">{errors.terms.message as string}</p>
              )}
            </div>

            <CustomButton type="submit" disabled={loading} iconPosition="after">
              {loading ? 'Registering...' : 'Signup'}
            </CustomButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default memo(SignUp);
