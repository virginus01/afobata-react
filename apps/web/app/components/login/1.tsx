'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { app_page, dashboard_page, route_public_page } from '@/app/src/constants';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import FormInput from '@/app/widgets/hook_form_input';
import { isAdmin } from '@/app/helpers/isAdmin';
import { isNull } from '@/app/helpers/isNull';
import Link from 'next/link';
import PasswordInput from '@/app/widgets/password_update';
import { CustomButton } from '@/app/widgets/custom_button';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import HoneyPot from '@/app/widgets/honey_pot';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

const validationSchema = Yup.object({
  email: Yup.string().required('Valid email is required'),
  password: Yup.string().required('Strong password is required'),
});

function Login({
  siteInfo,
  viewType,
  onDone,
  auth = {},
}: {
  siteInfo: BrandType;
  viewType?: 'view' | 'modal';
  onDone?: (data: any) => void;
  auth?: AuthModel;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { refreshPage } = useDynamicContext();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [honeyPot, setHoneyPot] = useState('');
  const searchParams = useSearchParams();
  const isWeb = searchParams.get('platform') ?? 'web' === 'web';
  const plateform = searchParams.get('platform') ?? 'web';

  const methods = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: '',
      password: '',
      loggedUnder: siteInfo.id,
      loggedUnderSlug: siteInfo.slug,
      selectedProfile:
        isAdmin(siteInfo.ownerData) ||
        !Array.isArray(siteInfo.profiles) ||
        siteInfo.profiles.length === 0
          ? ''
          : siteInfo.profiles[0],
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result: any = await signIn('google', { redirect: false });

      if (result.ok && !result?.error) {
        toast.success('login successful');
        if (viewType === 'modal') {
          onDone?.(auth);
        } else if (!isWeb) {
          router.push(app_page({ subBase: siteInfo.slug! }));
        } else {
          router.push(dashboard_page({ subBase: siteInfo.slug! }));
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('An error occurred during sign-in');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: any) => {
    if (honeyPot) {
      console.info('get away you bot');
      return;
    }

    setLoading(true);
    try {
      const result: any = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result.ok && !result?.error) {
        if (isNull(siteInfo.slug)) {
          toast.error('brand info missing, contact support');
          return;
        }
        refreshPage(['all'], true, true);
        if (viewType === 'modal') {
          onDone?.(auth);
        } else {
          router.push(dashboard_page({ subBase: siteInfo.slug!, plateform, action: 'success' }));
        }
        toast.success('login successful');
      } else {
        toast.error('login failed try again');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <div>
      <div className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-white text-center">
        Log into your {!isNull(siteInfo) ? siteInfo.name : ' '} account
      </div>
      <div className="my-5">
        <div className="text-center text-gray-500 text-sm mt-5">
          {" Don't have an account?"}
          <Link
            href={route_public_page({
              paths: ['signup'],
              params: [{ plateform }],
            })}
            className="text-xs text-blue-700"
          >
            {' signup here '}
          </Link>
        </div>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <HoneyPot
            onChange={() => {
              setHoneyPot('bot');
            }}
          />
          <div className="mt-4">
            <FormInput
              type="email"
              name="email"
              className="h-full w-full"
              onChange={(e) => setEmail(e.target.value)}
              animate={false}
              label="Email"
              placeholder="Enter Your Email"
              showLabel={true}
            />
          </div>

          <div className="mt-4">
            <PasswordInput name="password" label=" Password" showConfirm />
            <Link
              href={route_public_page({ paths: ['password-reset'], params: [{ plateform }] })}
              className="text-xs text-gray-500"
            >
              Forget Password?
            </Link>
          </div>

          <div className="mt-8 flex flex-col space-y-4">
            <CustomButton style={1} type="submit">
              {loading ? 'logging in...' : 'login'}
            </CustomButton>

            {siteInfo.id === '11' && (
              <CustomButton
                icon={<FaGoogle />}
                style={1}
                type="button"
                onClick={handleGoogleSignIn}
              >
                Sign in with Google
              </CustomButton>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default Login;
