import admin from '@/app/lib/firebaseAdmin';
import { deleteDataWithConditions } from '@/api/database/connection';
import axios from 'axios';

interface FirebaseErrorResponse {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

// Define structured error interface
interface AuthError {
  code: string;
  message: string;
  originalError?: string;
}

export async function loginFBUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ status: boolean; data?: any; error?: string | AuthError }> {
  const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!API_KEY) {
    return {
      status: false,
      error: JSON.stringify({
        code: 'missing-config',
        message: 'Service configuration error. Please contact support.',
        originalError: 'Firebase API key not configured',
      } as AuthError),
    };
  }

  if (!email || !password) {
    return {
      status: false,
      error: JSON.stringify({
        code: 'missing-credentials',
        message: 'Email and password are required',
        originalError: 'Missing email or password',
      } as AuthError),
    };
  }

  try {
    const res = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      },
    );

    return {
      status: true,
      data: res.data, // includes idToken, refreshToken, localId, etc.
    };
  } catch (error: any) {
    console.error('Firebase login error:', error);

    // Handle network/timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        status: false,
        error: JSON.stringify({
          code: 'network-timeout',
          message: 'Request timed out. Please check your connection and try again.',
          originalError: error.message,
        } as AuthError),
      };
    }

    // Handle network errors
    if (!error.response) {
      return {
        status: false,
        error: JSON.stringify({
          code: 'network-error',
          message: 'Network error. Please check your connection and try again.',
          originalError: error.message,
        } as AuthError),
      };
    }

    // Handle Firebase API errors
    const firebaseError = error.response?.data as FirebaseErrorResponse;
    const errorMessage = firebaseError?.error?.message || 'UNKNOWN_ERROR';

    // Comprehensive Firebase error mapping
    const errorMap: Record<string, AuthError> = {
      INVALID_PASSWORD: {
        code: 'auth/wrong-password',
        message: 'Invalid email or password',
        originalError: errorMessage,
      },
      EMAIL_NOT_FOUND: {
        code: 'auth/user-not-found',
        message: 'No account found with this email address',
        originalError: errorMessage,
      },
      INVALID_EMAIL: {
        code: 'auth/invalid-email',
        message: 'Please enter a valid email address',
        originalError: errorMessage,
      },
      USER_DISABLED: {
        code: 'auth/user-disabled',
        message: 'This account has been disabled. Please contact support.',
        originalError: errorMessage,
      },
      TOO_MANY_ATTEMPTS_TRY_LATER: {
        code: 'auth/too-many-requests',
        message: 'Too many failed attempts. Please try again later.',
        originalError: errorMessage,
      },
      WEAK_PASSWORD: {
        code: 'auth/weak-password',
        message: 'Password is too weak. Please choose a stronger password.',
        originalError: errorMessage,
      },
      EMAIL_EXISTS: {
        code: 'auth/email-already-in-use',
        message: 'An account with this email already exists',
        originalError: errorMessage,
      },
      OPERATION_NOT_ALLOWED: {
        code: 'auth/operation-not-allowed',
        message: 'Email/password accounts are not enabled. Please contact support.',
        originalError: errorMessage,
      },
      INVALID_ID_TOKEN: {
        code: 'auth/invalid-id-token',
        message: 'Invalid authentication token. Please try signing in again.',
        originalError: errorMessage,
      },
      TOKEN_EXPIRED: {
        code: 'auth/id-token-expired',
        message: 'Your session has expired. Please sign in again.',
        originalError: errorMessage,
      },
      USER_NOT_FOUND: {
        code: 'auth/user-not-found',
        message: 'No account found with this email address',
        originalError: errorMessage,
      },
      INVALID_REFRESH_TOKEN: {
        code: 'auth/invalid-refresh-token',
        message: 'Session expired. Please sign in again.',
        originalError: errorMessage,
      },
      MISSING_PASSWORD: {
        code: 'auth/missing-password',
        message: 'Password is required',
        originalError: errorMessage,
      },
      MISSING_EMAIL: {
        code: 'auth/missing-email',
        message: 'Email is required',
        originalError: errorMessage,
      },
    };

    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return {
        status: false,
        error: JSON.stringify({
          code: 'auth/too-many-requests',
          message: 'Too many requests. Please wait a moment and try again.',
          originalError: errorMessage,
        } as AuthError),
      };
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return {
        status: false,
        error: JSON.stringify({
          code: 'server-error',
          message: 'Server error. Please try again later.',
          originalError: `HTTP ${error.response.status}: ${errorMessage}`,
        } as AuthError),
      };
    }

    // Map Firebase error or provide default
    const mappedError = errorMap[errorMessage] || {
      code: 'auth/unknown-error',
      message: 'Authentication failed. Please try again.',
      originalError: errorMessage,
    };

    return {
      status: false,
      error: JSON.stringify(mappedError),
    };
  }
}

export async function deleteFBAuth({
  uid,
}: {
  uid: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await admin.auth().deleteUser(uid);
    const result = await deleteDataWithConditions({ collectionName: 'auth', conditions: { uid } });
    return { success: result.deletedCount > 0 ? true : false };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function createFBUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ status: boolean; error?: string; data?: any; msg?: string }> {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    return { status: true, data: userRecord };
  } catch (error: any) {
    let msg = '';
    if (error?.code === 'auth/email-already-in-use') {
      msg = 'Email already in use';
    } else {
      console.error('Error during signup:', error);
      msg = 'An error occurred. Please try again.';
    }
    return { status: false, msg, error: error.message || 'Unknown error' };
  }
}
