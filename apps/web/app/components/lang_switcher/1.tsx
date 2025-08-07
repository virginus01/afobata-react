'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  // Add more languages as needed
];

const LanguageSwitcher = () => {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<string>('en');

  const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=').map((c) => c.trim());
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  };

  useEffect(() => {
    // Get initial language from cookie or default to 'en'
    const savedLang = 'en';
    setCurrentLang(savedLang);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Save to cookie with 1 year expiry (365 days)
    setCookie('SOLACE_PROJECT_LOCALE', langCode, 365);
    setCurrentLang(langCode);

  
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="block w-full px-4 py-1 sm:py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
