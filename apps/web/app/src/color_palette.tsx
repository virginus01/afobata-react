import { colorGroups } from '@/src/constants';
import { SearchableSelect } from '@/app/widgets/searchable_select';

export const ColorPalette = ({
  value,
  user,
  label,
  handleUpdate,
}: {
  value: string;
  user: UserTypes;
  label: string;
  handleUpdate: (value: string) => void;
}) => {
  const colors = Object.entries(colorGroups).flatMap(([colorName, shades]) =>
    shades.map((shade) => {
      const className = shade === null ? colorName : `${colorName}-${shade}`;
      return {
        class: `bg-${className} hover:bg-${className} ${colorName === 'black' || (shade && shade > 500) ? 'text-white' : 'text-black'}`,
        id: className,
        value: className,
        title: shade === null ? colorName : `${colorName} ${shade}`,
      };
    }),
  );

  return (
    <SearchableSelect
      label={label}
      items={colors}
      onSelect={(v: any) => handleUpdate(v === 'none' ? '' : v)}
      defaultValues={[value]}
    />
  );
};
