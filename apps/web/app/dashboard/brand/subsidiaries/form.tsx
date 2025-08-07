'use client';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { emptySelect, centralDomain, api_add_update_subsidiary } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';
import { CustomButton, SearchableSelect } from '@/app/widgets/widgets';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import FormInput from '@/app/widgets/hook_form_input';
import { isNull } from '@/app/helpers/isNull';
import { lowercase } from '@/app/helpers/lowercase';
import PasswordInput from '@/app/widgets/password_update';
import HoneyPot from '@/app/widgets/honey_pot';
import { Country } from '@/app/models/Country';
import { countryList } from '@/app/data/countries';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { useUserContext } from '@/app/contexts/user_context';
import CustomCard from '@/app/widgets/custom_card';
import CustomDrawer from '@/app/src/custom_drawer';
import BrandTypeSelection from '@/app/widgets/brand_switch';
import slugify from 'slugify';

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
});

function SubsciaryForm() {
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
  const { essentialData } = useUserContext();
  const [isBrandTypeSelectorOpen, setIsBrandTypeSelectorOpen] = useState(false);
  const [brandData, setBrandData] = useState<{
    name: string;
    slug: string;
    type: string;
    category?: string;
  }>({} as any);
  const [type, setType] = useState<any>({});

  const { brand: siteInfo, user, auth, nav } = essentialData;

  const filteredProfiles = nav?.allNavs?.filter(
    (profile: any) => profile.availableToBrands === true,
  );

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

  if (!isNull(errors)) {
    console.error(errors);
  }

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

      const url = await api_add_update_subsidiary({ subBase: siteInfo.slug });

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
        brandData,
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

      if (!res.ok) {
        console.error(res.statusText);
        console.error('Error adding benediciary. contact us');
        return;
      }

      const response = await res.json();

      if (response.status && !isNull(response.data)) {
        toast.success('Subsidiary Add');
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
    <div className="p-2">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <HoneyPot
            onChange={() => {
              setHoneyPot('bot');
            }}
          />
          <div className="w-full h-full flex flex-col sm:flex-row">
            <div className="w-full sm:w-2/3 flex flex-col space-y-4">
              <CustomCard title={'Manager Data'}>
                <div className="flex flex-col space-y-6 h-full w-full">
                  <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
                    <FormInput
                      name="firstName"
                      label="First Name"
                      error={errors.firstName?.message}
                    />
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
                          (country: any) =>
                            lowercase(country?.code ?? '') === lowercase(selectedCountry),
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
                      <p className="text-xs my-2 text-red-500">
                        {errors.country.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </CustomCard>

              <CustomCard title={'Brand Data'}>
                <div className="w-full h-full flex items-center justify-center px-2 py-5">
                  <div className="w-full max-w-xl space-y-6">
                    <div>
                      <FormInput
                        label={`Business Name eg: ${siteInfo.name} shop`}
                        animate={true}
                        controlled={false}
                        type="text"
                        placeholder="Enter business domain"
                        name={'name'}
                        defaultValue={`${user.lastName}'s platform`}
                        onChange={(e) => {
                          const slug = slugify(e.target.value, {
                            lower: true,
                            strict: true,
                            trim: true,
                          });
                          setBrandData({ ...brandData, slug } as any);
                        }}
                        onBlur={(e) => {
                          setBrandData({ ...brandData, name: e.target.value } as any);
                        }}
                      />
                    </div>

                    <div>
                      <FormInput
                        label={`Url eg: shop`}
                        animate={true}
                        controlled={false}
                        type="text"
                        placeholder="Enter business domain"
                        name={'slug'}
                        value={brandData.slug}
                        after={siteInfo.domain ?? centralDomain}
                        onBlur={(e) => {
                          const slug = slugify(e.target.value, {
                            lower: true,
                            strict: true,
                            trim: true,
                          });
                          setBrandData({ ...brandData, slug } as any);
                        }}
                      />

                      <p className="text-xs text-gray-500 mt-1">
                        You can upgrade your domain to <code className="font-mono">.com</code> or
                        <code className="font-mono">.com.ng</code> or any domain of your choice
                        later.
                      </p>
                    </div>

                    <div
                      className="hover:cursor-pointer"
                      onClick={() => setIsBrandTypeSelectorOpen(true)}
                    >
                      <div className="w-full border border-gray-300 rounded-sm flex justify-between">
                        <div className="py-2 px-2 ">{type?.name ?? 'none'}</div>
                        <div className="bltext-xs text-gray-800 bg-gray-300 py-2 px-6">change</div>
                      </div>
                    </div>

                    {type.brandShortDesc && (
                      <p className="text-xs text-gray-500 mt-1">{type.brandShortDesc}</p>
                    )}
                  </div>
                </div>
              </CustomCard>
            </div>
            <div className="w-full sm:w-2/6">
              <CustomCard title={'action'}>
                <CustomButton type="submit" disabled={loading} iconPosition="after">
                  {loading ? 'Registering...' : 'Add'}
                </CustomButton>
              </CustomCard>
            </div>
          </div>
        </form>
      </FormProvider>

      <CustomDrawer
        direction="right"
        isWidthFull={true}
        isHeightFull={true}
        showHeader={true}
        isOpen={isBrandTypeSelectorOpen}
        onClose={() => setIsBrandTypeSelectorOpen(false)}
        header="Switch Business Type"
      >
        <BrandTypeSelection
          siteInfo={siteInfo as any}
          user={user as any}
          upload={false}
          title="What type of business do you want to set up?"
          subtitle="Select the type of business you want to run. The platform features will be tailored to your selection. Below are the business types most people successfully profit from"
          profiles={filteredProfiles}
          selectedProfile={brandData?.type ?? ''}
          onSelectProfile={(newType) => {
            setBrandData({ ...brandData, type: newType.id ?? '' } as any);
            setType(newType);
            setIsBrandTypeSelectorOpen(false);
          }}
          onSubmit={() => {
            setIsBrandTypeSelectorOpen(false);
          }}
          submitting={false}
          submitted={false}
        />
      </CustomDrawer>
    </div>
  );
}

export default memo(SubsciaryForm);
