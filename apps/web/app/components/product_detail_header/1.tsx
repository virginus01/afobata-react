'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { FaFacebook, FaShoppingCart, FaWhatsapp } from 'react-icons/fa';
import { FaTwitter } from 'react-icons/fa6';
import { CustomButton } from '@/app/widgets/custom_button';
import Link from 'next/link';
import { useCart } from '@/app/contexts/cart_context';
import { convertCurrency } from '@/app/helpers/convertCurrency';
import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/app/helpers/isNull';
import { randomNumber } from '@/app/helpers/randomNumber';
import { show_error } from '@/app/helpers/show_error';
import { masterUserData } from '@/app/data/master';
import { toast } from 'sonner';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';
import { useBaseContext } from '@/app/contexts/base_context';

// Desktop Image Gallery Component
const DesktopGallery = ({
  images,
  currentImage,
  setCurrentImage,
}: {
  images: any[];
  currentImage: any;
  setCurrentImage: any;
}) => {
  if (isNull(images)) return;

  return (
    <div className="hidden sm:block">
      <div className="relative mb-2">
        <div className="relative h-96 w-full">
          <Image
            src={images[currentImage]}
            alt="Product Image"
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <WishlistButton />
      </div>

      <div className="flex items-center">
        <GalleryNavigationButton
          direction="prev"
          onClick={() =>
            setCurrentImage((prev: any) => (prev === 0 ? images.length - 1 : prev - 1))
          }
        />

        <div className="flex overflow-x-auto space-x-2 py-2">
          {images.map((img, index) => (
            <ThumbnailImage
              key={index}
              image={img}
              index={index}
              isActive={index === currentImage}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </div>

        <GalleryNavigationButton
          direction="next"
          onClick={() =>
            setCurrentImage((prev: any) => (prev === images.length - 1 ? 0 : prev + 1))
          }
        />
      </div>
    </div>
  );
};

// Mobile Image Gallery Component
const MobileGallery = ({ images, currentImage }: { images: any[]; currentImage: any }) => {
  if (isNull(images)) return;
  return (
    <div className="sm:hidden relative mb-4">
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory w-full">
        {images.map((image, i) => (
          <div
            key={i}
            className={`snap-center flex-shrink-0 ${
              images.length > 1 ? 'w-5/6' : 'w-full'
            } relative h-60 mx-2 bg-white shadow-lg border`}
          >
            <Image
              src={image}
              alt={`Product Image ${i + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
            <WishlistButton />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 mx-1 rounded-full ${
              i === currentImage ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Wishlist Button Component
const WishlistButton = () => (
  <button
    className="absolute top-2 right-2 text-orange-500 hover:text-orange-600"
    aria-label="Add to wishlist"
  >
    <Heart size={24} />
  </button>
);

// Gallery Navigation Button Component
const GalleryNavigationButton = ({ direction, onClick }: { direction: any; onClick: any }) => (
  <button
    className={`p-1 bg-gray-200 rounded-full ${direction === 'prev' ? 'mr-2' : 'ml-2'}`}
    onClick={onClick}
  >
    {direction === 'prev' ? '\u003C' : '\u003E'}
  </button>
);

// Thumbnail Image Component
const ThumbnailImage = ({
  image,
  index,
  isActive,
  onClick,
}: {
  image: any;
  index: any;
  isActive: any;
  onClick: any;
}) => {
  if (isNull(image)) return;
  return (
    <div
      className={`w-16 h-16 border-2 cursor-pointer ${
        isActive ? 'border-orange-500' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="relative h-full w-full">
        <Image src={image} alt={`Product thumbnail ${index + 1}`} layout="fill" objectFit="cover" />
      </div>
    </div>
  );
};

// Social Share Component
const SocialShare = () => (
  <div className="mt-4">
    <p className="text-gray-700 font-medium mb-2">SHARE THIS PRODUCT</p>
    <div className="flex space-x-2">
      <SocialButton icon={<FaFacebook size={16} />} />
      <SocialButton icon={<FaTwitter size={16} />} />
      <SocialButton icon={<FaWhatsapp size={16} />} />
    </div>
  </div>
);

// Social Button Component
const SocialButton = ({ icon }: { icon: any }) => (
  <button className="p-2 border border-gray-300 rounded-full">{icon}</button>
);

// Product Header Component
const ProductHeader = ({ product }: { product: any }) => (
  <div>
    <PromoBanner text={product.promo} />
    <h1 className="text-xl font-semibold text-gray-800 mb-4">{product.title}</h1>
  </div>
);

// Promo Banner Component
const PromoBanner = ({ text }: { text: any }) => (
  <div className="bg-purple-500 text-white text-xs py-0.5 px-1 rounded inline-block mb-2">
    {text}
  </div>
);

// Product Price Component
const ProductPrice = ({
  current,
  original,
  discount,
  currency,
}: {
  current: any;
  original: any;
  discount: any;
  currency: CurrencyType;
}) => (
  <div className="flex items-center mb-2">
    <span className="text-2xl font-bold">{curFormat(current, currency.currencySymbol)}</span>
    <span className="text-gray-500 line-through ml-2">
      {curFormat(original, currency.currencySymbol)}
    </span>
    <span className="text-orange-500 ml-2">-{discount}%</span>
  </div>
);

// Stock Status Component
const StockStatus = ({ status }: any) => (
  <div className="text-amber-600 font-medium mb-2">{status}</div>
);

// Shipping Info Component
const ShippingInfo = ({ cost, location }: any) => (
  <div className="text-gray-700 mb-4">
    + shipping from <span className="font-medium">₦ {cost}</span> to {location}
  </div>
);

// Product Rating Component
const ProductRating = ({ stars, count, verified }: any) => (
  <div className="flex items-center mb-4">
    <div className="flex text-yellow-400">
      {[...Array(stars)].map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
    <span className="text-blue-600 ml-2">
      ({count} {verified ? 'verified' : ''} rating)
    </span>
  </div>
);

// Size Selection Component
const SizeSelection = ({ variation }: any) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <div className="font-medium text-gray-700">VARIATION AVAILABLE</div>
      <a href="#" className="text-blue-600">
        Size Guide
      </a>
    </div>
    <div className="mb-6">
      <div className="border border-orange-500 text-orange-500 py-2 px-4 rounded inline-block">
        {variation}
      </div>
    </div>
  </div>
);

// Add To Cart Button Component
const AddToCartButton = ({
  product,
  siteInfo,
  auth,
}: {
  product: DataType;
  siteInfo: BrandType;
  auth: AuthModel;
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState({});
  const {
    addToCart,
    setCartSidebarOpen,

    currency,
    cart,
    decreaseQuantity,
    increaseQuantity,
    removeFromCart,
  } = useCart();

  const rates: any = {};

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      let currentUser: UserTypes = userData;

      let oCS = '';
      let oC = '';
      let orderValue = values?.price.current;

      oC = currency.currencyCode ?? masterUserData?.currencyInfo?.currencyCode ?? '';
      oCS = currency.currencySymbol ?? masterUserData?.currencyInfo?.currencySymbol ?? '';

      const id = randomNumber(8);
      const orderId = Date.now().toString();
      const item: CartItem = {
        id: orderId,
        productId: values.id,
        sellerId: siteInfo.id!,
        customerId: Number(id),
        title: `${product.title}`,
        orderValue: orderValue ?? 0,
        managers: [values?.userId ?? ''],
        amount: parseFloat(values?.price.current),
        productPrice: values?.price.current,
        currency: product.currency ?? '',
        orderCurrencySymbol: oCS ?? '',
        orderCurrency: oC ?? '',
        symbol: product.currencySymbol ?? '',
        type: product.type ?? '',
        slug: orderId,
        quantity: 1,
        parentBrandId: values.parentBrandId,
        others: {
          partner: values?.partner,
        },
        rates: {
          [oC.toUpperCase()]: rates[oC!.toUpperCase()],
          [product?.currency!.toUpperCase()]: rates[product?.currency!.toUpperCase()],
        },
        sp: siteInfo.id,
      };

      addToCart(item);
    } catch (error: any) {
      toast.error('An error occurred while submitting the form');
      show_error('Error submitting form', error.toString(), true);
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const item: CartItem = cart.find((c) => c.productId === product?.id) ?? ({} as any);

  if (!isNull(item)) {
    return (
      <div className="my-5">
        <div className="flex items-center space-x-4">
          <CustomButton
            className="w-8 h-7"
            disabled={item.quantity === 1 || item.type !== 'physical'}
            onClick={() => decreaseQuantity(item.id!)}
          >
            -
          </CustomButton>
          <span className="mx-2">{item.quantity}</span>
          <CustomButton
            className="w-8 h-7"
            onClick={() => increaseQuantity(item.id!)}
            disabled={item.type !== 'physical'}
          >
            +
          </CustomButton>

          <CustomButton className="bg-red-500 w-8 h-7" onClick={() => removeFromCart(item.id!)}>
            x
          </CustomButton>
          <CustomButton
            onClick={() => setCartSidebarOpen(true)}
            className="h-7 w-full"
            icon={<FaShoppingCart className="w-4 h-4" />}
          >
            Checkout
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:my-4 flex p-2 !bg-transparent md:sticky md:bottom-0 md:left-0 fixed bottom-0 left-0 z-10 ">
      <CustomButton
        onClick={() => onSubmit(product)}
        className="h-10 w-full"
        icon={<FaShoppingCart className="w-4 h-4" />}
      >
        Add to cart
      </CustomButton>
    </div>
  );
};

// Promotions Component
const Promotions = ({ promotions, siteInfo }: { promotions: any[]; siteInfo: BrandType }) => (
  <div>
    <h3 className="font-medium text-gray-800 mb-3">PROMOTIONS</h3>
    <div className="space-y-3">
      <div className="flex items-start animate-pulse">
        <div className="text-orange-500 mr-2">⭐</div>
        <div>
          Do you know that {siteInfo.name} makes money as {`you're`} viewing this product even
          without you buying it?{' '}
          <Link rel="nofollow" target="_blank" className="text-red-600 font-bold" href={''}>
            you too can make same money by joining here
          </Link>
        </div>
      </div>
      {promotions.map((promo: any, index: number) => (
        <div key={index} className="flex items-start">
          <div className="text-orange-500 mr-2">⭐</div>
          <div>{promo}</div>
        </div>
      ))}
    </div>
  </div>
);

// Report Link Component
const ReportLink = () => (
  <div className="mt-4 mb-16 sm:mb-4">
    <a href="#" className="text-blue-600">
      Report incorrect product information
    </a>
  </div>
);

// Main Product Detail Header Component
const ProductDetailHeader = ({
  data,
  siteInfo,
  auth,
  rates,
}: {
  data: DataType;
  siteInfo: BrandType;
  auth: AuthModel;
  rates?: any;
}) => {
  const [currentImage, setCurrentImage] = useState(0);
  const { currency } = useCart();

  let product: any = {
    ...data,

    stock: 'Few units left',
    shipping: {
      cost: 660,
      location: 'LEKKI-AJAH (SANGOTEDO)',
    },
    rating: {
      stars: 5,
      count: 1,
      verified: true,
    },
    variation: 'ONE SIZE FITS ALL',
    promotions: [
      'Call or chat for help',
      `Need extra points? checkout on ${siteInfo.name} Android app.`,
    ],
    promo: 'promo is for a while',
  };

  let convertedPrice = Number(product.price);

  if (!isNull(rates) && !isNull(currency)) {
    convertedPrice = convertCurrency({
      amount: Number(product?.price ?? 0),
      fromCurrency: data?.currency ?? '',
      toCurrency: currency?.currencyCode ?? '',
      rates,
    });
  }

  const discount = ((product.discount ?? 0) / 100) * Number(convertedPrice ?? 0);

  const price = {
    current: Number(convertedPrice),
    original: Number(convertedPrice ?? 0) + discount,
    discount: product.discount ?? 0,
  };
  product.price = price;

  let images: any[] = [];
  let featuredImage = '';
  if (data && data.images) {
    data.images.forEach((image) => {
      if (image.isFeatured) {
        featuredImage = image.publicUrl ?? '';
      } else {
        images.push(image.publicUrl);
      }
    });
  }
  if (featuredImage) {
    images.unshift(featuredImage);
  }
  product.images = images;

  return (
    <div className="p-2 rounded-md shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Images Section */}
        <div className="md:w-2/5">
          <DesktopGallery
            images={product.images}
            currentImage={currentImage}
            setCurrentImage={setCurrentImage}
          />

          <MobileGallery images={product.images} currentImage={currentImage} />

          <SocialShare />
        </div>

        {/* Product Info Section */}
        <div className="md:w-3/5">
          <ProductHeader product={product} />

          <ProductPrice
            current={product.price.current}
            original={product.price.original}
            discount={product.price.discount}
            currency={currency}
          />

          {product.type === 'physical' && <StockStatus status={product.stock} />}

          {product.type === 'physical' && (
            <ShippingInfo cost={product.shipping.cost} location={product.shipping.location} />
          )}

          <ProductRating
            stars={product.rating.stars}
            count={product.rating.count}
            verified={product.rating.verified}
          />

          {product.type === 'physical' && <SizeSelection variation={product.variation} />}

          <AddToCartButton product={product} siteInfo={siteInfo} auth={auth} />

          <Promotions promotions={product.promotions} siteInfo={siteInfo} />

          <ReportLink />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailHeader;
