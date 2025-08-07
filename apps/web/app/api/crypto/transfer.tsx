import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";
import { BLOCKSTREAM_API_URL, mode } from "@/app/src/constants";

const ECPair = ECPairFactory(ecc);
const DUST_LIMIT = 546; // Bitcoin dust limit in satoshis
const SATS_PER_BTC = 100000000;

interface TransferParams {
  recipientAddress: string;
  amount: number;
  privateKeyWIF: string;
  fromAddress: string;
}

interface TransferSuccess {
  success: true;
  txHash: string;
  amount: number;
  recipientAddress: string;
  fee: number;
}

interface TransferError {
  success: false;
  error: string;
  details?: any;
}

type TransferResult = TransferSuccess | TransferError;

export async function transferCrypto({
  recipientAddress,
  amount,
  privateKeyWIF,
  fromAddress,
}: TransferParams): Promise<TransferResult> {
  try {
    // Input validation
    if (!recipientAddress?.trim()) {
      return { success: false, error: "Invalid recipient address" };
    }
    if (!amount && amount !== 0) {
      return { success: false, error: "Invalid amount" };
    }
    if (!privateKeyWIF?.trim()) {
      return { success: false, error: "Invalid private key" };
    }

    // Initialize key pair and verify address
    let keyPair: any;
    try {
      keyPair = ECPair.fromWIF(
        privateKeyWIF,
        mode === "test" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
      );
    } catch (e) {
      return { success: false, error: "Invalid private key format" };
    }

    // Verify sender address
    const { address: senderAddress } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network:
        mode === "test" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin,
    });

    if (fromAddress !== senderAddress) {
      return {
        success: false,
        error: "Address mismatch",
        details: "The provided from address doesn't match the private key",
      };
    }

    // Fetch UTXOs
    const utxoResponse = await fetch(
      `${BLOCKSTREAM_API_URL}/address/${senderAddress}/utxo`
    );

    if (!utxoResponse.ok) {
      return {
        success: false,
        error: "UTXO fetch failed",
        details: await utxoResponse.text(),
      };
    }

    const utxoData = await utxoResponse.json();

    if (!utxoData || utxoData.length === 0) {
      return {
        success: false,
        error: "No unspent outputs",
        details: "The wallet has no available funds",
      };
    }

    // Calculate total available amount
    const totalAmount = utxoData.reduce(
      (sum: number, utxo: any) => sum + utxo.value,
      0
    );

    // If amount is 0, set amount to the total available funds minus fee
    const emptyWallet = amount === 0;
    const estimatedFee = calculateFee(utxoData.length, 1); // only one output (no change)
    const amountSats = emptyWallet
      ? totalAmount - estimatedFee
      : Math.floor(amount * SATS_PER_BTC);

    // Check if we have enough funds
    if (totalAmount < amountSats + estimatedFee) {
      return {
        success: false,
        error: "Insufficient funds",
        details: {
          required: (amountSats + estimatedFee) / SATS_PER_BTC,
          available: totalAmount / SATS_PER_BTC,
          fee: estimatedFee / SATS_PER_BTC,
        },
      };
    }

    // Create and initialize transaction
    const psbt = new bitcoin.Psbt({
      network:
        mode === "test" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin,
    });

    // Add inputs
    for (const utxo of utxoData) {
      const witnessScript = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network:
          mode === "test" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin,
      }).output;

      if (!witnessScript) {
        throw new Error("Failed to generate witness script");
      }

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Uint8Array.from(witnessScript),
          value: BigInt(utxo.value),
        },
      });
    }

    // Add recipient output
    psbt.addOutput({
      address: recipientAddress,
      value: BigInt(amountSats),
    });

    // Add change output if needed
    const changeAmount = totalAmount - amountSats - estimatedFee;
    if (changeAmount > DUST_LIMIT) {
      psbt.addOutput({
        address: senderAddress,
        value: BigInt(changeAmount),
      });
    }

    // Sign all inputs
    utxoData.forEach((_: any, index: number) => {
      psbt.signInput(index, keyPair);
    });

    // Finalize and extract transaction
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    const rawTx = tx.toHex();

    const broadcastResponse = await fetch(`${BLOCKSTREAM_API_URL}/tx`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: rawTx,
    });

    if (!broadcastResponse.ok) {
      const errorText = await broadcastResponse.text();
      return {
        success: false,
        error: "Broadcast failed",
        details: errorText,
      };
    }

    const txid = await broadcastResponse.text();

    return {
      success: true,
      txHash: txid,
      amount: amount,
      recipientAddress: recipientAddress,
      fee: estimatedFee / SATS_PER_BTC,
    };
  } catch (error: any) {
    console.error("Transaction error:", error);
    return {
      success: false,
      error: "Transaction failed",
      details: error.message,
    };
  }
}

// Helper function to calculate fee based on transaction size
function calculateFee(inputCount: number, outputCount: number): number {
  // Approximate size calculation:
  // Base tx: 10 bytes
  // Each input: ~68 bytes for p2wpkh
  // Each output: ~31 bytes
  // Some buffer for variance
  const estimatedSize = 10 + inputCount * 68 + outputCount * 31 + 10;
  const satoshisPerByte = 2; // 2 sat/byte fee rate
  return estimatedSize * satoshisPerByte;
}

export async function getWalletBalanceAndFee({
  address,
  feeRate = 10, // default fee rate in sats/byte
}: {
  address: string;
  feeRate?: number;
}) {
  try {
    if (!address) {
      return { error: "Address is required" };
    }

    // Fetch UTXO data for the given address
    const utxoResponse = await fetch(
      `${BLOCKSTREAM_API_URL}/address/${address}/utxo`
    );

    if (!utxoResponse.ok) {
      throw new Error("Failed to fetch UTXOs");
    }

    const utxoData = await utxoResponse.json();

    if (!utxoData || utxoData.length === 0) {
      return { balance: 0, estimatedFee: 0, netBalance: 0 };
    }

    // Calculate total balance from UTXOs
    const totalBalance = utxoData.reduce(
      (sum: number, utxo: any) => sum + utxo.value,
      0
    );

    // Estimate the transaction fee
    // Inputs size is roughly 68 bytes per P2WPKH input, and output size is roughly 31 bytes per output
    const inputCount = utxoData.length;
    const outputCount = 2; // 1 for recipient, 1 for change
    const txSize = inputCount * 68 + outputCount * 31 + 10; // rough size in bytes
    const estimatedFee = txSize * feeRate; // fee in sats

    // Calculate the net balance (balance after estimated fee)
    const netBalance = totalBalance - estimatedFee;

    return {
      balance: totalBalance / 100000000, // convert to BTC
      estimatedFee: estimatedFee / 100000000, // convert to BTC
      netBalance: netBalance / 100000000, // convert to BTC
    };
  } catch (error: any) {
    console.error("Error fetching balance and fee:", error);
    return { error: error.message || "Failed to get balance and fee" };
  }
}
