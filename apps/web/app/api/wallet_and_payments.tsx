import { BigNumber } from 'bignumber.js';
import {
  bulkUpsert,
  fetchDataWithConditions,
  fetchPaginatedData,
  lockAndUnlockTable,
  updateData,
  updateDataWithConditions,
  upsert,
} from '@/app/api/database/mongodb';
import {
  assignDedicatedAccount,
  checkDedicatedAccountStatus,
  createTransferRecipient,
  initiatePaystckTransfer,
  queryPaystack,
  verifyPaystackTransfer,
} from '@/app/api/paystack';

import { get_site_info, getBrandInfo } from '@/api/brand/brand';
import { queryFlutterwave } from '@/api/flutterwave';
import { activeSps } from '@/src/constants';
import { getCurrentUser } from '@/api/user';
import { Data } from '@/app/models/Data';
import { isNull } from '@/helpers/isNull';
import { api_response } from '@/helpers/api_response';
import { convertDateTime } from '@/helpers/convertDateTime';
import { randomNumber } from '@/helpers/randomNumber';
import { invalid_response } from '@/helpers/invalid_response';
import { addToCurrentDate } from '@/helpers/addToCurrentDate';
import { lowercase } from '@/helpers/lowercase';
import { findMissingFields } from '@/helpers/findMissingFields';
import { beforeUpdate } from '@/helpers/beforeUpdate';
import { convertCur } from '@/helpers/convertCur';
import { calculateWithdrawalCharges } from '@/helpers/calculateWithdrawalCharges';
import { getAuthSessionData } from '@/app/controller/auth_controller';

// Query payments with a reference ID or default conditions
export async function query_payment({ ref, context }: { ref?: string; context?: any }) {
  try {
    const siteInfo = await get_site_info(context);
    let conditions: any = {
      status: 'pending',
      trnxType: {
        $nin: ['withdrawal', 'payout'],
      },
    };

    if (ref) {
      conditions.referenceId = ref;
    }

    const payments = await fetchDataWithConditions('payments', conditions);

    for (let payment of payments) {
      if (payment.status === 'pending') {
        const payment_query = await paymentQuery(payment, siteInfo);
      }
    }

    await fullFillWalletFunding(ref);

    return api_response({ status: true });
  } catch (error) {
    console.error('Error querying payments:', error);
    return api_response({
      status: false,
      msg: 'Error querying payments',
      error,
    });
  }
}

export async function paymentQuery(payment: PaymentType, siteInfo: BrandType) {
  if (payment.gateway === 'paystack') {
    return await query_paystack(payment, siteInfo);
  }
  if (payment.gateway === 'flutterwave') {
    return await query_flutterwave(payment, siteInfo);
  }
}

// Query Paystack payment status and update payment record accordingly
export async function query_paystack(payment: PaymentType, siteInfo: BrandType) {
  try {
    const response = await queryPaystack(payment.referenceId ?? '');

    if (response.status && response.data) {
      await updatePayment(payment, response, siteInfo);
    }

    return {
      status: response?.data?.status === 'success' ? true : false,
      msg: response?.data?.status === 'success' ? 'Payment received' : 'Payment not yet received',
    };
  } catch (error) {
    console.error('Error querying Paystack:', error);
    return {
      status: false,
      msg: 'Error with your payment, contact us!',
    };
  }
}

export async function query_flutterwave(payment: PaymentType, siteInfo: BrandType) {
  try {
    const response = await queryFlutterwave(payment.referenceId ?? '');

    if (response.status && response.data) {
      await updatePayment(payment, response, siteInfo);
    }

    return {
      status: response.data?.status === 'success' ? true : false,
      msg: response.data?.status === 'success' ? 'Payment received' : 'Payment not yet received',
    };
  } catch (error) {
    console.error('Error querying Paystack:', error);
    return {
      status: false,
      msg: 'Error with your payment, contact us!',
    };
  }
}

// Update payment status based on Paystack response
export async function updatePayment(payment: any, response: any, siteInfo: BrandType) {
  if (['ongoing', 'pending', 'processing', 'queued'].includes(response?.data?.status)) return false;

  if (payment.status === 'pending') {
    let status = payment.status;

    if (['success', 'successful'].includes(response?.data?.status)) {
      status = 'paid';
    } else {
      status = response?.data?.status;
    }

    if (status === payment.status) return false;

    const res = await updateDataWithConditions({
      collectionName: 'payments',
      conditions: { id: payment.id },
      updateFields: { id: payment.id, others: response.data, status },
    });

    const relatedOrders = await fetchDataWithConditions('orders', {
      referenceId: payment.referenceId,
    });

    for (let order of relatedOrders) {
      if (order.status === 'pending') {
        updateDataWithConditions({
          collectionName: 'orders',
          conditions: { status: 'pending', id: order.id, referenceId: payment.referenceId },
          updateFields: {
            id: order.id,
            status: status === 'paid' ? 'paid' : 'abandoned',
          },
        });
      }
    }

    return res.status;
  }

  return false;
}

// Fulfill wallet funding based on payment status
export async function fullFillWalletFunding(ref?: string) {
  const conditions: any = {
    $and: [
      { status: 'paid' },
      { trnxType: 'funding' },
      {
        $or: [{ fulfilled: false }, { fulfilled: { $exists: false } }],
      },
      { processing: { $ne: true } },
    ],
  };

  if (ref) {
    conditions.$and.push({ referenceId: ref });
  }

  const payments = await fetchDataWithConditions('payments', conditions);

  if (payments && payments.length > 0) {
    for (const payment of payments) {
      const res = await lockAndUnlockTable({
        table: 'payments',
        id: payment.id,
        action: 'lock',
      });

      if (res.status) {
        const pros = await process_payment({
          id: payment.id,
          type: 'credit',
          currency: payment.currency,
          trnxType: payment.trnxType,
          gateway: payment.gateway,
          amount: payment.amount,
          walletId: payment.walletId!,
          referenceId: payment.referenceId!,
          userId: payment.userId!,
          returnOnFail: true,
        } as any);
        if (pros.credited) {
          await updateData({
            data: {
              status: 'completed',
              processing: false,
              fulfilled: true,
              fulfilledAt: convertDateTime(),
            },
            table: 'payments',
            id: payment.id,
          });
        } else {
          console.error(pros.msg);
          await updateData({
            data: { msg: pros.msg, proccessing: false },
            table: 'payments',
            id: payment.id,
          });
        }
      } else {
        console.error('Error locking payment for processing:', payment.id);
      }
    }
  }

  return true;
}

type WalletAction = 'debit' | 'credit';

export async function debitAndCredit({
  action,
  amount,
  id,
  currency,
  shareRate = 0,
  userId,
}: {
  action: WalletAction;
  amount: number;
  id: string;
  currency: string;
  shareRate?: number;
  userId: string;
}): Promise<{ status: boolean; updatedValue: number; msg: string }> {
  if (!currency) {
    console.error('Invalid currency');
    return {
      msg: 'Invalid currency',
      status: false,
      updatedValue: 0,
    };
  }

  if (!amount || !id || !['debit', 'credit'].includes(action)) {
    console.error('Invalid input parameters');
    return {
      msg: 'Invalid input parameters',
      status: false,
      updatedValue: 0,
    };
  }

  try {
    const siteInfo = await getBrandInfo();

    let wallet: WalletTypes = {};

    const [user]: UserTypes[] = await fetchDataWithConditions('users', {
      id: userId,
    });
    0;
    if (!isNull(user) && !isNull(user.wallet) && user?.wallet?.id === id) {
      wallet = user.wallet ?? {};
    } else {
      console.error('User Wallet not found');
      return {
        msg: 'User Wallet not found',
        status: false,
        updatedValue: 0,
      };
    }

    if (wallet.currency?.toLowerCase() !== currency.toLowerCase()) {
      console.error('Incompatible currency');
      return {
        msg: 'Incompatible currency',
        status: false,
        updatedValue: 0,
      };
    }

    const updateAmount = new BigNumber(amount);
    const currentBalance = new BigNumber(wallet.value || 0);
    const currentShareValue = new BigNumber(wallet.shareValue || 0);

    if (updateAmount.isLessThanOrEqualTo(0)) {
      console.error('Invalid amount');
      return {
        msg: 'Invalid amount',
        status: false,
        updatedValue: 0,
      };
    }

    let updatedValue: BigNumber;
    let shareValue = new BigNumber(0);

    if (action === 'credit') {
      // Credit calculation
      shareValue = new BigNumber(shareRate / 100).multipliedBy(amount);
      updatedValue = currentBalance.plus(updateAmount).minus(shareValue);
      shareValue = currentShareValue.plus(shareValue);
    } else {
      // Debit calculation
      if (updateAmount.isGreaterThan(currentBalance)) {
        console.error('Insufficient funds');
        return {
          msg: 'Insufficient funds',
          status: false,
          updatedValue: 0,
        };
      }
      updatedValue = currentBalance.minus(updateAmount);
    }

    //...wallet,
    const updatedWallet = {
      ...wallet,
      value: updatedValue.toNumber(),
      shareValue: shareValue.toNumber(),
    };

    const result = await updateData({
      data: { wallet: { ...updatedWallet } },
      table: 'users',
      id,
      siteInfo,
    });

    return {
      msg: result.status ? 'success' : 'error on wallet operation',
      status: result.status,
      updatedValue: updatedValue.toNumber(),
    };
  } catch (error) {
    console.error(`Error in ${action} wallet:`, error);
    return {
      msg: 'Error, please contact us',
      status: false,
      updatedValue: 0,
    };
  }
}
export async function server_create_payment(formData: PaymentType | any) {
  try {
    const res = await process_payment({
      ...formData,
      bankPaymentInfo: formData.bankPaymentInfo,
      type: formData.trnxType === 'withdrawal' ? 'debit' : 'none',
      status: 'pending',
      id: randomNumber(),
    } as any);

    await settlePayoutsAndWithdrawals();

    if (res.inserted) {
      return api_response({
        msg: 'Payment proccessed successfully',
        code: 'success',
        success: true,
      });
    } else {
      return api_response({
        msg: res.msg,
        code: 'error',
        success: false,
      });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return api_response({
      status: false,
      msg: 'Error creating payment',
      error,
    });
  }
}

export async function create_va(formData?: any) {
  try {
    const user: UserTypes = formData?.user;

    if (isNull(user)) {
      return invalid_response('user data missing', 200);
    }

    const siteInfo = await getBrandInfo();

    const fullName = user?.auth?.name || '';
    const words = fullName.trim().split(' ');

    const lastName = words[0] || '';
    const firstName = words[words.length - 1] || '';

    const result = await generateVirtualAccount({
      userId: user?.id ?? '',
      email: user?.email ?? '',
      country: user?.country ?? '',
      first_name: firstName,
      last_name: lastName,
      account_number: formData?.accountNumber ?? '',
      bvn: formData.bvn,
      bank_code: formData.bankCode,
      expireAt: convertDateTime(addToCurrentDate({ years: 100 })) as any,
      siteInfo,
      sp: 'paystack',
      wallet: formData?.walletId ?? '',
    });

    return api_response({ data: result, status: result.status });
  } catch (error) {
    console.error('Error creating virtual account:', error);
    return api_response({
      status: false,
      msg: 'Error creating virtual account',
      error,
    });
  }
}

export async function server_get_payments({
  user_id,
  status,
  limit = '1000',
  page = '1',
  type,
}: {
  user_id: any;
  status: string;
  limit?: string;
  page?: string;
  type?: string;
}) {
  try {
    let conditions: any = {
      $or: [{ brandId: user_id }, { userId: user_id }],
    };

    if (status) {
      conditions.status = status;
    }

    if (!isNull(type)) {
      conditions.$or = [{ type: type }, { trnxType: type }];
    }

    let res = await fetchPaginatedData({
      collectionName: 'payments',
      conditions,
      limit,
      page,
    });

    let response: any = {};

    if (res.data.length > 0) {
      response.msg = 'user payments fetched';
      response.code = 'success';
      response.success = true;
      response.data = res.data;
      response.meta = res.meta;
    } else {
      response.msg = 'payments not fetched';
      response.code = 'error';
      response.success = false;
    }

    return api_response(response);
  } catch (error) {
    return api_response({});
  }
}

export async function update_exchange_rates() {
  try {
    const EXCHANGE_RATE_API = process.env.EXCHANGE_RATE_API;

    const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${EXCHANGE_RATE_API}`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('not able to reach api.exchangeratesapi.io');
      return invalid_response('not able to reach exchange api', 200);
    }

    const res = await response.json();

    const currencies = await fetchDataWithConditions('currencies', {});

    const newCurrencies = [];

    if (res && currencies) {
      for (const currency of currencies) {
        delete currency.createdAt;
        delete currency.updatedAt;

        if (currency.type === 'crypto') {
          const rate = await crypto_to_fiat_rate(currency.currencyCode, 'NGN');
          newCurrencies.push({
            ...currency,
            baseCurrency: 'NGN',
            exchangeRate: rate.rate,
          });
        } else if (res.rates.hasOwnProperty(currency.currencyCode)) {
          newCurrencies.push({
            ...currency,
            baseCurrency: 'EUR',
            exchangeRate: res.rates[currency.currencyCode],
          });
        }
      }
    }

    if (newCurrencies && newCurrencies.length > 1) {
      await bulkUpsert(newCurrencies, 'currencies', true);
    }
    return api_response({
      success: true,
      status: true,
      data: `${newCurrencies.length} currencies updated out of ${currencies.length}`,
    });
  } catch (error) {
    return invalid_response('erorr with exchange rate api');
  }
}

export async function settle_payouts(type?: string) {
  try {
    await verifyPayoutsAndWithdrawals();
    await settlePayoutsAndWithdrawals();
    await verifyPayoutsAndWithdrawals();
    return api_response({ success: true, status: true });
  } catch (error) {
    console.error(error);
    return invalid_response('error paying out');
  }
}

export async function settle_trades(type?: string) {
  try {
    await initiateTradePayouts();
    await verifyPayoutsAndWithdrawals();
    return api_response({ success: true, status: true });
  } catch (error) {
    console.error(error);
    return invalid_response('error paying out');
  }
}

export async function initiateTradePayouts() {
  try {
    const conditions = {
      $and: [
        {
          $or: [{ status: 'confirmed' }],
        },
        {
          $or: [{ trnxType: 'crypto' }],
        },
        {
          $or: [{ settled: { $ne: true } }, { settled: { $exists: false } }],
        },
      ],
    };

    const response = await fetchDataWithConditions('transactions', conditions);

    for (const trnx of response) {
      let transferId = '';
      let gateway = trnx.paymentGateway;

      const [user]: UserTypes[] = await fetchDataWithConditions('users', {
        id: trnx.userId,
      });

      if (trnx.paymentGateway === 'paystack') {
        gateway = 'paystack';
        transferId = await createTransferRecipient({
          name: user.accountName!,
          accountNumber: String(user.accountNumber),
          bankCode: user.bankCode!,
        });
      }

      if (transferId) {
        const update = await process_payment({
          id: trnx.id,
          transferId: transferId,
          type: 'payout',
          gateway,
          amount: trnx.fiatAmount,
          walletId: trnx.walletId!,
          referenceId: trnx.referenceId!,
          userId: trnx.userId!,
          returnOnFail: false,
          status: 'processing',
          pay: false,
          bankPaymentInfo: {
            accountName: user.accountName!,
            accountNumber: user.accountNumber!,
            bank: user.bankCode!,
            currency: trnx.settleCurrency,
            country: '',
          },
        } as any);

        if (update.inserted) {
          await updateData({
            data: { settled: true },
            table: 'transactions',
            id: trnx.id,
          });

          const amount = parseInt(trnx.fiatAmount, 10);

          const payIni = await initiatePaystckTransfer({
            recipientCode: transferId,
            amount: amount,
          });

          if (payIni && payIni.status) {
            const update = await process_payment({
              id: trnx.id,
              transferId: transferId,
              type: 'payout',
              gateway,
              trnxType: 'payout',
              amount: trnx.fiatAmount,
              walletId: trnx.walletId!,
              referenceId: trnx.referenceId!,
              userId: trnx.userId!,
              returnOnFail: false,
              status: payIni.data.status ? 'processed' : 'processing',
              pay: false,
              others: {
                transferData: payIni,
                transferCode: payIni.data.transfer_code,
                transferReferenceId: payIni.data.reference,
              },
            } as any);
          }
        }
      } else {
        console.error('no payment gateway found');
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function settlePayoutsAndWithdrawals(ref?: string): Promise<boolean> {
  // Inline type definitions
  type BankPaymentInfo = {
    accountName: string;
    accountNumber: string;
    bank: string;
  };

  type Transaction = {
    id: string;
    status: string;
    trnxType: string;
    type?: string;
    fulfilled?: boolean;
    processing?: boolean;
    fulfillmentDate?: string;
    referenceId?: string;
    bankPaymentInfo: BankPaymentInfo;
    amount: string;
  };

  type PaymentInitiationResult = {
    status: boolean;
    data?: {
      status: string;
      transfer_code?: string;
      reference?: string;
    };
  };

  // Constants
  const COMPLETED_STATUSES = ['completed', 'failed', 'reversed', 'abandoned'] as const;
  const SUCCESS_STATUSES = ['success', 'successful'] as const;
  const FAILED_STATUSES = ['failed', 'abandoned'] as const;
  const BATCH_SIZE = 10;

  const isValidAmount = (amount: string): boolean => {
    const num = parseInt(amount, 10);
    return !isNaN(num) && num > 0;
  };

  const isValidBankInfo = (bank: BankPaymentInfo): boolean => {
    return !!(bank?.accountName && bank?.accountNumber && bank?.bank);
  };

  const determineNewStatus = (transferStatus: string, currentStatus: string): string => {
    if (SUCCESS_STATUSES.includes(transferStatus as any)) return 'completed';
    if (FAILED_STATUSES.includes(transferStatus as any)) return 'failed';
    if (transferStatus === 'reversed') return 'reversed';
    return currentStatus;
  };

  try {
    console.info('Starting payout settlement process');

    // Verify payouts first
    await verifyPayoutsAndWithdrawals();

    // Build query conditions
    const conditions: any = {
      $and: [
        { status: 'paid' },
        {
          $or: [{ trnxType: 'withdrawal' }, { trnxType: 'payout' }, { type: 'payout' }],
        },
        {
          $or: [{ fulfilled: { $ne: true } }, { fulfilled: { $exists: false } }],
        },
        {
          $or: [{ processing: { $ne: true } }, { processing: { $exists: false } }],
        },
        {
          $or: [
            { fulfillmentDate: { $lte: convertDateTime() } },
            { fulfillmentDate: { $exists: false } },
          ],
        },
      ],
    };

    if (ref) {
      conditions.$and.push({ referenceId: ref });
    }

    // Get pending transactions
    const transactions: Transaction[] = await fetchDataWithConditions('payments', conditions);

    if (!transactions.length) {
      console.info('No pending transactions to process');
      return true;
    }

    console.info(`Found ${transactions.length} transactions to process`);

    const gateway = activeSps?.payout ?? '';

    if (!gateway) {
      console.error('No active payout gateway configured', activeSps);
      return false;
    }

    console.info(`Using gateway: ${gateway}`);

    // Process transactions in batches
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      console.info(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} transactions)`,
      );

      const batchPromises = batch.map(async (transaction: Transaction) => {
        let lockAcquired = false;

        try {
          // Skip already processed transactions
          if (COMPLETED_STATUSES.includes(transaction.status as any)) {
            console.info(
              `Transaction ${transaction.id} already processed with status: ${transaction.status}`,
            );
            return;
          }

          // Validate transaction data
          if (!isValidAmount(transaction.amount)) {
            console.error(
              `Invalid amount for transaction ${transaction.id}: ${transaction.amount}`,
            );
            return;
          }

          if (!isValidBankInfo(transaction.bankPaymentInfo)) {
            console.error(`Invalid bank info for transaction ${transaction.id}`);
            return;
          }

          // Create transfer recipient based on gateway
          let transferId: string | null = null;

          switch (gateway) {
            case 'paystack':
              const bank = transaction.bankPaymentInfo;
              transferId = await createTransferRecipient({
                name: bank.accountName,
                accountNumber: bank.accountNumber,
                bankCode: bank.bank,
              });
              break;

            default:
              console.error(`Unsupported gateway: ${gateway}`);
              return;
          }

          if (isNull(transferId)) {
            console.error(`Failed to create transfer recipient for transaction ${transaction.id}`);
            return;
          }

          // Acquire lock for transaction
          const lock = await lockAndUnlockTable({
            table: 'payments',
            id: transaction.id,
            action: 'lock',
          });

          if (!lock.status) {
            console.warn(`Failed to acquire lock for transaction ${transaction.id}`);
            return;
          }

          lockAcquired = true;
          console.info(`Lock acquired for transaction ${transaction.id}`);

          // Initiate transfer based on gateway
          let paymentResult: PaymentInitiationResult | null = null;
          const amount = parseInt(transaction.amount, 10);

          switch (gateway) {
            case 'paystack':
              paymentResult = await initiatePaystckTransfer({
                recipientCode: transferId!,
                amount: amount,
              });
              break;

            default:
              console.error(`Unsupported gateway for transfer: ${gateway}`);
              return;
          }

          if (!paymentResult) {
            console.error(`Failed to initiate transfer for transaction ${transaction.id}`);
            return;
          }

          // Process transfer result
          if (paymentResult.status && paymentResult.data) {
            const transferData = paymentResult.data;
            const newStatus = determineNewStatus(transferData.status, transaction.status);

            // Prepare update data
            const uData = {
              id: transaction.id,
              transferId: transferId,
              processing: false,
              fulfilled: true,
              fulfilledAt: convertDateTime(),
              transferData: paymentResult,
              transferCode: transferData.transfer_code,
              transferReferenceId: transferData.reference,
              status: newStatus,
            };

            // Update transaction if status changed
            if (newStatus !== transaction.status) {
              await updateData({
                data: uData,
                table: 'payments',
                id: transaction.id,
              });
              console.info(
                `Transaction ${transaction.id} updated from ${transaction.status} to ${newStatus}`,
              );
            } else {
              console.info(`Transaction ${transaction.id} status unchanged: ${newStatus}`);
            }
          } else {
            console.error(`Transfer failed for transaction ${transaction.id}:`, paymentResult);
          }
        } catch (error) {
          console.error(`Error processing transaction ${transaction.id}:`, error);
        } finally {
          // Always release the lock if it was acquired
          if (lockAcquired) {
            try {
              await lockAndUnlockTable({
                table: 'payments',
                id: transaction.id,
                action: 'unlock',
              });
              console.info(`Lock released for transaction ${transaction.id}`);
            } catch (unlockError) {
              console.error(
                `Failed to release lock for transaction ${transaction.id}:`,
                unlockError,
              );
            }
          }
        }
      });

      // Wait for batch to complete
      const results = await Promise.allSettled(batchPromises);

      // Log batch results
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      console.info(
        `Batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${succeeded} succeeded, ${failed} failed`,
      );
    }

    console.info('Payout settlement process completed successfully');
    return true;
  } catch (error) {
    console.error('Error in settlePayoutsAndWithdrawals:', error);
    return false;
  }
}

export async function verifyPayoutsAndWithdrawals(ref?: string) {
  const conditions: any = {
    $and: [
      {
        $or: [{ status: 'processed' }, { status: 'processing' }],
      },
      {
        $or: [{ trnxType: 'withdrawal' }, { trnxType: 'payout' }],
      },
    ],
  };

  if (ref) {
    conditions.$and.push({ referenceId: ref });
  }

  const response = await fetchDataWithConditions('payments', conditions);

  for (const trnx of response) {
    if (['completed', 'failed', 'reversed', 'abandoned'].includes(trnx.status)) continue;

    let status = trnx.status;
    let data: any = {};

    switch (trnx.gateway) {
      case 'paystack':
        const transferStatus = await verifyPaystackTransfer(
          trnx.transferReferenceId || trnx.transferCode,
        );
        data = transferStatus.data;
        if (!isNull(data)) {
          if (['success', 'successful'].includes(data.status)) {
            status = 'completed';
          } else if (['failed', 'abandoned'].includes(data.status)) {
            status = 'failed';
          } else if (data.status === 'reversed') {
            status = 'reversed';
          }
        }
        break;
    }

    if (trnx.status !== status) {
      const uData = {
        id: trnx.id,
        status,
        transferData: data,
      };

      await updateData({
        data: uData,
        table: 'payments',
        id: trnx.id,
      });
    }
  }
}

export async function approve_transfer(formData: any) {
  const conditions = {
    transferCode: formData.transfer_code,
  };

  const [response] = await fetchDataWithConditions('payments', conditions);

  if (response) {
    return api_response({ status: true });
  } else {
    return invalid_response('unathorized', 400);
  }
}

export async function server_get_wallet({
  userId,
  id,
  identifier = 'main',
  siteInfo,
}: {
  userId?: string;
  id?: string;
  identifier?: 'main' | 'revenue' | 'test';
  siteInfo?: BrandType;
}) {
  try {
  } catch (error) {
    console.error(error);
    return invalid_response('Error getting wallet');
  }
}

export async function get_wallet({
  userId,
  id,
  identifier = 'main',
  siteInfo,
  user,
  currency,
}: {
  userId?: string;
  id?: string;
  identifier?: 'main' | 'revenue' | 'test';
  siteInfo?: BrandType;
  user?: UserTypes;
  currency: string;
}): Promise<{ data: { main: any; others: any }; status: boolean }> {
  let res = { data: { main: {}, others: {} }, status: false };
  try {
    let missingFields: string[] = [];

    // Validate input fields

    if (isNull(id)) {
      missingFields.push('userId or Id');
    }

    if (isNull(currency)) {
      missingFields.push('defaultCurrency');
    }

    // Check for missing fields
    if (missingFields.length > 0) {
      console.error(`The following fields are missing: ${missingFields.join(', ')} at get wallet`);

      return res;
    }

    // Prepare search conditions
    const conditions: any = { id, brandId: siteInfo?.id, currency: lowercase(currency) };

    // Attempt to fetch existing wallet
    let wallets: WalletTypes[] = await fetchDataWithConditions('wallets', conditions);

    let wallet = wallets.find((wallet: WalletTypes) => wallet.identifier === 'main');

    let otherWallets = wallets.filter((wallet: WalletTypes) => wallet.identifier !== 'main');

    // If wallet exists, return it
    if (isNull(wallet)) {
      console.info('wallet not found');
      return res;
    } else {
      const value = wallet?.value || 0;
      const shareValue = wallet?.shareValue || 0;
      const walletData = { ...wallet, value, shareValue };
      return {
        data: { main: walletData, others: otherWallets },
        status: true,
      };
    }
  } catch (error) {
    console.error(error);
    return res;
  }
}

export async function get_wallets({
  userId,
  brandId,
  identifier,
  isDefault,
}: {
  userId: string;
  brandId: string;
  identifier: string;
  isDefault: boolean;
}) {
  try {
    let missingFields: string[] = [];

    if (isNull(userId)) {
      missingFields.push('userId');
    }
    if (isNull(brandId)) {
      missingFields.push('brandId');
    }

    // Check for missing fields
    if (missingFields.length > 0) {
      return invalid_response(
        `The following fields are missing: ${missingFields.join(', ')} at get wallet`,
      );
    }

    const conditions: any = {
      userId,
      brandId,
    };

    // Attempt to fetch existing wallet
    let wallets = await fetchDataWithConditions('wallets', conditions);

    return api_response({ data: wallets, status: true });
  } catch (error) {
    console.error(error);
    return invalid_response('Error getting wallet');
  }
}

export async function server_create_wallet({
  data,
  siteInfo,
  context,
}: {
  data: any;
  siteInfo?: BrandType;
  context: any;
}) {
  try {
    let missingFields: string[] = [];

    // Validate input fields
    if (isNull(data.identifier)) {
      missingFields.push('identifier');
    }
    if (isNull(data.userId)) {
      missingFields.push('userId');
    }
    if (isNull(data.brandId)) {
      missingFields.push('brandId');
    }
    if (isNull(data.currency)) {
      missingFields.push('currency');
    }
    // Check for missing fields
    if (missingFields.length > 0) {
      return invalid_response(
        `The following fields are missing: ${missingFields.join(', ')} at create wallet`,
      );
    }

    const conditions = {
      brandId: data.brandId,
      currency: data.currency,
      identifier: data.identifier,
      userId: data.userId,
      id: data.id,
    };

    // Prepare title for new wallet
    const title = `${data.identifier}`;

    // Fetch existing wallet with conditions to avoid duplicate insertion
    const [existingWallet] = await fetchDataWithConditions('wallets', conditions);

    // If wallet already exists, return it
    if (existingWallet) {
      return api_response({ data: existingWallet, status: true });
    }

    // Prepare wallet data for insertion
    const wData = { title, ...conditions, userId: conditions.userId };

    // Insert the wallet
    const response = await create_wallet(conditions, siteInfo);

    // Check if the insertion was successful
    if (response.status) {
      return api_response({ data: wData, status: true });
    } else {
      return invalid_response(response.msg, 200);
    }
  } catch (error) {
    console.error(error);
    return invalid_response('Failed to create wallet');
  }
}

export async function create_wallet(conditions: any, siteInfo?: BrandType) {
  try {
    let missingFields: string[] = [];

    // Validate input fields
    if (isNull(conditions.identifier)) {
      missingFields.push('identifier');
    }
    if (isNull(conditions.userId)) {
      missingFields.push('userId');
    }
    if (isNull(conditions.brandId)) {
      missingFields.push('brandId');
    }
    if (isNull(conditions.currency)) {
      missingFields.push('currency');
    }

    // Check for missing fields
    if (missingFields.length > 0) {
      return {
        status: false,
        msg: `The following fields are missing: ${missingFields.join(', ')} at create wallet`,
        data: null,
      };
    }

    // Prepare title for new wallet
    const title = `${conditions.identifier}`;

    // Fetch existing wallet with conditions to avoid duplicate insertion
    const [existingWallet] = await fetchDataWithConditions('wallets', conditions);

    // If wallet already exists, return it
    if (existingWallet) {
      return existingWallet;
    }

    // Prepare wallet data for insertion
    const wData = { title, ...conditions };

    // Insert the wallet
    const response = await upsert(wData, 'wallets', true, siteInfo!);

    // Check if the insertion was successful
    if (response) {
      return {
        status: true,
        msg: `successful`,
        data: wData,
      };
    } else {
      console.error('unable to create wallet');
      return {
        status: false,
        msg: `unable to create wallet`,
        data: wData,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      status: false,
      msg: `error creating wallet`,
      data: {},
    };
  }
}

async function handleDebit(
  walletId: string,
  amount: number,
  currency: string,
  userId: string,
): Promise<{ status: boolean; msg?: string }> {
  const debit = await debitAndCredit({
    action: 'debit',
    amount,
    id: walletId,
    currency: currency!,
    userId,
  });
  return debit.status ? { status: true, msg: debit.msg } : { status: false, msg: debit.msg };
}

async function handleCredit(
  walletId: string,
  amount: number,
  currency: string,
  shareRate: number,
  userId: string,
): Promise<{ status: boolean; msg?: string }> {
  const credit = await debitAndCredit({
    action: 'credit',
    amount,
    id: walletId,
    currency: currency!,
    shareRate,
    userId,
  });
  return credit.status ? { status: true, msg: credit.msg } : { status: false, msg: credit.msg };
}

export async function process_payment({
  id = '',
  userId,
  walletId,
  type = 'none',
  transferId,
  amount,
  name,
  email,
  referenceId,
  status = 'pending',
  gateway = 'wallet',
  trnxType,
  returnOnFail = true,
  bankPaymentInfo,
  pay = true,
  fulfillmentDate = convertDateTime(),
  currency,
  currencySymbol,
  shareRate,
  others,
}: _CreatePaymentModel): Promise<ProcessPaymentResponse> {
  let responseData: ProcessPaymentResponse = {
    debited: false,
    credited: false,
    payout: false,
    inserted: false,
    msg: 'none',
  };

  try {
    const siteInfo = await getBrandInfo();

    const missing = findMissingFields({ currency });

    if (missing && returnOnFail) {
      console.error(`${missing} are required`);
      return { ...responseData, msg: `${missing} required` };
    }

    let payStatus: any = status;
    let paymentGateway: any = gateway;
    let result;
    let charges = 0;

    if (['payout', 'withdrawal'].includes(trnxType)) {
      const missing = findMissingFields({
        accountName: bankPaymentInfo?.accountName,
        accountNumber: bankPaymentInfo?.accountNumber,
        bank: bankPaymentInfo?.bank,
      });

      if (missing) {
        console.error('bank payment details missing: ', missing);
        return { ...responseData, msg: `bank payment details missing: ${missing}` };
      }

      const aSps: any = activeSps;
      charges = calculateWithdrawalCharges({
        amount,
        gateway: aSps?.payout,
        currency: currency ?? '',
      });
    }

    switch (type) {
      case 'debit':
        if (userId && walletId && pay && amount > 0) {
          result = await handleDebit(walletId, amount + charges, currency!, userId);
          if (result.status) {
            payStatus = 'paid';
            responseData.debited = true;
            paymentGateway = 'wallet';
          } else if (returnOnFail) {
            return { ...responseData, msg: result.msg! };
          }
        }
        break;
      case 'credit':
        if (userId && walletId && pay && amount > 0) {
          result = await handleCredit(walletId, amount, currency!, shareRate!, userId);
          if (result.status) {
            payStatus = 'paid';
            responseData.credited = true;
            paymentGateway = 'wallet';
          } else if (returnOnFail) {
            return { ...responseData, msg: result.msg! };
          }
        }
        break;
    }

    if (amount === 0) {
      payStatus = 'paid';
      responseData.debited = true;
    }

    const data: PaymentType = {
      id: id,
      email,
      name,
      walletId,
      referenceId,
      transferId,
      amount,
      userId,
      gateway: paymentGateway,
      trnxType: trnxType as unknown as 'none',
      type: type as unknown as 'none',
      bankPaymentInfo: bankPaymentInfo || '',
      fulfillmentDate,
      currency,
      currencySymbol,
      ...others,
      status: payStatus,
    };

    const finalData = beforeUpdate(data);

    const res = await upsert(finalData, 'payments', true, siteInfo);

    return res.status
      ? { ...responseData, inserted: true, msg: 'successful' }
      : { ...responseData, msg: 'Payment not posted' };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { ...responseData, msg: 'Error creating payment' };
  }
}

export async function generateVirtualAccount({
  userId,
  siteInfo,
  email,
  country,
  first_name,
  last_name,
  account_number,
  bvn,
  bank_code,
  sp,
  expireAt,
  wallet,
}: {
  userId: string;
  siteInfo: BrandType;
  expireAt: Date;
  sp: 'paystack' | 'safeHeaven_d' | 'safeHeaven_v';
  customer_code?: string;
  preferred_bank?: string; // Optional: preferred bank name
  country: string; // Country code (e.g., 'NG' for Nigeria)
  first_name: string;
  last_name: string;
  phone?: string; // Optional phone number
  email: string;
  bvn?: string;
  account_number?: string;
  bank_code?: string;
  wallet: string;
}) {
  let result: any = { status: false, data: {} };
  let customerId = '';

  switch (sp) {
    case 'paystack':
      result = await assignDedicatedAccount({
        email,
        country,
        first_name,
        last_name,
        account_number,
        bvn,
        bank_code,
      });
      customerId = result.data.customerId;
      break;
  }

  if (result.status) {
    let checkva: any = {};

    switch (sp) {
      case 'paystack':
        checkva = await checkDedicatedAccountStatus(customerId);
        break;
    }

    if (checkva.status) {
      for (let v of checkva.data) {
        const vaData = {
          id: account_number,
          vaid: `${userId}${sp}`,
          userId,
          expireAt,
          ...v,
          ...v.bank,
          customerId,
          sp,
          walletId: wallet,
          type: 'virtual',
          status: 'active',
          mode: 'inward',
        };

        const createVA = await upsert(vaData, 'fund_sources', true, siteInfo!);
      }
    } else {
      console.error(checkva.msg);
    }
  } else {
    console.error(result.msg);
  }

  return result;
}

export async function crypto_to_fiat_rate(
  crypto = 'BTC',
  fiat = 'NGN',
): Promise<{ rate: number; fiatValue: number; baseValue: number }> {
  try {
    const feePerByte = await feeAdd();
    const feeAdjustmentFactor = feePerByte * 10;

    const fiatResponse = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=${fiat}`,
    );
    const fiatData = await fiatResponse.json();
    const cryptoToFiat = fiatData[fiat];

    const cryptoResponse = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=USD`,
    );

    const cryptoData = await cryptoResponse.json();
    const cryptoToUsd = cryptoData.USD - feeAdjustmentFactor;

    const cryptoToFiatRate = cryptoToFiat / cryptoToUsd;

    return {
      rate: Math.round(cryptoToFiatRate),
      fiatValue: cryptoToFiat,
      baseValue: cryptoToUsd,
    };
  } catch (error) {
    console.error(error);
    return {
      rate: 0,
      fiatValue: 0,
      baseValue: 0,
    };
  }
}

export async function feeAdd(): Promise<number> {
  const response = await fetch('https://blockstream.info/api/fee-estimates');
  const feeEstimates = await response.json();
  const feePerByte = feeEstimates['6'];
  return feePerByte;
}

export async function payForOrder({
  data,
  orderRates,
  products,
  filteredFormData,
}: {
  data: any;
  orderRates: any;
  products: Data[];
  filteredFormData: CheckOutDataType;
}): Promise<{ inserted: boolean; debited: boolean; msg: string }> {
  try {
    const newProducts = products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      brandId: p.brandId,
      quantity: (p as any).quantity ?? 1,
    }));

    let amount = data.subTotal ?? 0;

    const session: AuthModel = await getAuthSessionData();

    if (data.gateway === 'wallet' && !isNull(session)) {
      amount = await convertCur({
        amount: data.subTotal,
        fromCurrency: data.currency,
        toCurrency: session.defaultCurrency ?? '',
        rates: orderRates,
      });
    }

    const debit = await process_payment({
      userId: session?.userId ?? '',
      walletId: (session as any).walletId ?? '',
      type: 'debit',
      amount,
      id: randomNumber(10),
      name: data.name,
      email: data.email,
      referenceId: data.referenceId,
      status: 'pending',
      gateway: data.gateway,
      trnxType: 'purchase',
      returnOnFail: true,
      pay: data.gateway === 'wallet',
      currency: data.currency ?? '',
      currencySymbol: filteredFormData.symbol,
      others: {
        products: newProducts,
        rates: orderRates,
      },
    });
    return debit;
  } catch (error) {
    console.error(error);
    return {} as any;
  }
}
