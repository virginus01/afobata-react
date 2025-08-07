'use client';

import { Dialog } from '@headlessui/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ModalProps {
  isOpen: boolean;
  data: CheckOutDataType;
  onClose: () => void;
  onCompleted: (response: any, data: CheckOutDataType) => void;
  charge?: boolean;
  siteInfo: BrandType;
  channels?: string[];
}

const usePaystack = ({
  isOpen,
  data,
  charge = true,
  onClose,
  onCompleted,
  siteInfo,
  channels = ['bank_transfer'],
}: ModalProps) => {
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);

  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const initiatePayment = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!data || !data.email || !data.subTotal || !data.referenceId) {
      toast.error('Missing required payment data. Please try again.');
      return;
    }

    if (!paystackKey) {
      toast.error('Payment configuration error. Contact support.');
      return;
    }

    try {
      let amount = data.subTotal;

      if (charge) {
        amount = calculatePaystackCharge(data.subTotal);
      }

      if (amount <= 0) {
        toast.error('Invalid payment amount.');
        return;
      }

      setPaymentInitiated(true);

      // ✅ Dynamically import the PaystackPop class
      const { default: PaystackPop } = await import('@paystack/inline-js');
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: paystackKey,
        email: data.email,
        amount: Math.round(amount * 100),
        currency: data.currency || 'NGN',
        reference: data.referenceId,
        label: siteInfo?.name || 'Payment',
        channels,
        metadata: {
          custom_fields: [
            {
              display_name: siteInfo?.name || 'Business',
              variable_name: 'Business Name',
              value: siteInfo?.name || 'Business',
            },
          ],
        },
        logo: siteInfo?.logo?.publicUrl,

        onSuccess: (response: any) => {
          try {
            onCompleted(response, data);
          } catch (error) {
            toast.error('Payment callback failed. Please contact support.');
            console.error('Payment callback error:', error);
          }
        },

        onCancel: () => {
          try {
            onClose();
          } catch (error) {
            console.error('Payment close callback error:', error);
          }
        },
      });
    } catch (error) {
      toast.error('Failed to initialize payment. Please try again.');
      setPaymentInitiated(false);
      console.error('Payment initialization error:', error);
    }
  }, [data, onCompleted, onClose, charge, paystackKey, siteInfo, channels]);

  useEffect(() => {
    if (isOpen && !paymentInitiated && !scriptError) {
      const timer = setTimeout(() => {
        initiatePayment();
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, paymentInitiated, initiatePayment, scriptError]);

  useEffect(() => {
    if (!isOpen) {
      setPaymentInitiated(false);
      setLoading(true);
      setScriptError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (scriptError) {
    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 2-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4 relative z-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment System Unavailable</h3>
            <p className="text-sm text-gray-500 mb-6">
              Unable to load the payment system. This might be due to:
            </p>
            <ul className="text-xs text-gray-600 text-left mb-6 space-y-1">
              <li>• Network restrictions or offline mode</li>
              <li>• Ad blockers or content filters</li>
              <li>• Incompatible browser settings</li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setScriptError(false);
                  setPaymentInitiated(false);
                  setLoading(true);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry Payment
              </button>
              <button
                onClick={() => {
                  const amount = charge
                    ? calculatePaystackCharge(data?.subTotal ?? 0)
                    : (data?.subTotal ?? 0);
                  const paymentUrl = `https://checkout.paystack.com/v2/?amount=${Math.round(amount * 100)}&email=${encodeURIComponent(data.email)}&reference=${data.referenceId}&key=${paystackKey}`;
                  window.open(paymentUrl, '_blank');
                  onClose();
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Pay via Browser
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 2-50 flex items-center justify-center p-4"
    >
      {loading && (
        <div className="bg-white rounded-lg p-6 shadow-xl relative z-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-700">Loading payment...</span>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default usePaystack;

function calculatePaystackCharge(amount: number): number {
  const percentageFee = 0.015;
  const flatFee = 100;
  const maxFee = 2000;

  let charge = amount * percentageFee;

  if (amount > 2500) {
    charge += flatFee;
  }

  charge = Math.min(charge, maxFee);

  return charge + amount;
}
