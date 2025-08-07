import { generateConfig } from '@/dashboard/config';
import { useState } from 'react';
import MenusPage from '@/dashboard/appearance/menus/menus';
import { toast } from 'sonner';
import { api_crud } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useUserContext } from '@/app/contexts/user_context';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import TranslationPage from '@/dashboard/appearance/translation/translation_page';

interface AppearanceIndexProps {
  params: { action: string; base: string; seg1: string };
  siteInfo: any;
  user: any;
  auth: any;
  categories: CategoryModel[];
  type?: string;
  status?: string;
  id?: string;
  defaultData?: any[] | any;
  searchParams: any;
  baseData: BaseDataType;
}

const AppearanceIndex: React.FC<AppearanceIndexProps> = ({
  params,
  siteInfo,
  user,
  auth,
  categories,
  defaultData,
  type,
  status,
  searchParams,
  id,
  baseData,
}) => {
  const { updateEssentialData, essentialData } = useUserContext();
  const { refreshPage } = useDynamicContext();
  const [config, setConfig] = useState(
    generateConfig(user, type, status)[params.base] || { columns: [], conditions: {} },
  );

  const onSubmit = async (data?: any) => {
    let bData: any = {};

    switch (data.key) {
      case 'menus':
        bData = {
          id: user?.brand?.id,
          table: 'brands',
          data: { id: user?.brand?.id, menus: data.data },
        };
        break;

      default:
        toast.error('Unknown action');
        return;
    }

    try {
      const url = await api_crud({
        subBase: siteInfo.slug,
        method: 'patch',
        id: user?.brand?.id,
        action: 'crud_patch',
        table: 'brands',
      });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: await modHeaders('patch'),
        body: JSON.stringify(bData),
      });

      if (!response.ok) {
        toast.error('network error');
        return;
      }

      const result = await response.json();

      if (result.status) {
        refreshPage(['user']);

        updateEssentialData({
          ...essentialData,
          brand: { ...essentialData?.brand, menus: data.data },
        } as any);

        toast.success(`saved menus`.toLowerCase());
      } else {
        toast.error('Unknown error occurred');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Try again');
    } finally {
    }
  };

  if (params.action === 'menus') {
    return (
      <MenusPage
        onAction={(data) => {
          onSubmit({ data, key: 'menus' });
        }}
      />
    );
  }

  if (params.action === 'translations') {
    return (
      <TranslationPage
        onAction={(data) => {
          onSubmit({ data, key: 'translations' });
        }}
      />
    );
  }

  return <></>;
};

export default AppearanceIndex;
