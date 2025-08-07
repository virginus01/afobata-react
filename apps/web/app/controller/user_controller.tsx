import { modHeaders } from '@/app/helpers/modHeaders';
import { baseUrl } from '@/app/helpers/baseUrl';
import { api_get_user } from '@/app/src/constants';
import { getAuthSessionData } from '@/app/controller/auth_controller';
import { cache } from 'react';
import { Brand } from '@/app/models/Brand';

export const fetchUserData = cache(
  async ({
    subFolder,
    revalidate = 3600,
    siteInfo,
  }: {
    subFolder?: string;
    revalidate?: number;
    siteInfo?: Brand;
  }): Promise<{ user: UserTypes | null; isLoading: boolean; finalUrl?: string }> => {
    let isLoading = true;
    let user: UserTypes | null = null;
    let finalUrl: string | undefined;

    try {
      const userSession: AuthModel = await getAuthSessionData();

      if (!userSession.brandId) {
        throw new Error('Brand Id missing');
      }

      const url = await api_get_user({
        subBase: userSession.brandId ?? '',
        uid: userSession.id ?? '',
        brandId: userSession.brandId ?? '',
        remark: 'user-controller-fetch-user',
      });

      finalUrl = await baseUrl(url);

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: await modHeaders('get'),
        credentials: 'include',
        cache: 'force-cache',
        next: {
          revalidate,
          tags: ['user'],
        },
      });

      if (!response.ok) {
        console.warn(
          `Failed to fetch user data: ${response.statusText} @ ${finalUrl} (Status: ${response.status})`,
        );
        return { user, isLoading, finalUrl };
      }

      const { data, status, msg } = await response.json();

      if (status) {
        user = data;
      } else {
        console.error('User fetch error:', msg);
        user = {} as UserTypes;
      }

      return { user, isLoading, finalUrl };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },
);
