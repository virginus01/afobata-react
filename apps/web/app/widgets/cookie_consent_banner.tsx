'use client';

import { useEffect, useState } from 'react';
import { setClientCookie } from '@/helpers/setClientCookie';

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (consent: any) => {
    localStorage.setItem('cookieConsent', consent);
    setShowBanner(false);

    if (consent === 'accepted') {
      setClientCookie('cookieConsent', 'accepted', 365);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <p className="text-xs">
          We use cookies to improve your experience. By using our site, you agree to our use of
          cookies.
        </p>
        <div className="space-x-2 whitespace-nowrap flex flex-row">
          <button
            onClick={() => handleConsent('rejected')}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
          >
            Reject
          </button>
          <button
            onClick={() => handleConsent('accepted')}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
