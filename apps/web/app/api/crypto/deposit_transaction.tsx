import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

import { query_crypto_wallet_addresses } from '@/api/crypto/transactions';

export async function blockcypher_trnx_webhook({ data }: { data: any }) {
  try {
    const {
      id,
      jsonrpc,
      method,
      params: {
        network,
        event: { type, address, transactions },
      },
    } = data;

    const consolidatedData = {
      id,
      jsonrpc,
      method,
      network,
      eventType: type,
      monitoredAddress: address,
      transactions: transactions.map((tx: any) => ({
        txHash: tx.txHash,
        blockHash: tx.blockHash,
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: tx.timestamp,
        fee: tx.fee,
      })),
    };

    return query_crypto_wallet_addresses({}, address);
  } catch (error) {
    console.error('deposit transaction webhook error', error);
    return invalid_response('error setting deposit webhook');
  }
}
