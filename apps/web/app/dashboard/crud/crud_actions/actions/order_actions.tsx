import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import { adminAccess } from '@/app/helpers/isAdmin';
import { isNull } from '@/app/helpers/isNull';
import { api_order_action } from '@/app/routes/api_routes';
import { ConfirmModal } from '@/app/widgets/confirm';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { RefreshCcw, XCircle } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';

export default function OrderSideActions({
  item,
  base,
  siteInfo,
  user,
  setItem,
}: {
  item: OrderType;
  base: string;
  siteInfo: BrandType;
  setItem: (item: OrderType) => void;
  user: UserTypes;
}) {
  const { refreshPage } = useDynamicContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isForceRefund, setIsForceRefund] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState('');
  const isFirstRender = useRef(true);

  const handleAction = async (action: string) => {
    setSubmitting(true);
    let toastId: any = '';

    if (action === 'cancel') {
      toastId = toast.loading('cancelling');
    } else if (action === 'refresh') {
      toastId = toast.loading('refreshing');
    }

    setAction(action);
    try {
      const url = await api_order_action({
        subBase: siteInfo.slug!,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify({ ...item, orderId: item.id, action }),
      });

      if (!response.ok) {
        toast.error('an error occured, contact support');
        return;
      }

      const res = await response.json();
      if (res.status) {
        refreshPage(['users', 'user', 'orders']);
        toast.success(res.msg);
        if (!isNull(res.data)) {
          setItem(res.data);
        }
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error('error while deting');
    } finally {
      setSubmitting(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <CustomCard
      title="Action"
      topRightWidget={
        <div className="h-4 w-4">
          <CustomButton
            disabled={submitting}
            onClick={() => handleAction('refresh')}
            className="bg-transparent text-xs text-gray-500"
          >
            <RefreshCcw className="h-3 w-3" />
          </CustomButton>
        </div>
      }
    >
      <div className="flex flex-col space-y-4">
        <CustomButton
          disabled={!['paid', 'processing', 'processed'].includes(item.status ?? '')}
          submitting={action === 'cancel' && submitting}
          submittingText="Canceling & Refunding"
          style={1}
          className="h-7 w-auto rounded-sm text-xs"
          icon={<XCircle className="h-4 w-4" />}
          onClick={() => setIsModalVisible(true)}
        >
          Cancel & Refund
        </CustomButton>

        {adminAccess(user) && (
          <CustomButton
            submitting={action === 'cancel_force' && submitting}
            disabled={item.status === 'refunded'}
            submittingText="Canceling & Refunding"
            style={1}
            className="h-7 w-auto rounded-sm text-xs"
            icon={<XCircle className="h-4 w-4" />}
            onClick={() => setIsForceRefund(true)}
          >
            Force Refund
          </CustomButton>
        )}
      </div>
      {isModalVisible && (
        <ConfirmModal
          info={`Are you sure you want to cancel and refund ${item.title}?`}
          onContinue={() => {
            setIsModalVisible(false);
            handleAction('cancel');
          }}
          onCancel={() => {
            setIsModalVisible(false);
          }}
          url=""
          headerText="Confirm"
        />
      )}

      {isForceRefund && (
        <ConfirmModal
          info={`Are you sure you want to cancel and force refund ${item.title}?`}
          onContinue={() => {
            setIsForceRefund(false);
            handleAction('cancel_force');
          }}
          onCancel={() => {
            setIsForceRefund(false);
          }}
          url=""
          headerText="Confirm"
        />
      )}
    </CustomCard>
  );
}
