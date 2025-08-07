'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { NextIntlClientProvider, useLocale } from 'next-intl';

const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#490249',
    secondary: '#2563eb',
    accent: '#f59e0b',
    background: '#2563eb',
    text: '#1f2937',
    buttonPrimary: '#490249',
    buttonSecondary: '#6b7280',
    buttonText: '#ffffff',
  },
  borderRadius: '0.375rem',
  fontFamily: 'Inter, system-ui, sans-serif',
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
  resetTheme: () => {},
});

export const ThemeProvider = ({ children, initialTheme = defaultTheme }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme((current) => ({
      ...current,
      ...newTheme,
    }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    root.style.setProperty('--border-radius', theme.borderRadius);
    root.style.setProperty('--font-family', theme.fontFamily);
  }, [theme]);

  const locale = 'en';

  // Dynamic import for locale messages
  const [messages, setMessages] = useState<any>(null);

  if (!messages) return null;

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
