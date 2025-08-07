import React, { useState, useEffect, useCallback } from 'react';
import PinInput from '@/app/widgets/pin';
import { api_send_mail } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';
import { toast } from 'sonner';

type VerificationType = 'email' | 'phone' | 'whatsapp';
type VerificationStatus = 'pending' | 'sent' | 'verified' | 'failed';

interface PinVerificationProps {
  user: UserTypes;
  siteInfo: BrandType;
  mode: VerificationType;
  code?: string;
  onVerified: (code: string) => void;
  switchable: boolean;
}

const PinVerification: React.FC<PinVerificationProps> = ({
  user,
  siteInfo,
  mode = 'email',
  code = '',
  onVerified,
  switchable = false,
}) => {
  const [verificationType, setVerificationType] = useState<VerificationType>(mode);
  const [verificationCode, setVerificationCode] = useState<string>(code);
  const [userPin, setUserPin] = useState<string>('');
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [verified, setVerified] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Generate and send verification code
  const sendVerificationCode = useCallback(async (): Promise<void> => {
    const newCode = code;
    setStatus('sent');
    setResendDisabled(true);
    setCountdown(60);
    // Show different messages based on verification type
    const target =
      verificationType === 'email'
        ? user.email || 'your email'
        : verificationType === 'phone'
          ? user.phone || 'your phone'
          : user.phone || 'your WhatsApp';

    try {
      switch (verificationType) {
        case 'email': {
          const url = await api_send_mail({ subBase: siteInfo.slug });
          const payLoad: SendMailData = {
            to: [user?.email ?? ''],
            from: `${siteInfo.name} <no-reply@afobata.com>`,
            subject: 'Here is your Authentication Pin',
            body: { data: { code: newCode, brandName: siteInfo.name }, templateId: 'pin' },
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: await modHeaders('post'),
            body: JSON.stringify(payLoad),
          });

          if (!response.ok) {
            throw new Error(response.statusText);
          }

          const { status, msg } = await response.json();

          if (status) {
            setMessage(`Code sent to ${target}`);
          } else {
            toast.error(msg);
          }
          break;
        }
        // Add cases for other verification types if needed
        default:
          toast.error('Unsupported verification type.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send verification code. Please try again.');
    }

    // No longer initial load after first send
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [verificationType, code, isInitialLoad, user.email, user.phone, siteInfo.name, siteInfo.slug]);

  // Remove automatic sending of the code on initial load
  useEffect(() => {
    if (!isInitialLoad && verificationType !== mode) {
      sendVerificationCode();
    }
  }, [verificationType, mode, isInitialLoad, sendVerificationCode]);

  useEffect(() => {
    if (isInitialLoad) {
      toast.info('click on send code');
    }
  }, [isInitialLoad]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const verifyCode = (pin: string, dataPin: string): boolean => {
    try {
      if (pin === dataPin) {
        setStatus('verified');
        setMessage('Verification successful!');
        // Call onVerified immediately with the verified code

        onVerified(verificationCode);
        return true;
      } else {
        setStatus('failed');
        setMessage(`${pin} is Incorrect. Please try again.`);
        // Display toast error

        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setVerified(true);
    }
  };

  const handlePinChange = (pin: string): void => {
    setUserPin(pin);
    setVerified(false);
    // Check if a complete 4-digit code has been entered
    if (pin.length === 4) {
      verifyCode(pin, verificationCode);
    }
  };

  // Get available verification methods based on user data
  const getAvailableVerificationTypes = (): VerificationType[] => {
    const types: VerificationType[] = [];
    if (user.email) types.push('email');
    if (user.phone) types.push('phone');
    if (user.phone) types.push('whatsapp');

    // If no methods available, default to all
    return types.length > 0 ? types : ['email', 'phone', 'whatsapp'];
  };

  const switchVerificationType = (): void => {
    const availableTypes = getAvailableVerificationTypes();
    const currentIndex = availableTypes.indexOf(verificationType);
    const nextIndex = (currentIndex + 1) % availableTypes.length;
    const newType = availableTypes[nextIndex];

    setVerificationType(newType);
    setStatus('pending');
    setUserPin('');
  };

  const handleResend = (): void => {
    sendVerificationCode();
  };

  // Helper function to get the next verification type label
  const getNextVerificationType = (): string => {
    const availableTypes = getAvailableVerificationTypes();
    const currentIndex = availableTypes.indexOf(verificationType);
    const nextIndex = (currentIndex + 1) % availableTypes.length;
    const nextType = availableTypes[nextIndex];

    return nextType.charAt(0).toUpperCase() + nextType.slice(1);
  };

  // Check if switching is allowed and if there are multiple verification types available
  const canSwitchVerificationType = (): boolean => {
    return switchable && getAvailableVerificationTypes().length > 1;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-xs font-bold text-gray-800 mb-2">
          {verificationType.charAt(0).toUpperCase() + verificationType.slice(1)} Verification
        </h2>
        <p className="text-gray-600">
          Please enter the 4-digit verification code sent to{' '}
          {verificationType === 'email'
            ? user.email || 'your email'
            : verificationType === 'phone'
              ? user.phone || 'your phone'
              : user.phone || 'your WhatsApp'}
          .
        </p>
      </div>

      <div className="mb-6">
        <PinInput setPin={handlePinChange} />
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            status === 'verified'
              ? 'bg-green-100 text-green-800'
              : status === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <button
          onClick={sendVerificationCode}
          disabled={resendDisabled}
          className={`w-full py-2 px-4 font-medium rounded transition duration-200 ${
            resendDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {resendDisabled ? `Send Code (${countdown}s)` : 'Send Code'}
        </button>

        {canSwitchVerificationType() && (
          <button
            onClick={switchVerificationType}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded transition duration-200"
          >
            Switch to {getNextVerificationType()} Verification
          </button>
        )}

        {status !== 'verified' && (
          <button
            onClick={() => verifyCode(userPin, verificationCode)}
            disabled={userPin.length !== 4}
            className={`w-full py-2 px-4 font-medium rounded transition duration-200 ${
              userPin.length !== 4
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Verify Code
          </button>
        )}
      </div>
    </div>
  );
};

export default PinVerification;
