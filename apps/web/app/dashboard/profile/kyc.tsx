import { useCart } from '@/app/contexts/cart_context';
import { convertCurrency } from '@/app/helpers/convertCurrency';
import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';
import CustomDrawer from '@/app/src/custom_drawer';
import { CustomButton } from '@/app/widgets/custom_button';
import React, { useState } from 'react';
import { FaLevelUpAlt, FaCheckCircle } from 'react-icons/fa';
import KYCForm from '@/dashboard/profile/kyc/kyc_form';

export default function KYC({
  siteInfo,
  user,
  auth,
  rates,
}: {
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
  rates?: any;
}) {
  const userTier = user?.auth?.tier ?? 0;

  const levels: _Level[] = [
    {
      tier: 1,
      dailyLimit: [20000, 50000],
      monthlyLimit: [50000, 500000],
      limits: [
        { text: 'Personal Information Needed' },
        { text: 'Email Verification Needed' },
        { text: 'Government ID Needed', isStriked: true },
      ],
      reguirements: [],
      buttonLabel: userTier >= 1 && !user.isAdmin ? 'Completed' : 'Upgrade',
      hasRangeLimit: true,
    },
    {
      tier: 2,
      dailyLimit: [100000000],
      monthlyLimit: [100000000],
      limits: [
        { text: 'Personal Information Needed' },
        { text: 'Email Verification Needed' },
        { text: 'Government ID Needed' },
      ],
      reguirements: ['id'],
      buttonLabel: userTier >= 2 && !user.isAdmin ? 'Completed' : 'Upgrade',
      hasRangeLimit: false,
    },
  ];

  return (
    <div className="mt-4 p-4">
      <header className="mb-4">
        <h2 className="text-xs font-bold mb-2" aria-label="Know Your Customer (KYC)">
          Know Your Customer (KYC)
        </h2>
        <p
          className="font-medium text-xs mb-5 text-gray-600 dark:text-gray-300"
          aria-label="KYC Information"
        >
          Limits apply to wallet withdrawals only, not to direct sales.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-gray-700 dark:text-gray-300 my-6">
        {/* Tier */}
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          Current Tier: <strong className="ml-1">{user.auth?.tier || 'none'}</strong>
        </div>

        {/* Daily Limit */}
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-green-600 dark:text-green-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          Daily Limit:{' '}
          <strong className="ml-1">
            {curFormat(user.auth?.dailyLimit || 0, user.currencyInfo?.currencySymbol)}
          </strong>
        </div>

        {/* Monthly Limit */}
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          Monthly Limit:{' '}
          <strong className="ml-1">
            {curFormat(user.auth?.monthlyLimit || 0, user?.currencyInfo?.currencySymbol)}
          </strong>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="KYC Levels">
        {levels.map((level, index) => (
          <LevelCard
            key={index}
            level={level}
            buttonLabel={level.buttonLabel}
            siteInfo={siteInfo}
            user={user}
            rates={rates}
            auth={auth}
          />
        ))}
      </section>
    </div>
  );
}

interface LevelCardProps {
  level: _Level;
  rates: any;
  buttonLabel: string;
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  rates,
  buttonLabel,
  siteInfo,
  user,
  auth,
}) => {
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const userCurrency = user.defaultCurrency || '';
  const currencySymbol = user.currencyInfo?.currencySymbol || '';
  const isCompleted = buttonLabel === 'Completed';

  // Calculate daily limits
  const minDailyLimit =
    !isNull(rates) && level.dailyLimit[0]
      ? convertCurrency({
          amount: level.dailyLimit[0],
          fromCurrency: 'ngn',
          toCurrency: userCurrency,
          rates,
        })
      : 0;

  const maxDailyLimit =
    !isNull(rates) && level.hasRangeLimit && level.dailyLimit.length > 1 && level.dailyLimit[1]
      ? convertCurrency({
          amount: level.dailyLimit[1],
          fromCurrency: 'ngn',
          toCurrency: userCurrency,
          rates,
        })
      : minDailyLimit;

  // Calculate monthly limits
  const minMonthlyLimit =
    !isNull(rates) && level.monthlyLimit[0]
      ? convertCurrency({
          amount: level.monthlyLimit[0],
          fromCurrency: 'ngn',
          toCurrency: userCurrency,
          rates,
        })
      : 0;

  const maxMonthlyLimit =
    !isNull(rates) && level.hasRangeLimit && level.monthlyLimit.length > 1 && level.monthlyLimit[1]
      ? convertCurrency({
          amount: level.monthlyLimit[1],
          fromCurrency: 'ngn',
          toCurrency: userCurrency,
          rates,
        })
      : minMonthlyLimit;

  // Handle KYC upgrade
  const handleUpgrade = () => {
    setIsVerificationOpen(true);
  };

  // Formats limit display based on whether it's a range or fixed value
  const formatLimitDisplay = (min: number, max: number, hasRange: boolean) => {
    if (hasRange && max > min) {
      return `${curFormat(min, currencySymbol)} - ${curFormat(max, currencySymbol)}`;
    }
    return curFormat(min, currencySymbol);
  };

  return (
    <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-gray-800 dark:text-white">Tier {level.tier}</h3>
        {level.tier === user?.auth?.tier && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 flex items-center">
            <FaCheckCircle className="mr-1" /> Active
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Daily Limit</p>
          <p className="text-xs font-bold">
            {formatLimitDisplay(minDailyLimit, maxDailyLimit, level.hasRangeLimit)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Monthly Limit</p>
          <p className="text-xs font-bold">
            {formatLimitDisplay(minMonthlyLimit, maxMonthlyLimit, level.hasRangeLimit)}
          </p>
        </div>
      </div>

      <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Requirements</h4>
      <ul className="space-y-3 mb-6">
        {level.limits.map((limit, index) => (
          <li
            key={index}
            className={`flex items-center ${
              limit.isStriked
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg
              className={`flex-shrink-0 w-4 h-4 mr-2 ${
                limit.isStriked
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className={`text-xs ${limit.isStriked ? 'line-through' : ''}`}>{limit.text}</span>
          </li>
        ))}
      </ul>

      <div className="h-8">
        <CustomButton
          onClick={handleUpgrade}
          disabled={isCompleted}
          style={isCompleted ? 6 : 1}
          iconPosition="after"
          icon={isCompleted ? <FaCheckCircle /> : <FaLevelUpAlt />}
        >
          {buttonLabel}
        </CustomButton>
      </div>

      <CustomDrawer
        direction="right"
        isWidthFull={true}
        showHeader={true}
        isHeightFull={true}
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        header="KYC Verification"
      >
        <KYCForm
          siteInfo={siteInfo!}
          user={user}
          level={{
            ...level,
            dailyLimit: [minDailyLimit, maxDailyLimit],
            monthlyLimit: [minMonthlyLimit, maxMonthlyLimit],
          }}
          auth={auth}
          onComplete={() => setIsVerificationOpen(false)}
        />
      </CustomDrawer>
    </div>
  );
};
