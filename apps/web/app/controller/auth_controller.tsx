'use server';
import { isNull } from '@/app/helpers/isNull';
import { auth } from '@/api/auth/[...nextauth]/actions';
import { fetchDataWithConditions } from '@/database/mongodb';
import { cache } from 'react';

export const getAuthSessionData = cache(async (): Promise<AuthModel> => {
  const session: any = (await auth()) ?? {};
  const userSession: AuthModel = session.user;
  return !isNull(userSession) ? userSession : {};
});

export async function getSeverSessionData(apiKey?: string, apiSecret?: string): Promise<AuthModel> {
  try {
    let session: any = (await auth()) ?? {};
    let authentication = {};

    if (!isNull(session)) {
      [authentication] = await fetchDataWithConditions('auth', { id: session.id });
      return { ...session, ...authentication };
    }

    return {};
  } catch (error) {
    throw Error(error as string);
  }
}
