import CrudAddorUpdate from '@/dashboard/crud/crud_add_update';
import CrudOverView from '@/dashboard/crud/crud_overview';
import { generateConfig } from '@/dashboard/config';
import { useState } from 'react';
import { isAdmin } from '@/app/helpers/isAdmin';
import { isNull } from '@/app/helpers/isNull';

import { CustomButton } from '@/app/widgets/custom_button';
import { crud_page } from '@/app/routes/page_routes';
import { useBaseContext } from '@/app/contexts/base_context';
import { FaPlus } from 'react-icons/fa';
import PagesIndex from '@/dashboard/pages/pages_index';
import CreateBrand from '@/dashboard/brand/create_brand';

interface CrudDataProps {
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

const CrudData: React.FC<CrudDataProps> = ({
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
  const [config, setConfig] = useState(
    generateConfig(user, type, status)[params.base] || { columns: [], conditions: {} },
  );
  const [cats, setCats] = useState<CategoryModel[]>(categories);

  let tag: string = `${user?.selectedProfile ?? ''}_${siteInfo?.id}`;

  const { addRouteData } = useBaseContext();

  if (isNull(user.brand)) {
    return <CreateBrand siteInfo={siteInfo!} user={user!} />;
  }

  // Add type narrowing and validation for base and action
  const validBase = [
    'posts',
    'products',
    'categories',
    'tags',
    'orders',
    'pages',
    'packages',
  ].includes(params.base);

  if (params.action === 'static' && params.base === 'pages') {
    return (
      <PagesIndex
        existingPages={defaultData as any}
        siteInfo={siteInfo}
        user={user}
        id={''}
        iniSearchParams={searchParams}
        auth={auth}
        params={params}
      />
    );
  }

  const validAction = ['add', 'edit', 'overview', 'drop'].includes(params.action);

  if (!validBase || !validAction) {
    return <div>Invalid route</div>;
  }

  // Handle add/edit routes
  if (['add', 'edit'].includes(params.action)) {
    return (
      <CrudAddorUpdate
        onSave={(savedItem) => {}}
        id={searchParams?.id}
        searchParams={searchParams}
        categories={cats}
        type={type || defaultData?.type || ''}
        params={params}
        user={user!}
        auth={auth!}
        siteInfo={siteInfo!}
        defaultData={defaultData}
        baseData={{ table: params.base, tag } as any}
      />
    );
  }

  const RightButton: React.FC = () => (
    <CustomButton
      className="py-1"
      bordered={false}
      icon={<FaPlus />}
      iconPosition="before"
      onClick={() => {
        addRouteData({
          isOpen: true,
          title: `Add ${params.base}`,
          rates: {},
          type,
          base: params.base,
          action: type === 'package' ? (isAdmin(user) ? 'add' : 'drop') : 'add',
          slug: crud_page({
            type: type,
            base: params.base,
            action: type === 'package' ? (isAdmin(user) ? 'add' : 'drop') : 'add',
            subBase: siteInfo.slug!,
          }),
          isHeightFull: params.base === 'pages' ? 'yes' : 'no',
          isWidthFull: params.base === 'pages' ? 'yes' : 'no',
        });
      }}
    >
      <div className="p-0.5"> {`New ${baseData?.baseData?.title}`}</div>
    </CustomButton>
  );

  return (
    <CrudOverView
      baseData={{ table: params.base, tag } as any}
      type={type!}
      table={params.base}
      status={status!}
      params={params}
      user={user!}
      defaultData={defaultData}
      siteInfo={siteInfo!}
      columns={config.columns}
    />
  );
};

export default CrudData;
