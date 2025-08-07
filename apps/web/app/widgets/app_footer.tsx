import { useState } from 'react';
import { useUserContext } from '@/app/contexts/user_context';
import { useBaseContext } from '@/app/contexts/base_context';
import { randomNumber } from '@/app/helpers/randomNumber';
import { isNull } from '@/app/helpers/isNull';
import { Wallet } from 'lucide-react';
import { FaMoneyBills } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

export default function AppFooter({
  nav,
  user,
  siteInfo,
  params,
}: {
  nav: any;
  user: UserTypes;
  siteInfo: BrandType;
  params: any;
}) {
  const { setIsSwitchProfileOpen, essentialData } = useUserContext();
  const [activeTab, setActiveTab] = useState('home');
  const { addRouteData, closeAllRoutes } = useBaseContext();
  const router = useRouter();

  return (
    <>
      <div className="block sm:hidden fixed bottom-0 left-0 right-0 border-t bg-white border-gray-200 font-bold text-xs">
        {/* Tab Bar */}
        <div
          className={`flex justify-between items-center  px-2 py-1 relative  p-4 pb-3 ${'pb-5'}`}
        >
          <button
            className={`flex flex-col items-center p-1 px-3 ${
              activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'
            }`}
            onClick={() => {
              closeAllRoutes();
            }}
          >
            <svg
              className="w-5 h-5 font-bold"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-xs mt-1.5">Home</span>
          </button>

          <button
            className={`flex flex-col items-center p-1 ${
              activeTab === 'bills' ? 'text-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('bills')}
          >
            <FaMoneyBills className="h-5 w-5" />
            <span className="text-xs mt-1.5">Bills</span>
          </button>

          {/* Empty space for center button */}
          <div className="w-8"></div>

          <button
            className={`flex flex-col items-center p-1 ${
              activeTab === 'wallet' ? 'text-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs mt-1.5">Wallet</span>
          </button>

          <button
            className={`flex flex-col items-center p-1 px-3 ${
              activeTab === 'menu' ? 'text-blue-500' : 'text-gray-500'
            }`}
            onClick={() => {
              setActiveTab('menu');
              addRouteData({
                isOpen: true,
                data: nav,
                id: randomNumber(5),
                base: 'menu',
                action: 'menu',
                title: `${'User Menu'}`,
                name: `${'User Menu'}`,
                defaultData: essentialData?.nav?.userNav?.sub ?? nav ?? [],
              });
            }}
          >
            <svg viewBox="0 0 26 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="1.2" />
              <circle cx="12" cy="5" r="1.2" />
              <circle cx="19" cy="5" r="1.2" />
              <circle cx="5" cy="12" r="1.2" />
              <circle cx="12" cy="12" r="1.2" />
              <circle cx="19" cy="12" r="1.2" />
              <circle cx="5" cy="19" r="1.2" />
              <circle cx="12" cy="19" r="1.2" />
              <circle cx="19" cy="19" r="1.2" />
            </svg>

            <span className="text-xs">More</span>
          </button>

          {/* Middle middle Button - Absolutely positioned */}
          <button
            className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-0 !bg-transparent rounded-full flex flex-col items-center ${
              activeTab === 'middle' ? 'text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => {
              setActiveTab('middle');
              setIsSwitchProfileOpen(true);
            }}
          >
            <div className="bg-blue-500 rounded-full p-2 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
