import { UseFormReturn, useWatch } from 'react-hook-form';
import FormInput from '@/app/widgets/hook_form_input';
import { convertCommaToArray } from '@/app/helpers/convertCommaToArray';
import { extractAndFormatNumbers } from '@/app/helpers/extractAndFormatNumbers';
import { isNull } from '@/app/helpers/isNull';

const DataAndAirtime = ({
  wallets,
  setValue,
  methods,
  params,
  user,
  product,
  setSubTotal,
}: {
  wallets?: WalletTypes[];
  setValue: (name: string, value: any) => void;
  methods: UseFormReturn<any>;
  params: {
    action: string;
    base: string;
    seg1: string;
  };
  product: ProductTypes;
  user: UserTypes;
  setSubTotal: (setSubTotal: number) => void;
}) => {
  const customerIds = useWatch({ control: methods.control, name: 'customerIds' });
  const amount = useWatch({ control: methods.control, name: 'amount' });

  return (
    <div className="flex flex-col space-y-4 h-full w-full">
      <FormInput
        controlled={true}
        labelClass="brand-bg"
        name="cids"
        defaultValue={customerIds}
        onChange={() => {}}
        onBlur={(e: any) => {
          if (!isNull(e.target.value)) {
            const phones = extractAndFormatNumbers(e.target.value, ' ');
            setValue('customerIds', phones ?? '');
            setValue('cids', phones ?? '');
            const convertedIds: any[] = convertCommaToArray(phones ?? ' ');

            const subtotal =
              Number(amount ?? 0) *
              parseFloat(String(product.price ?? 1)) *
              Math.max(convertedIds.length, 1);

            setSubTotal(subtotal);
          }
        }}
        label={'Phone Number(s)'}
        id="cids"
        type="textarea"
        rows={1}
      />
    </div>
  );
};

export default DataAndAirtime;
