'use client';
import React, { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { RaisedButton } from '@/app/widgets/raised_button';
import { useCart } from '@/app/contexts/cart_context';
import { convertCurrency } from '@/app/helpers/convertCurrency';
import { curFormat } from '@/app/helpers/curFormat';

import Image from 'next/image';
import ProductInhouseAds from '@/app/special_widgets/ads/product_inhouse';
import { getRuleValueTubor } from '@/app/helpers/getRuleValueTubor';

interface DigitalProductProps {
  data: ProductTypes;
  siteInfo: BrandType;
  auth: AuthModel;
  rates?: any;
}

const DigitalProduct = ({ data, siteInfo, auth, rates }: DigitalProductProps) => {
  const { addToCart, currency, cart } = useCart();

  const handleAddToCart = (
    orderCurrency: string,
    symbol: string,
    convertedPrice: number,
    currentRate: number,
  ) => {
    if (data.id && data.title && data.price) {
      const item: CartItem = {
        id: data.id,
        productId: data.id,
        sellerId: data.userId,
        orderValue: convertedPrice,
        title: data.title,
        amount: convertedPrice,
        productPrice: data.price,
        currency: data?.currency!,
        orderCurrency: currency.currencyCode!,
        symbol: data.currencySymbol!,
        orderCurrencySymbol: currency.currencySymbol!,
        quantity: 1,
        type: data.type!,
        slug: data?.slug!,
        paymentGateway: currency.gateway!,
      } as any;

      addToCart(item);
    } else {
      console.error('Product data is incomplete');
    }
  };

  const discounted = ((data.formerPrice || 0) / 100) * (data.price || 0);

  let price = (data.price || 0) - discounted;

  const fP = getRuleValueTubor({
    rules: siteInfo.rules!,
    value: price!,
    id: data.type!,
    sellerProfit: data.reseller_profit || 0,
  });

  price = price + fP.value;

  price = convertCurrency({
    amount: parseFloat(String(price || '0')),
    rates,
    fromCurrency: data?.currency!,
    toCurrency: currency?.currencyCode!,
  });

  //for former price

  const fPF = getRuleValueTubor({
    rules: siteInfo.rules!,
    value: (data.price || 0)!,
    id: data.type!,
    sellerProfit: data.reseller_profit || 0,
  });

  const formerPriceValue = (data.price || 0) + fPF.value;

  const formerPrice = convertCurrency({
    amount: parseFloat(String(formerPriceValue || '0')),
    rates,
    fromCurrency: data.currency!,
    toCurrency: currency?.currencyCode!,
  });

  return (
    <section className="m-0">
      <div className="border-b-2 border-gray-300">
        <div className="bg-white dark:bg-gray-800 py-8 text-sm sm:text-lg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row -mx-4">
              <div className="md:flex-1 px-4">
                <div className="h-[460px] rounded-lg bg-gray-300 dark:bg-gray-700 mb-4">
                  <Image
                    className="w-full h-full object-cover"
                    src={data.image || '/images/placeholder.png'}
                    alt="Product Image"
                    width={1000}
                    height={1000}
                  />
                </div>
              </div>
              <div className="md:flex-1 px-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {data.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Sold by: {data?.user?.username}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Product ID: {data.id}
                  </p>
                  <div className="flex mb-4">
                    <div className="mr-4">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Price:</span>
                      <span className="ml-3 text-gray-600 dark:text-gray-300">
                        {formerPrice && <s>{curFormat(formerPrice, currency.currencySymbol)}</s>}
                        <span className="ml-1">{curFormat(price, currency.currencySymbol)}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-green-600 dark:text-green-500">In Stock</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Short Description:
                    </span>
                    <blockquote className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                      This is a short description. This is on our to-do list and will be implemented
                      as soon as possible.
                    </blockquote>
                  </div>
                </div>
                <div className="sm:mt-auto mt-10 flex flex-row justify-between items-center">
                  <div className="text-3xl font-extrabold">
                    {curFormat(price, currency.currencySymbol)}
                  </div>
                  <div className="flex space-x-4">
                    <RaisedButton
                      size="lg"
                      color="auto"
                      icon={<FaShoppingCart />}
                      iconPosition="before"
                      onClick={() => {
                        handleAddToCart(
                          currency?.currencyCode!,
                          currency?.currencySymbol!,
                          price,
                          0,
                        );
                      }}
                    >
                      <div className="mx-2 font-extrabold">BUY NOW</div>
                    </RaisedButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="my-10 mx-5 sm:mx-20">
        <ProductInhouseAds />
        <div dangerouslySetInnerHTML={{ __html: data.body! }}></div>
      </div>
    </section>
  );
};

export { DigitalProduct };
