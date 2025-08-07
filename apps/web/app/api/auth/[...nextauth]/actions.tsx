import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { fetchDataWithConditions } from '@/database/mongodb';
import { getBrandInfo } from '@/api/brand/brand';
import { getUserId } from '@/app/helpers/getUserId';
import { isNull } from '@/app/helpers/isNull';
import { createUser } from '@/api/auth/create';
import { clearCache, setPublicCookie } from '@/app/actions';
import { createJWT } from '@/app/helpers/createJWT';
import { revalidatePath } from 'next/cache';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { addToCurrentDate } from '@/app/helpers/addToCurrentDate';
import { loginFBUser } from '@/api/firebase';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.SITE_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 1,
    updateAge: 60 * 20,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string;
          const password = credentials?.password as string;

          if (!email || !password) {
            return null; // Ensuring type consistency
          }

          let userAuthData: AuthModel = {};
          let user: UserTypes = {} as any;
          const siteInfo = await getBrandInfo();

          try {
            const { data: userCredential } = await loginFBUser({ email, password });
            const fireUser = userCredential;

            let [userAuth]: UserTypes[] = await fetchDataWithConditions('auth', {
              uid: fireUser.uid,
            });

            if (isNull(userAuth)) {
              return null;
            }

            userAuthData = { ...userAuth } as AuthModel;
          } catch (error: any) {
            console.error('Authentication error:', error);
            return null;
          }

          if (!isNull(userAuthData)) {
            userAuthData.brandId = siteInfo.id ?? '';
            const userId = getUserId({ userId: userAuthData.id ?? '', brandId: siteInfo.id ?? '' });
            let currentUser: UserTypes = {};

            let currentUserData: UserTypes[] = await fetchDataWithConditions('users', {
              id: userId,
            });

            if (isNull(currentUserData)) {
              const userResult = await createUser({ auth: userAuthData, siteInfo });

              if (!userResult.status) {
                console.error('Error creating user: ', userResult.msg);
                return null;
              }

              currentUser = userResult.user ?? {};
            } else {
              currentUser = currentUserData[0];
            }

            if (isNull(currentUser) || isNull(userAuthData)) return null;

            Object.entries(userAuthData).forEach(([key, value]) => {
              (user as any)[key] = value ?? '';
            });

            user.brandId = siteInfo.id ?? '';
            user.userId = currentUser.id ?? '';
            (user as any).balance = currentUser?.wallet?.value ?? '';
            user.packageId = currentUser.packageId ?? '';
            user.api_key = currentUser.api_key ?? '';
            user.isAdmin = currentUser.isAdmin ?? false;
            user.emailVerified = currentUser.emailVerified;
            user.api_secret = currentUser.api_secret ?? '';
            (user as any).expiresAt = convertDateTime(addToCurrentDate({ days: 1 }));

            delete user.password;
            delete user.verificationData;

            setPublicCookie({ data: { brandId: siteInfo.id }, key: 'brand' });

            try {
              const accessToken = await createJWT(
                { userId: user.userId, email: user.email, name: user.name },
                process.env.NEXTAUTH_SECRET ?? '',
                '24h',
              );

              if (isNull(accessToken)) return null;

              user.accessToken = accessToken;
            } catch (jwtError) {
              console.error('JWT creation error:', jwtError);
              user.accessToken = 'fallback_token';
            }
            revalidatePath('/');
            clearCache('user');
            return user;
          }

          return null;
        } catch (error: any) {
          console.error('Authentication error:', error.message);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.userId = (user as any).userId;
        token.emailVerified = (user as any).emailVerified;
        token.api_key = (user as any).api_key;
        token.brandId = (user as any).brandId;
        token.api_secret = (user as any).api_secret;
        token.isAdmin = (user as any).isAdmin;
        token.accessToken = (user as any).accessToken;
        token.packageId = (user as any).packageId;
        token.balance = (user as any).balance;
        token.defaultCurrency = (user as any).defaultCurrency;
        token.expiresAt = (user as any).expiresAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.userId = token.userId as string;
        session.user.emailVerified = token.emailVerified as any;
        session.user.brandId = token.brandId as string;
        session.user.api_key = token.api_key as string;
        session.user.api_secret = token.api_secret as string;
        session.user.accessToken = token.accessToken as any;
        session.user.isAdmin = token.isAdmin as any;
        session.user.packageId = token.packageId as any;
        session.user.defaultCurrency = token.defaultCurrency as any;
        (session as any).accessToken = token.accessToken as any;
        (session as any).balance = token.balance as any;
        (session as any).expiresAt = token.expiresAt as any;
      }

      return session;
    },
  },
});

// Type declaration to help with TypeScript
declare module 'next-auth' {
  interface Session {
    user: UserTypes;
  }
}
