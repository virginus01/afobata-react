import {
  bulkUpsert,
  fetchDataWithConditions,
  fetchPaginatedData,
  upsert,
  updateDataWithConditions,
  updateData,
  lockAndUnlockTable,
} from '@/app/api/database/mongodb';
import { api_response } from '@/app/helpers/api_response';
import { convertCur } from '@/app/helpers/convertCur';
import { invalid_response } from '@/app/helpers/invalid_response';
import { response } from '@/app/helpers/response';
import { fulfill_digital_product, get_product, modProduct } from '@/api/product';
import { addToCurrentDate } from '@/app/helpers/addToCurrentDate';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { getRewardMille } from '@/app/helpers/getRewardMille';
import { isNull } from '@/app/helpers/isNull';
import { random_code } from '@/app/helpers/random_code';
import { cbk_query_order } from '@/app/api/thirdparty/clubkonnect/queries';
import { payForOrder, process_payment, query_payment } from '@/app/api/wallet_and_payments';
import { fulFill_subscriptions } from '@/app/api/packages_and_addons/subscriptions';
import { calculateFinalPrice, getCommissionsTurbor } from '@/app/helpers/price_logic';
import { fetchBrand, get_site_info, getBrandInfo, getBrandParents } from '@/api/brand/brand';
import { get_user, getCurrentUser } from '@/app/api/user';
import { fulFill_data_order } from '@/api/orders/fullfil/data';
import { fulFill_electric_order } from '@/api/orders/fullfil/electric';
import { fulFill_tv_order } from '@/api/orders/fullfil/tv';
import { fulFill_airtime_order } from '@/api/orders/fullfil/airtime';
import { creditDebitMille } from '@/api/mille';
import { cbk_cancel_order } from '@/api/thirdparty/clubkonnect/cbk_cancel_order';
import { getExchangeRates } from '@/api/currency/currency';
import { getAuthSessionData, getSeverSessionData } from '@/app/controller/auth_controller';
import { Data } from '@/app/models/Data';
import { Order } from '@/app/models/Order';
import runCron from '@/api/edge_lib/run_cron';

export async function server_create_or_update_order(formData: CheckOutDataType, context?: any) {
  // Initialize response structure
  let responseData: {
    msg: string;
    code: string;
    success: boolean;
    data?: any;
  } = {
    msg: '',
    code: '',
    success: false,
  };

  try {
    // Validate input data
    if (!formData) {
      return api_response({
        ...responseData,
        msg: 'Invalid form data provided',
        code: 'INVALID_INPUT',
      });
    }

    if (!formData.cart || !Array.isArray(formData.cart) || formData.cart.length === 0) {
      return api_response({
        ...responseData,
        msg: 'Cart is empty or invalid',
        code: 'EMPTY_CART',
      });
    }

    // Get site information with error handling
    let cBrand: BrandType;
    try {
      cBrand = await getBrandInfo(context, true);
      if (!cBrand || isNull(cBrand.ownerData)) {
        throw new Error('Site information or owner data not found');
      }
    } catch (error) {
      console.error('Error fetching site info:', error);
      return api_response({
        ...responseData,
        msg: 'Unable to retrieve site information',
        code: 'SITE_INFO_ERROR',
      });
    }

    // Get user data with error handling
    let session: AuthModel = await getAuthSessionData();

    // Get exchange rates with error handling
    let rates: any;
    try {
      rates = await getExchangeRates();
      if (!rates) {
        throw new Error('Exchange rates not available');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return api_response({
        ...responseData,
        msg: 'Unable to retrieve current exchange rates. Please try again later.',
        code: 'RATES_ERROR',
      });
    }

    // Validate required fields
    const missing = findMissingFields({ currency: formData?.currency });
    if (missing) {
      return api_response({
        ...responseData,
        msg: `Required fields missing: ${missing}`,
        code: 'MISSING_FIELDS',
      });
    }

    // Prepare order rates
    let newOrderRates;
    try {
      newOrderRates = {
        ...formData.rates,
        [formData?.currency.toUpperCase()]: rates[formData?.currency.toUpperCase()],
        ['USD']: rates['USD'],
        ['NGN']: rates['NGN'],
        ['GHS']: rates['GHS'],
      };

      if (isNull(newOrderRates)) {
        throw new Error('Order rates are null');
      }
    } catch (error) {
      console.error('Error preparing order rates:', error);
      return api_response({
        ...responseData,
        msg: 'Unable to calculate exchange rates. Please try again.',
        code: 'RATES_CALCULATION_ERROR',
      });
    }

    // Process cart items
    const orders: any[] = [];
    const products: Data[] = [];
    const prices: number[] = [];
    const failedItems: string[] = [];

    for (const [index, order] of formData.cart.entries()) {
      try {
        // Validate cart item
        if (!order.productId) {
          console.warn(`Cart item ${index} missing productId`);
          failedItems.push(`Item ${index + 1}: Missing product ID`);
          continue;
        }

        // Fetch product
        let product: DataType;
        try {
          const [fetchedProduct] = await fetchDataWithConditions('products', {
            id: order.productId,
          });
          product = fetchedProduct;
        } catch (error) {
          console.error(`Error fetching product ${order.productId}:`, error);
          failedItems.push(`Item ${index + 1}: Product not found`);
          continue;
        }

        if (isNull(product)) {
          console.warn(`Product not found: ${order.productId}`);
          failedItems.push(`Item ${index + 1}: Product not available`);
          continue;
        }

        // Modify product
        let newProduct: Data = {} as any;

        try {
          newProduct = await modProduct({ product, siteInfo: cBrand });
          if (isNull(newProduct)) {
            throw new Error('Product modification failed');
          }
        } catch (error) {
          console.error(`Error modifying product ${order.productId}:`, error);
          failedItems.push(`Item ${index + 1}: Product processing error`);
          continue;
        }

        // Update order rates for this product
        let orderRates;
        try {
          orderRates = {
            ...newOrderRates,
            [newProduct?.currency.toUpperCase()]: rates[newProduct?.currency.toUpperCase()],
          };
        } catch (error) {
          console.error(`Error calculating rates for product ${order.productId}:`, error);
          failedItems.push(`Item ${index + 1}: Rate calculation error`);
          continue;
        }

        // Calculate final price
        let calculated;
        try {
          calculated = await calculateFinalPrice({
            product: newProduct as any,
            invoice: formData as any,
            order: order as any,
            siteInfo: cBrand,
            rates: orderRates,
          });

          if (!calculated.ok) {
            throw new Error('Price calculation failed');
          }
        } catch (error) {
          console.error(`Error calculating price for product ${order.productId}:`, error);
          failedItems.push(`Item ${index + 1}: Price calculation error`);
          continue;
        }

        // Process order
        let postData;
        try {
          postData = await processOrder({
            order: { ...order, amount: calculated.price },
            formData,
            context,
            cBrand,
            product: { ...newProduct, ...calculated } as any,
          });
        } catch (error) {
          console.error(`Error processing order for product ${order.productId}:`, error);
          failedItems.push(`Item ${index + 1}: Order processing error`);
          continue;
        }

        // Calculate rewards
        let mille;
        try {
          mille = getRewardMille({
            amount: calculated.price ?? 0,
            rates: orderRates,
            currency: formData.currency,
          });
        } catch (error) {
          console.error(`Error calculating rewards for product ${order.productId}:`, error);
          mille = 0; // Default to 0 if calculation fails
        }

        // Add successful order
        prices.push(calculated.price ?? 0);
        products.push({
          ...newProduct,
          price: calculated.price ?? 0,
          quantity: order.quantity ?? 1,
        } as any);
        orders.push({
          ...postData,
          gateway: formData?.gateway,
          mille,
          userId: session.userId,
          rates: orderRates,
          productData: {
            fulFilmentType: newProduct.fulFilmentType,
            redirectUrl: newProduct.redirectUrl,
            product_files: newProduct.product_files,
            password: newProduct.password,
          },
          status: 'pending',
        });
      } catch (itemError) {
        console.error(`Unexpected error processing cart item ${index}:`, itemError);
        failedItems.push(`Item ${index + 1}: Unexpected error`);
      }
    }

    // Check if any orders were successfully processed
    if (orders.length === 0) {
      return api_response({
        ...responseData,
        msg:
          failedItems.length > 0
            ? `All items failed to process: ${failedItems.join('; ')}`
            : 'No valid items found in cart',
        code: 'NO_VALID_ITEMS',
      });
    }

    // Calculate total price
    const totalPrice = prices.reduce((sum, price) => sum + price, 0);
    const { cart, ...filteredFormData } = formData;

    // Save orders to database
    let orderSaveResult;
    try {
      orderSaveResult = await bulkUpsert(orders, 'orders');
      if (!orderSaveResult.status) {
        throw new Error(`Order save failed: ${orderSaveResult.msg || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving orders:', error);
      return api_response({
        ...responseData,
        msg: 'Failed to save orders. Please contact support.',
        code: 'ORDER_SAVE_ERROR',
      });
    }

    // Save payment record

    let isPaid = false;

    try {
      const paymentAction = await payForOrder({
        data: { ...formData, subTotal: totalPrice },
        orderRates: newOrderRates,
        products,
        filteredFormData: filteredFormData as any,
      });

      if (!paymentAction.inserted) {
        console.error(paymentAction);
        throw new Error(`Payment save failed: ${paymentAction.msg || 'Unknown error'}`);
      }

      if (paymentAction.debited) {
        isPaid = paymentAction.debited;
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      return api_response({
        ...responseData,
        msg: 'Failed to create payment record. Please contact support.',
        code: 'PAYMENT_SAVE_ERROR',
      });
    }

    // Update payment and order status if paid
    if (isPaid) {
      filteredFormData.status === 'paid';
      try {
        await Promise.all([
          updateDataWithConditions({
            collectionName: 'orders',
            conditions: { referenceId: formData.referenceId },
            updateFields: { status: 'paid' },
          }),
        ]);
      } catch (error) {
        console.error('Error updating payment status:', error);
        // Log but don't fail the entire operation
        console.warn('Payment processed but status update failed');
      }
    }

    // Get final orders for response
    let finalOrders = orders;
    if (isPaid) {
      try {
        await fulfill_orders();
        finalOrders = await fetchDataWithConditions('orders', {
          referenceId: formData.referenceId,
        });
      } catch (error) {
        console.error('Error fetching final orders:', error);
        // Use original orders if fetch fails
      }
    }

    // Prepare success response
    responseData.msg =
      failedItems.length > 0
        ? `Order created successfully. ${failedItems.length} item(s) failed: ${failedItems.join(
            '; ',
          )}`
        : 'Order created successfully';
    responseData.code = isPaid ? 'paid' : 'pending';
    responseData.success = true;
    responseData.data = {
      invoice: filteredFormData,
      orders: finalOrders,
      subTotal: totalPrice,
      failedItems: failedItems.length > 0 ? failedItems : undefined,
    };
  } catch (error) {
    console.error('Unexpected error during order creation:', error);
    responseData.msg = 'An unexpected error occurred. Please contact support.';
    responseData.code = 'UNEXPECTED_ERROR';
  } finally {
    // Always run cron job
    try {
      runCron({ target: 'always' });
    } catch (cronError) {
      console.error('Cron job failed:', cronError);
      // Don't affect the main response
    }
  }

  return api_response(responseData);
}

async function fetchBrandDetails(brandId: string): Promise<BrandType> {
  return await fetchBrand({ id: brandId }, true);
}

function buildBankPaymentInfo(owner: UserTypes): _BankPaymentInfo {
  return {
    accountNumber: owner.accountNumber!,
    accountName: owner.accountName!,
    bank: owner.bankCode!,
    currency: owner.defaultCurrency!,
    country: owner.country!,
  };
}

async function buildPayoutBrandDetails(brand: BrandType): Promise<_SettlementBrandDetailsModel> {
  const bankPaymentInfo = buildBankPaymentInfo(brand.ownerData!);

  const data: _SettlementBrandDetailsModel = {
    id: brand?.id ?? '',
    ownerId: brand?.ownerData?.id ?? '',
    ownerWalletId: brand?.ownerData?.wallet?.id ?? '',
    shareRate: brand?.share_value ?? 0,
    sales_commission: brand?.sales_commission ?? 0,
    currencyCode: brand.ownerData?.currencyInfo?.currencyCode ?? '',
    currencySymbol: brand.ownerData?.currencyInfo?.currencySymbol ?? '',
  };
  return {
    ...data,
    ...bankPaymentInfo,
  };
}

async function processOrder({
  order,
  formData,
  context,
  cBrand,
  product,
}: {
  order: any;
  formData: any;
  context: any;
  cBrand: any;
  product: DataType;
}): Promise<any> {
  try {
    const { parent, master } = await getBrandParents({
      brandId: product.brandId ?? '',
    });

    const op = await getBrandParents({
      brandId: cBrand.brandId,
    });

    if (isNull(parent) || isNull(master) || isNull(op.parent)) {
      throw Error('grand parents not determined');
    }

    const productBrand = await fetchBrandDetails(
      product?.parentData?.brandId ?? product.brandId ?? '',
    );

    const orderBrandDetails = await buildPayoutBrandDetails(cBrand);
    const orderParentBrandDetails = await buildPayoutBrandDetails(op.parent);
    const productBrandDetails = await buildPayoutBrandDetails(productBrand);
    const productParentBrandDetails = await buildPayoutBrandDetails(parent);
    const masterBrandDetails = await buildPayoutBrandDetails(master);

    const commissions = await getCommissionsTurbor({
      order,
      brand: cBrand,
      orderBrandDetails,
      orderParentBrandDetails,
      productBrandDetails,
      productParentBrandDetails,
      masterBrandDetails,
      product: (product as any) ?? {},
      invoice: formData,
    });

    delete formData.cart;

    const settlementDate = convertDateTime(addToCurrentDate({ days: 1 }));

    return {
      ...formData,
      ...order,
      settlementDate,
      ...commissions,
    };
  } catch (error) {
    console.error('processOrder error: ', error);
    return {
      ...formData,
      ...order,
      orderValue: parseInt(order.orderValue || 0),
      quantity: 1,
    };
  }
}

export async function server_update_order(formData: OrderType) {
  try {
    await query_payment({ ref: formData?.referenceId ?? '' });
    runCron({ target: 'always' });
    let orders = [];

    if (formData.referenceId) {
      orders = await fetchDataWithConditions('orders', { referenceId: formData.referenceId });
    }

    return response({ status: true, data: orders });
  } catch (error) {
    console.error(error);
    return invalid_response('error updating order');
  }
}
export async function get_orders({
  user_id,
  status,
  limit = '1000',
  page = '1',
}: {
  user_id: any;
  status: string;
  limit?: string;
  page?: string;
}) {
  try {
    let conditions: any = {
      orderBrandOwner: user_id,
    };

    if (status) {
      conditions.status = status;
    }

    let res = await fetchPaginatedData({
      collectionName: 'orders',
      conditions,
      limit,
      page,
    });

    return response({ status: true, meta: res.meta, data: res.data });
  } catch (error) {
    console.error(error);
    return api_response({});
  }
}

export async function get_orders_by_ref(ref: any, status?: string) {
  try {
    let conditions = {
      referenceId: ref,
    };

    await query_orders({ referenceId: ref });

    let res = await fetchDataWithConditions('payments', conditions);

    let res2 = {};
    if (res) {
      res2 = await fetchDataWithConditions('orders', conditions);
    }

    const data = {
      ...res[0],
      orders: res2,
    };
    let response: any = {};

    if (res.length > 0) {
      response.msg = 'orders fetched';
      response.code = 'success';
      response.success = true;
    } else {
      response.msg = 'orders not fetched';
      response.code = 'error';
      response.success = false;
    }

    return api_response(response, data);
  } catch (error) {
    console.error(error);
    return api_response({});
  }
}

export async function fulfill_orders(id?: any) {
  try {
    let conditions: any = {
      $and: [
        { status: 'paid' },
        {
          $or: [{ processing: { $exists: false } }, { processing: null }, { processing: false }],
        },
        {
          $or: [{ fulfillId: { $exists: false } }, { fulfillId: null }, { fulfillId: '' }],
        },
      ],
    };

    if (id) {
      conditions.$and.push({ id: id });
    }

    let res = await fetchDataWithConditions('orders', conditions);

    if (res.length > 0) {
      await fulfillOrders(res);
    }

    return response({ status: true, data: res });
  } catch (error) {
    console.error(error);
    return api_response({});
  }
}

const processedOrderIds: string[] = [];

export async function fulfillOrders(data: Order[]) {
  try {
    for (const order of data) {
      if (order.status !== 'paid' || !isNull(order.fulfillId) || order.processing) continue;

      if (processedOrderIds.includes(order.id ?? '')) continue;

      processedOrderIds.push(order.id ?? '');

      try {
        const lock = await lockAndUnlockTable({ table: 'orders', id: order?.id!, action: 'lock' });

        if (!lock.status) continue;

        let product: DataType | any = {};
        const brand = await get_site_info({}, order.brandId);
        const res = await get_product({ id: order.productId, brand });
        const resp = await res.json();
        product = resp.data;

        const { data: user } = await get_user({ id: order.userId!, siteInfo: brand });

        if (isNull(product) || isNull(brand) || isNull(user)) {
          console.error('Product, brand, or user not found for order:', order.id);
          continue;
        }

        let response: any = '';
        console.info('FULFILLING NOW: ', product.id);

        switch (product.type) {
          case 'data':
            response = await fulFill_data_order(product, order as any);
            break;
          case 'electric':
            response = await fulFill_electric_order(product, order as any);
            break;
          case 'tv':
            response = await fulFill_tv_order(product, order as any);
            break;
          case 'airtime':
            response = await fulFill_airtime_order(product, order as any);
            break;
          case 'package':
            response = await fulFill_subscriptions({
              order,
              siteInfo: brand,
              user: user as any,
            });
            break;
          case 'digital':
          case 'course':
            response = await fulfill_digital_product({ product, order, brand, user: user as any });
            break;
          default:
            console.warn('Unknown product type:', product.type);
            continue;
        }

        let finalStatus = response.status;

        if (response.status === 'invalid') {
          const refund = await cancel_and_refund({ order });

          if (refund.status) {
            finalStatus = 'refunded';
          }
        }

        if (!isNull(response) && finalStatus) {
          const orderData = {
            id: order.id,
            status: finalStatus,
            fulfillId: response.id || '',
            tokens: response.tokens || [],
            fulfillResponse: response.fulfillResponse || {},
            partner: response.partner ?? product.partner,
          };

          const result = await updateDataWithConditions({
            collectionName: 'orders',
            conditions: { id: order.id! },
            updateFields: orderData,
          });

          if (response.status === 'processed') {
            settle_orders(order.id);
          }
        }
      } catch (innerError) {
        console.error('Error processing order:', order.id, innerError);
        continue; // Skip this order and continue with the rest
      } finally {
        lockAndUnlockTable({ table: 'orders', id: order?.id!, action: 'unlock' });
      }
    }

    return true;
  } catch (error) {
    console.error('Error in fulfillOrders:', error);
    return false;
  }
}

export async function query_orders({
  id,
  fulfillId,
  referenceId,
  context,
  siteInfo,
}: {
  id?: string;
  fulfillId?: string;
  referenceId?: string;
  context?: any;
  siteInfo?: BrandType;
}) {
  try {
    let conditions: any = {};

    // If any identifiers are provided, build a $or condition from them
    if (id || fulfillId || referenceId) {
      const orConditions = [];

      if (id) orConditions.push({ id });
      if (fulfillId) orConditions.push({ fulfillId });
      if (referenceId) orConditions.push({ referenceId });

      conditions = { $or: orConditions };
    } else {
      conditions = {
        $or: [{ status: 'processing' }, { status: 'processed' }],
      };
    }

    const res = await fetchDataWithConditions('orders', conditions);

    if (res.length > 0) {
      const order = await queryOrders(res, siteInfo!);
      const updatedOrder = await fetchDataWithConditions('orders', conditions);
      return response({ status: true, data: updatedOrder });
    }

    return response({ status: true, data: [], msg: 'no order to query' });
  } catch (error) {
    console.error(error);
    return api_response({});
  }
}

export async function queryOrders(data: OrderType[], siteInfo: BrandType) {
  try {
    let response: any = {};

    for (const order of data) {
      switch (order.partner) {
        case 'cbk':
          response = await cbk_query_order(order);
          break;
      }

      if (!isNull(response)) {
        const orderData = {
          id: order.id,
          status: ['completed'].includes(response.status) ? response.status : order.status,
          tokens: response.tokens || [],
          fulfillResponse: { ...order?.fulfillResponse, ...response?.fulfillResponse },
        };

        await updateDataWithConditions({
          collectionName: 'orders',
          conditions: { id: order.id },
          updateFields: orderData,
        });
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateOrderStatus(order: OrderType, siteInfo: BrandType) {
  let status = order.status;
  if (order.status !== 'completed') {
    const [payment] = await fetchDataWithConditions('payments', {
      referenceId: order.referenceId,
    });

    if (['paid'].includes(payment.status)) {
      status = 'paid';
    }

    const res = await upsert({ id: order.id, status: status }, 'orders', true, siteInfo);

    if (res.status) {
      return true;
    }
  }

  return false;
}

export async function settle_orders(id?: string, type?: string) {
  try {
    let conditions: any = {
      $and: [
        { status: 'processed' },
        {
          $or: [
            { settlementDate: { $lte: convertDateTime() } },
            { settlementDate: { $exists: false } },
          ],
        },
      ],
    };

    if (type) {
      conditions.$and.push({ type: type });
    }

    if (id) {
      conditions.$and.push({ id: id });
    }

    const orders = await fetchDataWithConditions('orders', conditions);

    let r: any[] = [];
    for (const order of orders) {
      const res = await settleOrder(order);
      r.push({ id: order.id, ...res });
    }

    return api_response({ status: true, success: true, data: r });
  } catch (error) {
    console.error(error);
    return invalid_response('error setling order', 200);
  }
}

export async function settleOrder(order: OrderType): Promise<any> {
  let res: any = {
    bSettleStatus: false,
    pPBSettleStatus: false,
    oPBSettleStatus: false,
    mSettleStatus: false,
    oRevenueStatus: false,
  };

  try {
    if (isNull(order)) {
      console.warn('Order is null');
      return res;
    }

    // Ensuring order status is "processed"
    if (order.status !== 'processed') {
      console.warn(`Order status is ${order.status}, not "processed"`);
      return res;
    }

    const referenceId = order.referenceId ?? '';

    res['oRevenueStatus'] = await settle({
      order,
      data: order?.productBrandCommission ?? ({} as any),
      commissionKey: 'productBrandCommission',
      trnxType: 'payout',
      referenceId,
    });

    res['pPBSettleStatus'] = await settle({
      order,
      data: order?.productParentBrandCommission ?? ({} as any),
      commissionKey: 'productParentBrandCommission',
      trnxType: 'commission',
      referenceId,
    });

    res['bSettleStatus'] = await settle({
      order,
      data: order?.orderBrandCommission ?? ({} as any),
      commissionKey: 'orderBrandCommission',
      trnxType: 'commission',
      referenceId,
    });

    res['oPBSettleStatus'] = await settle({
      order,
      data: order?.orderParentBrandCommission ?? ({} as any),
      commissionKey: 'orderParentBrandCommission',
      trnxType: 'commission',
      referenceId,
    });

    const updateResult: any = await updateDataWithConditions({
      collectionName: 'orders',
      conditions: { settlementReferrence: order.referenceId },
      updateFields: { status: 'completed' },
    });

    if (order.userId && order.mille) {
      const [user] = await fetchDataWithConditions('users', { id: order.userId });
      if (user) {
        await creditDebitMille({
          userId: order.userId,
          brandId: user.brandId,
          action: 'credit',
          value: order.mille ?? 0,
        });
      }
    }

    return { ...res, ...updateResult };
  } catch (error) {
    console.error(`Error settling order ${order.id}:`, error);
    return res;
  }
}

async function settle({
  data,
  commissionKey,
  order,
  trnxType,
  referenceId,
}: {
  data: _SettlementBrandDetailsModel;
  commissionKey: string;
  order: OrderType;
  trnxType: 'payout' | 'commission' | 'withdrawal' | 'funding' | 'purchase' | 'subsidy' | 'share';
  referenceId: string;
}) {
  try {
    if (data.commissionStatus === undefined || data.commissionStatus) {
      return true;
    }

    let missing: any = '';
    missing = findMissingFields({ commissionKey, order, data, trnxType });

    if (missing) {
      console.error('missing fields: ', missing);
      return;
    }
    const updateResult = await updateDataWithConditions({
      collectionName: 'orders',
      conditions: { id: order.id },
      updateFields: {
        [commissionKey]: {
          ...data,
          commissionStatus: true,
          referenceId,
          paidAt: convertDateTime(),
        },
        settlementReferrence: order.referenceId,
      },
    });

    if (!updateResult) {
      console.error(`Failed to update brand commission status for order ${order.id}`);
      return false;
    }

    if (['data', 'tv', 'electric', 'airtime'].includes(order.type ?? '')) {
      if (['productParentBrandCommission', 'productBrandCommission'].includes(commissionKey)) {
        return true;
      }
    }

    let gateway: any = 'wallet';
    let type: any = 'credit';

    if ((data?.commission ?? 0) === 0) {
      return true;
    }

    if (
      (data?.commission ?? 0) >= 1000 &&
      ['NGN'].includes(data?.currencyCode!.toUpperCase()) &&
      !isNull(data.accountNumber) &&
      !isNull(!isNull(data.bank))
    ) {
      gateway = 'paystack';
      type = 'payout';
    }

    const resP = await process_payment({
      name: order?.name,
      email: order?.email,
      walletId: data?.ownerWalletId!,
      referenceId: referenceId,
      amount: data?.commission || 0,
      userId: data?.ownerId!,
      status: 'pending',
      gateway,
      trnxType,
      type,
      shareRate: trnxType === 'commission' || order.type === 'package' ? data?.shareRate : 0,
      returnOnFail: true,
      currency: data?.currencyCode,
      bankPaymentInfo: {
        accountName: data?.accountName!,
        accountNumber: data?.accountNumber!,
        bank: data?.bank!,
        country: data?.country!,
        currency: data?.currencyCode!,
      },
    });

    return resP.credited;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function server_change_order_status({ body }: { body: any }) {
  let msg = 'unknown error';
  try {
    let status = body.status;
    let order: OrderType = body.order;

    if ((body as any).newStatus === 'cancelled') {
      const [orderData]: OrderType[] = await fetchDataWithConditions('orders', {
        id: order.id,
      });

      if (orderData.status !== 'pending') {
        return invalid_response('Order Not Pending', 200);
      }

      status = 'cancelled';
      let refunded = true;

      const newRef = random_code(10);
      const res: any = await updateDataWithConditions({
        collectionName: 'orders',
        conditions: { id: order.id! },
        updateFields: {
          status,
          referenceId: newRef,
          oldReferenceId: body.referenceId,
          refunded,
        },
      });

      msg = res.status ? 'Order Cancelled & Refunded' : msg;
    }

    return api_response({ status: true, msg });
  } catch (error) {
    console.error(error);
    return invalid_response('error updating order status');
  }
}

export async function server_order_action({ body }: { body: Order }) {
  let msg = 'unknown error';

  try {
    let status = body.status;
    let order: Order = body;

    runCron({ target: 'always' });
    await query_orders({ id: body.id, fulfillId: body.fulfillId, referenceId: body.referenceId });

    const [orderData]: Order[] = await fetchDataWithConditions('orders', {
      id: order.id,
    });

    if (isNull(orderData)) {
      return response({ msg: 'no order found', status: false });
    }

    const session = await getSeverSessionData();

    switch ((body as any).action) {
      case 'cancel_force':
        if (session.isAdmin) {
          let cancel = await cbk_cancel_order(orderData);

          const action = await cancel_and_refund({ order: order as any });
          if (action.status)
            return response({
              msg: 'Cancelled & Refunded',
              status: true,
              data: { ...orderData, status: action.status },
            });
        } else {
          return response({
            msg: 'Not Permited to do this',
            status: false,
            data: { ...orderData },
          });
        }

      case 'cancel':
        let action = { status: false, msg: 'not cancelled' };

        if (orderData.processing) {
          return response({
            msg: 'Order is processing',
            status: true,
            data: { ...orderData, status: action.status },
          });
        } else if (['paid'].includes(orderData.status ?? '') && isNull(orderData.fulfillId)) {
          action = await cancel_and_refund({ order: order as any });
          if (action.status)
            return response({
              msg: 'Cancelled & Refunded',
              status: true,
              data: { ...orderData, status: action.status },
            });
        } else if (
          ['processing', 'processed', 'completed'].includes(orderData?.status!) ||
          orderData.fulfillId
        ) {
          let cancel = await cbk_cancel_order(orderData);

          if (
            ['cancelled', 'refunded'].includes(cancel.status) &&
            ['processing'].includes(orderData.status ?? '')
          ) {
            action = await cancel_and_refund({ order: order as any });
            if (action.status)
              return response({
                msg: 'Cancelled & Refunded',
                status: true,
                data: { ...orderData, status: action.status },
              });
          }
        }

        return response({
          msg: 'can not cancel, contact support',
          status: false,
          data: { ...orderData },
        });

      case 'refresh':
        return response({ msg: 'Refreshed', status: true, data: { ...orderData } });

      default:
        return response({ msg: 'unknown action', status: false, data: { ...orderData } });
    }
  } catch (error) {
    console.error(error);
    return invalid_response('error updating order status');
  }
}

export async function cancel_and_refund({ order }: { order: Order }) {
  try {
    const { data: user } = await get_user({ id: order.userId! });
    const rates = await getExchangeRates();

    const update: any = await updateData({
      data: { status: 'cancelled' },
      table: 'orders',
      id: order?.id!,
    });

    const convertedAmount = await convertCur({
      amount: order?.amount!,
      fromCurrency: order?.orderCurrency!,
      toCurrency: user?.defaultCurrency!,
      rates,
    });

    if (update.status) {
      const payment = await process_payment({
        id: order.id,
        userId: order.userId!,
        walletId: order.walletId!,
        type: 'credit',
        amount: convertedAmount ?? 0,
        name: order.name,
        email: order.email,
        referenceId: order.referenceId!,
        status: 'pending',
        gateway: 'wallet',
        trnxType: 'refund',
        currency: user?.defaultCurrency!,
        returnOnFail: true,
      });
      if (payment.credited) {
        const update: any = await updateData({
          data: { status: 'refunded' },
          table: 'orders',
          id: order?.id!,
        });
        return { status: update.status, msg: 'refunded' };
      }
    }

    return { status: false, msg: 'not refunded' };
  } catch (error) {
    console.error(error);
    return { status: false, msg: 'not canceled' };
  }
}
