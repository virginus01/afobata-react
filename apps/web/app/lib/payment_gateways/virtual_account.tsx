import { Dialog } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ModalProps {
  isOpen: boolean;
  data: CheckOutDataType;
  onClose: () => void;
  onCompleted: (response: any, data: CheckOutDataType) => void;
  charge?: boolean;
}

// Declare FlutterwaveCheckout globally
declare global {
  interface Window {
    FlutterwaveCheckout?: any;
  }
}

const useVirtualAccount = ({ isOpen, data, charge = true, onClose, onCompleted }: ModalProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [flutterwaveKey, setFlutterwaveKey] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch Flutterwave public key from API
  const fetchApiKey = useCallback(async () => {
    try {
      setLoading(true);

      setFlutterwaveKey(process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "");
    } catch (error) {
      console.error("Error fetching Flutterwave key:", error);
      toast.error("Error fetching Flutterwave key");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load script when modal opens
  useEffect(() => {
    if (isOpen) fetchApiKey();
  }, [isOpen, fetchApiKey]);

  useEffect(() => {
    if (flutterwaveKey && !isScriptLoaded) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      script.onload = () => {
        setTimeout(() => setIsScriptLoaded(true), 500); // Delay ensures script is fully available
      };
      script.onerror = () => {
        console.error("Failed to load Flutterwave script");
        toast.error("Failed to load payment processor. Please refresh the page.");
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [flutterwaveKey, isScriptLoaded]);

  const calculateFlutterwaveCharge = (
    amount: number,
    transactionType: "card" | "wallet" | "nqr" | "international"
  ): number => {
    let charge = 0;

    switch (transactionType) {
      case "card":
      case "wallet":
        charge = amount * 0.014; // 1.4% for local card and ACH transactions
        break;
      case "nqr":
        if (amount < 250) charge = 0.5;
        else if (amount < 1000) charge = 1;
        else if (amount < 5000) charge = 5;
        else charge = 25;
        break;
      case "international":
        charge = amount * 0.038;
        charge = Math.min(charge, 2500); // Cap at 2500 for international
        break;
      default:
        throw new Error("Invalid transaction type");
    }

    return charge + amount;
  };

  const initiatePayment = useCallback(() => {
    if (!flutterwaveKey) {
      console.error("Flutterwave public key is missing");
      toast.error("Payment processor not initialized properly");
      return;
    }

    let amount = data.subTotal;
    if (charge) {
      amount = calculateFlutterwaveCharge(
        data.subTotal!,
        data.currency !== "NGN" ? "international" : "card" // Fixed incorrect "nqr" default
      );
    }

    setPaymentInitiated(true);

    if (window?.FlutterwaveCheckout) {
      const handler = window.FlutterwaveCheckout({
        public_key: flutterwaveKey,
        tx_ref: data.referenceId,
        amount: Math.round(parseInt(String(amount))),
        currency: data.currency,
        payment_options: "card, mobilemoney, ussd",
        customer: {
          email: data.email,
          phonenumber: "",
          name: "",
        },
        callback: (response: any) => onCompleted(response, data),
        onclose: () => onClose(),
        customizations: {
          title: "Payment",
          description: "Complete your transaction",
        },
      });

      if (handler && typeof handler.openIframe === "function") {
        handler.openIframe();
      } else {
        console.error("Handler is not correctly defined or openIframe method is missing");
        toast.error("Payment handler setup failed. Please try again.");
      }
    } else {
      console.error("FlutterwaveCheckout is not defined");
      toast.error("Failed to load payment processor. Please try again.");
    }
  }, [flutterwaveKey, data, onCompleted, onClose, charge]);

  useEffect(() => {
    if (isScriptLoaded && !paymentInitiated && flutterwaveKey) {
      initiatePayment();
    }
  }, [isScriptLoaded, paymentInitiated, flutterwaveKey, initiatePayment]);

  useEffect(() => {
    if (!isOpen) {
      setIsScriptLoaded(false);
      setPaymentInitiated(false);
      setFlutterwaveKey("");
      setLoading(true);
    }
  }, [isOpen]);

  if (!flutterwaveKey && !loading) {
    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-10 flex items-center justify-center p-4"
      >
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
        <div className="bg-white dark:bg-gray-800 p-4 rounded">
          Error: Unable to load Flutterwave key
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      {/* Modal content */}
    </Dialog>
  );
};

export default useVirtualAccount;
