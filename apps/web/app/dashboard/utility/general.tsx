import CustomCard from '@/app/widgets/custom_card';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import TvAndElectric from '@/dashboard/utility/tv_electric';
import DataAndAirtime from '@/dashboard/utility/data_airtime';
import { convertCommaToArray } from '@/app/helpers/convertCommaToArray';
import { pluralize } from '@/app/helpers/pluralize';
import CardSelect from '@/app/widgets/card_select';

const General = ({
  wallets,
  setValue,
  methods,
  params,
  errors,
  siteInfo,
  user,
  auth,
  sps,
  products,
  product,
  setSubTotal,
}: {
  wallets?: WalletTypes[];
  setValue: (name: string, value: any) => void;
  methods: UseFormReturn<any>;
  sps: ServiceProviderTypes[];
  products: ProductTypes[];
  product: ProductTypes;
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
  setSubTotal: (setSubTotal: number) => void;
  params: {
    action: string;
    base: string;
    seg1: string;
  };
  errors: any;
}) => {
  const spId = useWatch({ control: methods.control, name: 'spId' });
  const productId = useWatch({ control: methods.control, name: 'productId' });
  const customerIds = useWatch({ control: methods.control, name: 'customerIds' });
  const convertedIds = convertCommaToArray(customerIds ?? ' ');

  const spOptions = useMemo(() => {
    const type = params.action === 'airtime' ? 'data' : params.action;
    return sps.filter((p) => p.type === type);
  }, [sps, params.action]);

  return (
    <CustomCard
      title="Basic"
      topRightWidget={
        <SearchableSelect
          className="w-2/4 h-6 inset-0"
          labelClass="brand-bg brand-text"
          name="country"
          onSelect={(e: any) => {
            setValue('country', e);
          }}
          label=""
          id="country"
          items={[{ label: 'Nigeria', value: 'ng' }] as any}
          showSearch={false}
          defaultValues={['ng']}
          animate={false}
        />
      }
      bottomWidget={
        <div className="flex justify-end text-xs">
          {convertedIds.length} phone {pluralize('number', convertedIds.length)} valid
        </div>
      }
    >
      <div className="flex flex-col space-y-6 h-full items-center w-full">
        {['data', 'airtime', 'education'].includes(params.action) ? (
          <>
            <CardSelect
              serviceProviders={spOptions as any}
              spId={spId}
              onSelect={(v: any) => {
                if (spId !== v) {
                  setValue('spId', v);
                  setValue('productId', '');
                }
              }}
            />
          </>
        ) : (
          <SearchableSelect
            className="w-full sm:w-2/4"
            onSelect={(v: any) => {
              if (spId !== v) {
                setValue('spId', v);
                setValue('productId', '');
              }
            }}
            label={'Service Provider'}
            id="spId"
            name="spId"
            controlled={true}
            items={spOptions as any}
            defaultValues={[spId]}
          />
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center w-full py-2.5">
          <SearchableSelect
            className="w-full sm:w-2/4"
            onSelect={(v: any) => {
              if (productId !== v) {
                setValue('productId', v);
              }
            }}
            label={'Product'}
            id="productId"
            name="productId"
            controlled={true}
            items={products as any}
            defaultValues={[productId]}
            emptyText="Please select a service provider if you haven't or wait a few moment for products to load"
          />
        </div>

        {['data', 'airtime'].includes(params.action) && (
          <DataAndAirtime
            wallets={wallets}
            setValue={(name, value) => {
              setValue(name, value);
            }}
            methods={methods}
            params={params}
            product={product}
            user={user}
            setSubTotal={setSubTotal}
          />
        )}

        {['tv', 'electric'].includes(params.action) && (
          <TvAndElectric
            wallets={wallets}
            setValue={(name, value) => {
              setValue(name, value);
            }}
            methods={methods}
            params={params}
            auth={auth}
            siteInfo={siteInfo}
            user={user}
          />
        )}
      </div>
    </CustomCard>
  );
};

export default General;
