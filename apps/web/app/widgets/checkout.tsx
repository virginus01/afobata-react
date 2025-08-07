import { useEffect, useState } from 'react';
import usePastack from '@/app/lib/payment_gateways/paystack';
import { api_update_order } from '@/app/routes/api_routes';
import { useCart } from '@/app/contexts/cart_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import useFlutterwave from '@/app/lib/payment_gateways/flutterwave';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { clearCache } from '@/app/actions';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

interface ModalProps {
  gateway: PaymentOptionsType;
  onClose: () => void;
  onCompleted: (data: any) => void;
  siteInfo: BrandType;
}

const Checkout = ({ onClose, onCompleted, gateway, siteInfo }: ModalProps) => {
  const { isCheckOutOpen, checkOutData, setCartSidebarOpen, setCheckOutOpen, setCart } = useCart();
  const [responseData, setResponseData] = useState<any | null>(null);
  const [isFree, setIsFree] = useState(false);
  const { refreshPage } = useDynamicContext();

  const handleOnCompleted = (response: any) => {
    setResponseData(response);
  };

  const handleOnClose = () => {
    onClose();
    setCheckOutOpen(false);
  };

  const paystackProps = usePastack({
    isOpen: gateway.sp === 'paystack' && isCheckOutOpen && checkOutData?.subTotal! > 0,
    data: checkOutData!,
    onClose: handleOnClose,
    onCompleted: handleOnCompleted,
    siteInfo,
    channels: gateway.channels ?? (['bank_transfer'] as any),
  });

  const flutterwaveProps = useFlutterwave({
    isOpen: gateway.sp === 'flutterwave' && isCheckOutOpen && checkOutData?.subTotal! > 0,
    data: checkOutData!,
    onClose: handleOnClose,
    onCompleted: handleOnCompleted,
  });

  useEffect(() => {
    const updateOrder = async () => {
      if (!responseData) return;

      const url = await api_update_order({ subBase: siteInfo.slug });
      const formData = {
        referenceId: responseData.reference || responseData.tx_ref,
        status: responseData.status || 'pending',
        paymentReference: responseData.reference || '',
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: await modHeaders('post'),
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          console.error('Error updating order network not ok', response.statusText);
          onClose();
          return;
        }

        const res = await response.json();
        refreshPage(['user']);
        onCompleted({
          orders: res?.data?.orders ?? [],
          invoice: {
            ...checkOutData,
            ...formData,
            status: responseData.status === 'success' ? 'paid' : responseData.status,
            createdAt: convertDateTime(),
          },
          referenceId: formData.referenceId,
          siteInfo,
        });
      } catch (error) {
        console.error('update order error:', error);
        onClose();
      }
    };

    updateOrder();
  }, [
    responseData,
    onClose,
    onCompleted,
    setCart,
    setCartSidebarOpen,
    siteInfo.slug,
    checkOutData,
    siteInfo,
  ]);

  useEffect(() => {
    if (checkOutData?.subTotal === 0) {
      setResponseData({
        reference: checkOutData.referenceId,
        status: 'success',
      });
      setIsFree(true);
    }
  }, [checkOutData]);

  // Return the appropriate component based on gateway
  if (gateway.sp === 'paystack') {
    return paystackProps;
  } else if (gateway.sp === 'flutterwave') {
    return flutterwaveProps;
  }

  return null;
};

export default Checkout;
