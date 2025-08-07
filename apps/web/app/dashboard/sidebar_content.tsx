import { useBaseContext } from '@/app/contexts/base_context';
import { copyToClipboard } from '@/app/helpers/text';
import { isNull } from '@/app/helpers/isNull';
import { CustomButton } from '@/app/widgets/widgets';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';
import { CheckIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';
import CustomCard from '@/app/widgets/custom_card';
import OrderSideDetails from '@/dashboard/crud/crud_actions/order';
import OrderSideActions from '@/dashboard/crud/crud_actions/actions/order_actions';
import ProductSideDetails from '@/dashboard/crud/crud_actions/products';
import ProductSideActions from '@/dashboard/crud/crud_actions/actions/product_actions';

const SideBarActions: React.FC<any> = ({
  id,
  data,
  base,
  action,
  siteInfo,
  user,
  onClose,
  onDelete,
}: {
  data: any;
  base: string;
  action?: string;
  siteInfo: BrandType;
  user: UserTypes;
  id?: string;
  onClose: () => void;
  onDelete: () => void;
}) => {
  const router = useRouter();
  const { addRouteData } = useBaseContext();
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState('');
  const [item, setItem] = useState(data);
  const [stop, setStop] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    referenceId: string;
    invoice: CheckOutDataType;
    orders: OrderType;
    siteInfo: BrandType;
  }>({} as any);

  useLayoutEffect(() => {
    if (['product', 'digital', 'package', 'phyiscal', 'course'].includes(data.type)) {
      setCategory('product');
    } else if (['airtime', 'data', 'tv', 'electric'].includes(data.type)) {
      setCategory('order');
    }
    setItem(data);
  }, [data]);

  if (isNull(data)) {
    return;
  }

  const handleCopy = (text: string) => {
    copyToClipboard(text, () => {
      setCopied(true);
      toast.success('copied');
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="mt-5 ml-2">
      <div className="flex flex-col sm:flex-row space-y-4 space-x-0 sm:space-y-0 sm:space-x-2 w-full">
        <div className="w-full sm:w-3/4">
          <CustomCard
            title="Details"
            topRightWidget={
              <CustomButton onClick={() => handleCopy(data.id || '')} className="text-xs w-5 h-5">
                {copied ? <CheckIcon className="h-3 w-3 " /> : <Copy className="h-3 w-3" />}
              </CustomButton>
            }
            childrenClass="inset-0 p-0 m-0"
          >
            {category === 'product' && <ProductSideDetails product={data} />}
            {category === 'order' && <OrderSideDetails order={data} user={user} />}
          </CustomCard>
        </div>
        <div className="w-full sm:w-1/4">
          {category === 'product' && (
            <ProductSideActions
              item={data}
              base={base}
              siteInfo={siteInfo}
              onDelete={onDelete}
              user={user}
              onClose={onClose}
            />
          )}
          {category === 'order' && (
            <OrderSideActions
              item={item}
              setItem={(item) => setItem(item)}
              base={base}
              siteInfo={siteInfo}
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBarActions;
