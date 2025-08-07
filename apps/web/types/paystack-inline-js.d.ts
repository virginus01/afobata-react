declare module '@paystack/inline-js' {
  interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference: string;
    label?: string;
    channels?: string[];
    metadata?: any;
    logo?: string;
    onSuccess: (response: any) => void;
    onCancel: () => void;
  }

  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void;
  }
}
