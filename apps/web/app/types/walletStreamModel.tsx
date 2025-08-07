type TransactionStatus = "unconfirmed" | "pending" | "partially" | "confirmed";

interface WalletTransactionResponse {
  address: string;
  transactions: {
    txid: string;
    status: {
      confirmed: boolean;
      block_height?: number;
      block_time?: number;
    };
    block_time?: number;
    value: number;
    confirmations: number;
    confirmationStatus: TransactionStatus; // Added field
    type: "credit" | "debit";
    fromAddress: string;
    toAddress: string;
    vout: {
      value: number;
      scriptpubkey: string;
      address?: string;
    }[];
    vin: {
      value: number;
      scriptpubkey: string;
      address?: string;
    }[];
  }[];
  latestBlockHeight?: number;
}
