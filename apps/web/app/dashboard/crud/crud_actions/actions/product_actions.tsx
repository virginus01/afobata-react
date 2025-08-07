import { clearCache } from '@/app/actions';
import { useBaseContext } from '@/app/contexts/base_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import { brandBaseUrl } from '@/app/helpers/brandBaseUrl';
import { api_crud } from '@/app/routes/api_routes';
import { crud_page } from '@/app/routes/page_routes';
import indexedDB from '@/app/utils/indexdb';
import { ConfirmModal } from '@/app/widgets/confirm';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { Edit, Eye, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function ProductSideActions({
  item,
  base,
  siteInfo,
  onClose,
  onDelete,
  user,
}: {
  item: ProductTypes;
  base: string;
  siteInfo: BrandType;
  onClose: () => void;
  onDelete: () => void;
  user: UserTypes;
}) {
  const { addRouteData } = useBaseContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const url = await api_crud({
        subBase: siteInfo.slug!,
        method: 'delete',
        action: 'crud_delete',
        id: item.id ?? '',
        userId: user.id,
        table: 'products',
      });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: await modHeaders('delete'),
      });

      const res = await response.json();
      if (res.status) {
        clearCache('products');
        let tag: string = `${user?.selectedProfile ?? ''}_${siteInfo?.id}`;
        indexedDB.deleteItem({ table: 'products', tag, itemId: item?.id ?? '' });
        toast.success('deleted');
        onDelete();
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error('error while deting');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CustomCard title="Action">
      <div className="flex flex-col space-y-4">
        <CustomButton
          className="h-7 w-auto text-xs"
          style={1}
          icon={<Edit className="h-4 w-4" />}
          onClick={() => {
            addRouteData({
              isOpen: true,
              action: 'edit',
              base,
              type: item.type!,
              title: item.title || '',
              defaultData: item,
              searchParams: { id: item.id ?? '', type: item.type! },
              rates: {},
              slug: crud_page({
                action: 'edit',
                base,
                type: item.type!,
                subBase: siteInfo.slug || '',
                id: item.id,
              }),
              id: item.id,
            });

            onClose();
          }}
        >
          Edit
        </CustomButton>
        <CustomButton
          className="h-7 w-auto rounded-sm text-xs"
          style={3}
          icon={<Eye className="h-4 w-4" />}
          onClick={() => {
            if (navigator.onLine) {
              window.open(brandBaseUrl({ siteInfo, user, slug: item.slug }), '_blank');
            } else {
              toast.error('You are offline.');
            }
          }}
        >
          View
        </CustomButton>

        <CustomButton
          submitting={isDeleting}
          submittingText="Deleting"
          style={5}
          className="h-7 w-auto rounded-sm text-xs"
          icon={<Trash className="h-4 w-4" />}
          onClick={() => setIsModalVisible(true)}
        >
          Delete
        </CustomButton>
      </div>
      {isModalVisible && (
        <ConfirmModal
          info={`Are you sure you want to delete ${item.title}?`}
          onContinue={() => {
            setIsModalVisible(false);
            handleDelete();
          }}
          onCancel={() => {
            setIsModalVisible(false);
          }}
          url=""
          headerText="Confirm"
        />
      )}
    </CustomCard>
  );
}
