'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api_get_user, api_update_user } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';
import { isDateExpired } from '@/app/helpers/isDateExpired';
import { toast } from 'sonner';

export function Verify({ siteInfo }: { siteInfo: BrandType }) {
  const searchParams = useSearchParams();
  const id = searchParams.get('user') || '';
  const token = searchParams.get('token') || '';
  const [isVerified, setIsVerified] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateUser = async () => {
      try {
        const urlG = await api_get_user({
          subBase: siteInfo.slug,
          id: id,
          remark: 'verify',
        });

        const response = await fetch(urlG, {
          method: 'GET',
          headers: await modHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const res = await response.json();

        if (res.status) {
          if (res.data.emailVerified) {
            setAlreadyVerified(true);
            return;
          }
          const checkExpire = isDateExpired(res.data.token.expireDate);

          if (!checkExpire) {
            const url = await api_update_user({ subBase: siteInfo.slug });

            const userData: UserTypes = {
              id: id,
              emailVerified: true,
            };

            const updateResponse = await fetch(url, {
              method: 'POST',
              headers: await modHeaders(),
              body: JSON.stringify(userData),
            });

            const updateRes = await updateResponse.json();

            if (updateRes.status) {
              toast.success('Email verified successfully');
              setIsVerified(true);
            } else {
              console.error(updateRes.msg);
              toast.error('Failed to verify email');
            }
          } else {
            setIsExpired(true);
          }
        } else {
          console.error(res.msg);
          toast.error('User not found');
        }
      } catch (error: any) {
        toast.error(error.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) {
      updateUser();
    }
  }, [id, token, siteInfo.id, siteInfo.slug]);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex justify-center items-center shadow-xl">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto sm:max-w-md w-full">
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow dark:border  dark:border-gray-700">
          <div className="p-6 space-y-4 sm:p-8">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-gray-900 dark:border-white"></div>
                <span className="ml-3 text-gray-900 dark:text-white">Verifying...</span>
              </div>
            ) : (
              <div className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white text-center">
                {alreadyVerified
                  ? 'Your email has already been verified!'
                  : isVerified
                    ? 'Your email has been verified successfully!'
                    : isExpired
                      ? 'The verification link has expired.'
                      : 'Unable to verify email.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
