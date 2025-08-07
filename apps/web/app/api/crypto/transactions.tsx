import { fetchDataWithConditions, updateData, upsert } from '@/app/api/database/mongodb';
import { api_response } from '@/app/helpers/api_response';
import { getCryptoRate } from '@/app/helpers/getCryptoRate';
import { getSettlementData } from '@/app/helpers/getSettlementData';
import { invalid_response } from '@/app/helpers/invalid_response';
import { isNull } from '@/app/helpers/isNull';
import axios from 'axios';
import { get_site_info } from '@/api/brand/brand';
import { process_payment, settle_trades } from '@/app/api/wallet_and_payments';
import { transferCrypto } from '@/api/crypto/transfer';
import { BLOCKSTREAM_API_URL, mode } from '@/app/src/constants';
import { decrypt } from '@/app/helpers/decrypt';

// Helper function to describe confirmation status
export function getConfirmationStatus(confirmations: number): string {
  if (confirmations === 0) return 'unconfirmed';
  if (confirmations === 1) return 'pending';
  if (confirmations < 6) return 'partially';
  return 'confirmed';
}

export async function getWalletTrnx(
  wallet: WalletTypes,
): Promise<WalletTransactionResponse | null> {
  if (!wallet.address) {
    throw new Error('Invalid wallet address');
  }

  try {
    const blockInfoResponse = await axios.get(`${BLOCKSTREAM_API_URL}/blocks/tip/height`);
    const latestBlockHeight = blockInfoResponse.data;

    const response = await axios.get(`${BLOCKSTREAM_API_URL}/address/${wallet.address}/txs`);

    const transactions = response.data.map((tx: any) => {
      // Check if this wallet address is in the inputs (sending)
      const isWalletSpending = tx.vin.some(
        (input: any) => input.prevout?.scriptpubkey_address === wallet.address,
      );

      // Calculate exact amount received by this wallet address
      const receivedAmount = tx.vout.reduce((sum: number, output: any) => {
        if (output.scriptpubkey_address === wallet.address) {
          return sum + (output.value || 0);
        }
        return sum;
      }, 0);

      // Calculate amount spent from this wallet address
      const spentAmount = tx.vin.reduce((sum: number, input: any) => {
        if (input.prevout?.scriptpubkey_address === wallet.address) {
          return sum + (input.prevout.value || 0);
        }
        return sum;
      }, 0);

      let type: 'credit' | 'debit';
      let value: number;
      let fromAddress: string = '';
      let toAddress: string = '';
      let status: TransactionStatus = 'unconfirmed';

      if (isWalletSpending) {
        // This is an outgoing transaction (debit)
        type = 'debit';
        value = Math.abs(spentAmount - receivedAmount);

        // For debit, find the non-change output address
        toAddress =
          tx.vout.find(
            (output: any) =>
              output.scriptpubkey_address && output.scriptpubkey_address !== wallet.address,
          )?.scriptpubkey_address || 'Unknown';

        fromAddress = wallet.address!; // We are the sender
      } else {
        // This is an incoming transaction (credit)
        type = 'credit';
        value = receivedAmount;

        // For credit, find the sender's address from the inputs
        fromAddress = tx.vin[0]?.prevout?.scriptpubkey_address || 'Unknown';
        toAddress = wallet.address!; // We are the recipient
      }

      // Calculate confirmations
      const confirmations =
        tx.status.confirmed && tx.status.block_height
          ? Math.max(latestBlockHeight - tx.status.block_height + 1, 0)
          : 0;

      // Determine transaction status
      status = getConfirmationStatus(confirmations) as TransactionStatus;

      return {
        txid: tx.txid,
        status: {
          confirmed: tx.status.confirmed,
          block_height: tx.status.block_height,
          block_time: tx.status.block_time,
        },
        block_time: tx.status.block_time,
        value: value / 100000000, // Convert satoshis to BTC
        confirmations,
        confirmationStatus: status, // Added confirmation status
        type,
        fromAddress,
        toAddress,
        vout: tx.vout.map((output: any) => ({
          value: output.value || 0,
          scriptpubkey: output.scriptpubkey,
          address: output.scriptpubkey_address,
        })),
        vin: tx.vin.map((input: any) => ({
          value: input.prevout?.value || 0,
          scriptpubkey: input.prevout?.scriptpubkey || '',
          address: input.prevout?.scriptpubkey_address,
        })),
      };
    });

    return {
      address: wallet.address,
      transactions,
      latestBlockHeight,
    };
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return null;
  }
}

export async function query_crypto_wallet_addresses(context: any, address?: string) {
  const siteInfo = await get_site_info(context);

  const conditions: any = { identifier: 'btc' };

  if (address) {
    conditions.address = address;
  }

  const wallet_address = await fetchDataWithConditions('wallets', conditions);

  for (let wallet of wallet_address) {
    const walletTranx = await getWalletTrnx(wallet);

    await process_address_trnx(walletTranx?.transactions, siteInfo, walletTranx?.address!, wallet);
  }

  await settle_trades();

  return api_response({ status: true });
}

export async function process_address_trnx(
  data: any,
  siteInfo: BrandType,
  address: string,
  wallet: WalletTypes,
): Promise<{ status: boolean; error?: string }> {
  try {
    for (const trnx of data) {
      const conditions = {
        id: trnx.txid,
      };

      const [trnxs] = await fetchDataWithConditions('transactions', conditions);

      if (trnxs && ['confirmed', 'completed'].includes(trnxs.status)) {
        continue;
      } else if (trnx.type === 'credit' && trnx.toAddress === address) {
        if (trnx.confirmationStatus === 'confirmed') {
          const key = await decrypt(wallet.privateKey!);

          try {
            await transferCrypto({
              recipientAddress: 'tb1qelenlekyw74j88zsndwadrhu9urc2tsrmv82ag',
              amount: 0,
              privateKeyWIF: key!,
              fromAddress: wallet.address!,
            });
          } catch (e) {
            console.error('Error transferring crypto:', e);
            return { status: false, error: 'Error transferring crypto' };
          }
        }

        const [currency]: CurrencyType[] = await fetchDataWithConditions('currencies', {
          id: wallet.currency,
        });

        const [walletBrand]: BrandType[] = await fetchDataWithConditions('brands', {
          id: wallet.brandId,
        });

        const [fiatCurrency]: CurrencyType[] = await fetchDataWithConditions('currencies', {
          id: wallet.currency,
        });

        const [cur] = fiatCurrency.cryptos?.filter(
          (c: any) => `${c.id}`.toLowerCase() === 'btc',
        ) as CurrencyType[];

        const get_rate = await getCryptoRate({
          subBase: walletBrand.slug!,
          currency: 'btc',
          userCurrency: wallet.currency!,
        });

        const rate = get_rate['btc'];

        const exchangeRate = rate;
        const usdAmount = trnx.value * (cur?.baseValue || 0);
        const fiatAmount = usdAmount * exchangeRate;

        const walletBrandData: BrandType = get_rate.brand;
        const masterBrandData = walletBrandData.masterBrandData;
        const parentBrandData = walletBrandData.parentBrandData;

        const masterRate = masterBrandData?.crypto_rate || 0;
        const parentRate = parentBrandData?.crypto_rate || 0;
        const brandRate = walletBrandData.crypto_rate || 0;

        const settlementData = await getSettlementData(walletBrandData);

        const commissions = {
          masterCommission: masterRate * usdAmount,
          parentBrandCommission: parentRate * usdAmount,
          onwerRevenue: 0,
          brandCommission: brandRate * usdAmount,
          masterCommissionStatus: masterRate * usdAmount > 0 ? false : true,
          parentBrandCommissionStatus: parentRate * usdAmount > 0 ? false : true,
          onwerRevenueStatus: true,
          brandCommissionStatus: brandRate * usdAmount > 0 ? false : true,
        };

        const tData = {
          id: trnx.txid,
          userId: wallet.userId,
          walletId: wallet.id,
          address,
          referenceId: trnx.txid,
          trnxType: 'crypto',
          paymentGateway: 'paystack',
          usdAmount,
          fiatAmount,
          exchangeRate,
          settleCurrency: wallet.currency?.toUpperCase(),
          ...trnx,
          blockStatus: trnx.status,
          status: trnx.confirmationStatus,
          ...commissions,
          ...(settlementData as any),
        };

        const sendData = await upsert(tData, 'transactions', true, siteInfo);
      } else {
        console.info('debit transaction');
      }
    }

    return { status: true };
  } catch (error) {
    console.error('Error in process crypto transaction:', error);
    return { status: false, error: 'Error in process crypto transaction' };
  }
}

export async function settle_transactions(type?: string) {
  try {
    let conditions: any = {
      $and: [{ confirmationStatus: 'confirmed' }, { status: { $ne: 'completed' } }],
    };

    if (type) {
      conditions.type = type;
    }

    const transactions = await fetchDataWithConditions('transactions', conditions);

    for (const trnx of transactions) {
      await settleTrnx(trnx);
    }

    return api_response({ status: true, success: true, data: {} });
  } catch (error) {
    console.error(error);
    return invalid_response('error setling order', 200);
  }
}

export async function settleTrnx(trnx: TransactionsModel): Promise<boolean> {
  try {
    // Check if order is null
    if (isNull(trnx)) {
      console.warn('Transaction is null');
      return false;
    }
    // Ensuring order status is "processed"
    if (trnx.confirmationStatus !== 'confirmed') {
      console.warn(`transaction status is ${trnx.status}, not "confirmed"`);
      return false;
    }

    const brandSettleStatus = await settleBrand(trnx);

    const parentBrandSettleStatus = await settleParentBrand(trnx);

    const masterSettleStatus = await settleMasterBrand(trnx);

    return true;
  } catch (error) {
    console.error(`Error settling order ${trnx.id}:`, error);
    return false;
  }
}

async function settleBrand(trnx: TransactionsModel) {
  if (trnx.brandCommission && trnx.brandCommission > 0 && !trnx.brandCommissionStatus) {
    const updateResult = await updateData({
      data: { brandCommissionStatus: true },
      table: 'transactions',
      id: trnx.id!,
    });

    if (!updateResult) {
      console.error(`Failed to update brand commission status for order ${trnx.id}`);
      return false;
    }

    // Settle order commissions and revenue
    const settlementResult = await settleOrderCommissionsAndRevenue(trnx, 'brandCommission');

    if (!settlementResult) {
      console.error(`Failed to settle commission and revenue for order ${trnx.id}`);
      return false;
    }
    return settlementResult.status;
  }
  return false;
}

async function settleParentBrand(trnx: TransactionsModel) {
  if (
    trnx.parentBrandCommission &&
    trnx.parentBrandCommission > 0 &&
    !trnx.parentBrandCommissionStatus
  ) {
    const updateResult = await updateData({
      data: { parentBrandCommissionStatus: true },
      table: 'transactions',
      id: trnx.id!,
    });

    if (!updateResult) {
      console.error(`Failed to update brand commission status for order ${trnx.id}`);
      return false;
    }

    const settlementResult = await settleOrderCommissionsAndRevenue(trnx, 'parentBrandCommission');

    if (!settlementResult) {
      console.error(`Failed to settle commission and revenue for order ${trnx.id}`);
      return false;
    }
    return settlementResult.status;
  }
  return false;
}

async function settleMasterBrand(order: TransactionsModel) {
  if (order.masterCommission && order.masterCommission > 0 && !order.masterCommissionStatus) {
    const updateResult = await updateData({
      data: { masterCommissionStatus: true },
      table: 'transactions',
      id: order.id!,
    });

    if (!updateResult) {
      console.error(`Failed to update brand commission status for order ${order.id}`);
      return false;
    }

    // Settle order commissions and revenue
    const settlementResult = await settleOrderCommissionsAndRevenue(order, 'masterCommission');

    if (!settlementResult) {
      console.error(`Failed to settle commission and revenue for order ${order.id}`);
      return false;
    }
    return settlementResult.status;
  }
  return false;
}

export async function settleOrderCommissionsAndRevenue(
  trnx: TransactionsModel,
  type: 'masterCommission' | 'parentBrandCommission' | 'brandCommission' | 'onwerRevenue',
) {
  try {
    if (!isNull(trnx)) {
      if (trnx.confirmationStatus === 'confirmed') {
        switch (type) {
          case 'brandCommission':
            if (trnx.brandCommissionStatus === false) {
              const resP = await process_payment({
                name: trnx.orderBrandDetails?.accountName,
                walletId: trnx.orderBrandDetails?.ownerWalletId!,
                referenceId: trnx.referenceId!,
                amount: trnx.brandCommission || 0,
                userId: trnx.orderBrandDetails?.ownerId!,
                status: 'pending',
                gateway: 'wallet',
                trnxType: 'commission',
                type: 'credit',
                returnOnFail: true,
              });

              return { status: resP.credited };
            }
          case 'parentBrandCommission':
            if (trnx.parentBrandCommissionStatus === false) {
              const resP = await process_payment({
                name: 'no name',
                walletId: trnx.parentBrandDetails?.ownerWalletId!,
                referenceId: trnx.referenceId!,
                amount: trnx.parentBrandCommission || 0,
                userId: trnx.parentBrandDetails?.ownerId!,
                status: 'pending',
                gateway: 'wallet',
                trnxType: 'commission',
                type: 'credit',
                returnOnFail: true,
              });
              return { status: resP.credited };
            }
          case 'masterCommission':
            if (trnx.masterCommissionStatus === false) {
              const resP = await process_payment({
                name: 'no name',
                walletId: trnx.masterBrandDetails?.ownerWalletId!,
                referenceId: trnx.referenceId!,
                amount: trnx.masterCommission || 0,
                userId: trnx.masterBrandDetails?.ownerId!,
                status: 'pending',
                gateway: 'wallet',
                trnxType: 'commission',
                type: 'credit',
                returnOnFail: true,
              });
              return { status: resP.credited };
            }

          default:
            return { status: false };
        }
      }
    } else {
      return { status: false };
    }
  } catch (error) {
    console.error(error);
    return { status: false };
  }
}
