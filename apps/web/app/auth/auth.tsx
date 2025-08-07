import NextAuth from 'next-auth';
import { authConfig } from '@/app/auth/auth.config';

export const { auth, signIn, signOut } = NextAuth({ ...authConfig });
