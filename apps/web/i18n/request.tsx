import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

// Statically import all locale messages
import en from '@/messages/en.json';
import fr from '@/messages/fr.json';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

const messagesMap: any = { en, fr };

export default getRequestConfig(async () => {
  let locale = defaultLocale;

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;

  if (localeCookie && locales.includes(localeCookie)) {
    locale = localeCookie;
  } else {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    const preferred = acceptLanguage?.split(',')[0]?.split('-')[0];
    if (preferred && locales.includes(preferred)) {
      locale = preferred;
    }
  }

  return {
    locale,
    messages: messagesMap[locale],
  };
});
