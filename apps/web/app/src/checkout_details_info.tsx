import FormInput from '@/app/widgets/hook_form_input';
import CustomCard from '@/app/widgets/custom_card';
import { isNull } from '@/app/helpers/isNull';

const CheckoutDetailsInfo = ({
  setValue,
  user,
  info,
}: {
  setValue: (name: string, value: any) => void;
  user: UserTypes;
  info: any[];
}) => {
  if (info.length === 0) {
    return;
  }
  return (
    <CustomCard title="Required Information">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {info.map((f) => (
          <div key={f.name} className="w-full">
            <FormInput
              labelClass="brand-bg"
              className="h-full flex-grow"
              placeholder=""
              name={f.name}
              label={f.label}
              onChange={(e) => setValue(f.name, e.target.value)}
              type={f.type}
            />
          </div>
        ))}
      </div>
    </CustomCard>
  );
};

export default CheckoutDetailsInfo;
