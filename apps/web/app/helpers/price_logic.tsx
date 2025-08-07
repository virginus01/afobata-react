'use server';

import { convertCur } from '@/app/helpers/convertCur';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { getPackagePrice } from '@/app/helpers/getPackagePrice';
import { isNull } from '@/app/helpers/isNull';
import { getExchangeRates } from '@/api/currency/currency';

export async function getCommissionsTurbor({
  order,
  brand,
  invoice,
  product,
  orderBrandDetails,
  orderParentBrandDetails,
  productBrandDetails,
  productParentBrandDetails,
  masterBrandDetails,
}: {
  order: OrderType;
  brand: BrandType;
  product: DataType;
  invoice: CheckOutDataType;
  orderBrandDetails: _SettlementBrandDetailsModel;
  orderParentBrandDetails: _SettlementBrandDetailsModel;
  productBrandDetails: _SettlementBrandDetailsModel;
  productParentBrandDetails: _SettlementBrandDetailsModel;
  masterBrandDetails: _SettlementBrandDetailsModel;
}): Promise<{
  orderBrandCommission: _SettlementBrandDetailsModel;
  orderParentBrandCommission: _SettlementBrandDetailsModel;
  productBrandCommission: _SettlementBrandDetailsModel;
  productParentBrandCommission: _SettlementBrandDetailsModel;
  masterBrandCommission: _SettlementBrandDetailsModel;
}> {
  let orderBrandCommission: _SettlementBrandDetailsModel | any = {};
  let orderParentBrandCommission: _SettlementBrandDetailsModel | any = {};
  let productBrandCommission: _SettlementBrandDetailsModel | any = {};
  let productParentBrandCommission: _SettlementBrandDetailsModel | any = {};
  let masterBrandCommission: _SettlementBrandDetailsModel | any = {};

  try {
    const rates = await getExchangeRates();

    //process order brand and parent
    let originalPrice = Number(product.originalPrice ?? 0);
    let preOriginalPrice = ((product.reseller_discount ?? 0) / 100) * (product.originalPrice ?? 0);

    originalPrice = originalPrice - preOriginalPrice;

    let orderBrandCommissionAmount =
      ((product.sellerProfit ?? 0) / 100) * Number(product.originalPrice);

    let orderParentBrandCommissionAmount =
      ((orderParentBrandDetails.sales_commission ?? 0) / 100) * (orderBrandCommissionAmount ?? 0);
    orderBrandCommissionAmount = orderBrandCommissionAmount - orderParentBrandCommissionAmount;

    orderBrandCommission = await finalizeCommissions({
      commissionData: orderBrandDetails,
      rates,
      amount: orderBrandCommissionAmount,
      orderCurrency: invoice.currency,
    });

    orderParentBrandCommission = await finalizeCommissions({
      commissionData: orderParentBrandDetails,
      rates,
      amount: orderParentBrandCommissionAmount,
      orderCurrency: invoice.currency,
    });

    //process product brand and parent
    let productBrandCommissionAmount = originalPrice ?? 0;

    let productParentBrandCommissionAmount =
      ((productParentBrandDetails.sales_commission ?? 0) / 100) *
      (productBrandCommissionAmount ?? 0);

    productBrandCommissionAmount =
      productBrandCommissionAmount - productParentBrandCommissionAmount;

    productBrandCommission = await finalizeCommissions({
      commissionData: productBrandDetails,
      rates,
      amount: productBrandCommissionAmount,
      orderCurrency: invoice.currency,
    });

    productParentBrandCommission = await finalizeCommissions({
      commissionData: productParentBrandDetails,
      rates,
      amount: productParentBrandCommissionAmount,
      orderCurrency: invoice.currency,
    });

    ///
    const commissions = {
      orderBrandCommission,
      orderParentBrandCommission,
      productBrandCommission,
      productParentBrandCommission,
      masterBrandCommission,
    };

    return commissions;
  } catch (error) {
    console.error(error);
    const commissions = {
      orderBrandCommission,
      orderParentBrandCommission,
      productBrandCommission,
      productParentBrandCommission,
      masterBrandCommission,
    };
    return commissions;
  }
}

export async function finalizeCommissions({
  commissionData,
  rates,
  amount,
  orderCurrency,
}: {
  commissionData: _SettlementBrandDetailsModel;
  rates: any;
  amount: number;
  orderCurrency: string;
}) {
  let data = { ...commissionData };

  const commission = await convertCur({
    amount: parseFloat(String(amount || '0')),
    rates,
    fromCurrency: orderCurrency,
    toCurrency: commissionData?.currencyCode!,
  });

  data.commission = commission;
  data.commissionStatus = false;

  return data;
}

export async function calculateFinalPrice({
  product,
  invoice,
  order,
  siteInfo,
  rates,
}: {
  product: DataType;
  invoice: CartItem;
  order: OrderType;
  siteInfo: BrandType;
  rates: any;
}) {
  if ([isNull(product), isNull(siteInfo), isNull(rates)].includes(true)) {
    const missing = findMissingFields({
      product,
      siteInfo,
      rates,
    });
    throw Error(missing + ' are null in calclulateFinalPrice');
  }

  let price = (product.price ?? 0) * (order?.quantity ?? 1);
  let originalPrice = (product.originalPrice ?? 0) * (order?.quantity ?? 1);

  if (product.type === 'package') {
    let packPrice = getPackagePrice({ discount: 0, duration: order.duration as any, price });
    if (!packPrice.ok) throw Error('price not ok');

    price = packPrice.price;

    let orginalPackPrice = getPackagePrice({
      discount: 0,
      duration: order.duration as any,
      price: originalPrice,
    });
    if (!orginalPackPrice.ok) throw Error('price not ok');

    originalPrice = orginalPackPrice.price;
  } else if (['airtime', 'electric'].includes(product?.type ?? '')) {
    price = price * (order.amount ?? 0);
    originalPrice = originalPrice * (order.amount ?? 0);
  }

  if ((price < 1 || originalPrice < 1) && !product.isFree) throw Error('price not okay');

  price = await convertCur({
    amount: price,
    fromCurrency: product.currency ?? '',
    toCurrency: invoice.currency,
    rates: { ...order.rates, ...invoice.rates },
  });

  originalPrice = await convertCur({
    amount: originalPrice,
    fromCurrency: product.currency ?? '',
    toCurrency: invoice.currency,
    rates: { ...order.rates, ...invoice.rates },
  });

  return {
    price: price * Math.max(1, order.quantity ?? 1),
    originalPrice: originalPrice * Math.max(1, order.quantity ?? 1),
    ok: true,
  };
}

export async function priced({ product, siteInfo }: { product: DataType; siteInfo: BrandType }) {
  let newProduct = { ...product }; // Create a copy to avoid mutating the original

  // Safely convert price to number with a fallback to 0
  newProduct.originalPrice = Number(product.price) || 0;

  if (product.parentId || product.serviceType === 'utility') {
    // Safely convert reseller_discount to number with a fallback to 0
    const reseller_discount = Number(product.reseller_discount || 0);
    const resellerData = product.rules || {};
    const reseller = resellerData.reseller || {};

    // Check if reseller exists and product.price is valid
    if (reseller && product.price) {
      // Calculate resellerValue, ensuring it's a valid number
      const resellerValue = Number(
        `${reseller.direction === 'decrease' ? '-' : ''}${reseller.value || 0}`,
      );

      // Ensure we have a valid number for sellerMargin calculation
      const sellerMargin = Math.abs(Math.max(-reseller_discount, Math.min(resellerValue, 100)));

      let sellerProfit = 0;
      // Safely convert product.price to number
      const productPrice = Number(product.price) || 0;

      if (reseller.direction === 'decrease') {
        const finalDiscountAmount = (sellerMargin / 100) * productPrice;
        newProduct.price = productPrice - Math.abs(finalDiscountAmount);
        sellerProfit = Math.max(0, reseller_discount - sellerMargin);
      } else {
        sellerProfit = reseller_discount + sellerMargin;
        const sellerMarginAmount = ((sellerMargin || 0) / 100) * productPrice;
        newProduct.price = productPrice + sellerMarginAmount;
      }

      newProduct.sellerProfit = sellerProfit;
    }
  }

  return newProduct;
}
