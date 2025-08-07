import { isNull } from '@/app/helpers/isNull';
import { ColorPalette } from '@/app/src/color_palette';
import CustomCard from '@/app/widgets/custom_card';
import FormInput from '@/app/widgets/hook_form_input';
import CustomRadioButton from '@/app/widgets/radio_select';
import RadioButtonGroup from '@/app/widgets/radio_select';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';

export const renderPreferenceItem = ({
  item,
  user,
  handleUpdate,
}: {
  item: PreferenceItem;
  user: UserTypes;
  handleUpdate: (key: string, value: string) => void;
}) => {
  switch (item.type) {
    case 'text':
      return (
        <div key={item.key} className="mb-4">
          <FormInput
            label={item.key}
            controlled={false}
            type="text"
            value={item.value}
            defaultValue={item.value}
            onChange={(e) => handleUpdate(item.key, e.target.value)}
            name={item.key} // Use item.key instead of empty string
          />
        </div>
      );

    case 'textarea':
      return (
        <div key={item.key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{item.key}</label>
          <textarea
            value={item.value}
            onChange={(e) => handleUpdate(item.key, e.target.value)}
            className="w-full p-2 border rounded min-h-[100px]"
          />
        </div>
      );

    case 'link':
      return (
        <div key={item.key} className="my-4">
          <FormInput
            controlled={false}
            type="text"
            label={item.key}
            value={item.value}
            defaultValue={item.value}
            onBlur={(e) => handleUpdate(item.key, e.target.value)}
            name={item.key} // Use item.key instead of empty string
          />
        </div>
      );

    case 'menus':
      if (item.key === 'primaryMenuId') {
        return (
          <div key={item.key} className="my-4">
            <SearchableSelect
              label="Menu"
              items={user?.brand?.menus || []} // Add fallback for undefined
              onSelect={(primaryMenuId: any) => {
                handleUpdate(item.key, primaryMenuId ?? '');
              }}
              defaultValues={[item.value]}
            />
          </div>
        );
      }
      return null; // Add explicit return for non-primaryMenuId cases

    case 'icon': {
      const iconOptions = Object.keys(LucideIcons).map((iconName) => ({
        id: iconName,
        title: iconName,
        value: iconName,
      }));

      return (
        <div key={item.key} className="my-4">
          <SearchableSelect
            label="Icon"
            itemsPerPage={100}
            items={iconOptions}
            onSelect={(iconName: any) => {
              handleUpdate(item.key, iconName ?? '');
            }}
            defaultValues={[item.value]}
          />
        </div>
      );
    }

    case 'lists':
      return (
        <div key={item.key} className="my-4">
          <RenderListsPref item={item} user={user} handleUpdate={handleUpdate} />
        </div>
      );

    case 'tw_color':
      return (
        <div key={item.key} className="my-4">
          <ColorPalette
            label={item.key === 'bg_color' ? 'Background Color' : item.key}
            value={item.value}
            user={user}
            handleUpdate={(v) => handleUpdate(item.key, v)}
          />
        </div>
      );

    case 'radio':
      return (
        <div key={item.key} className="my-4">
          <CustomRadioButton
            data={item.data ?? []}
            label={item.title ?? item.key}
            selected={item.value}
            style={1}
            onChange={(v) => handleUpdate(item.key, v)}
          />
        </div>
      );

    default:
      return null;
  }
};

export const RenderListsPref = ({
  item,
  user,
  handleUpdate,
}: {
  item: PreferenceItem;
  user: UserTypes;
  handleUpdate: (key: string, value: any) => void;
}) => {
  const [lists, setLists] = useState<any[]>(item.value ? item.value : []);

  const onListUpdate = ({
    value,
    listIndex,
    itemIndex,
  }: {
    key: string;
    value: any;
    listIndex: number;
    itemIndex: number;
  }) => {
    const updatedList = lists;
    // Update the specific item in the specific list
    if (updatedList[listIndex] && updatedList[listIndex][itemIndex]) {
      updatedList[listIndex][itemIndex].value = value;
    }

    handleUpdate(item.key, updatedList);
    setLists(updatedList);
  };

  return (
    <>
      <div className="font-bold my-5">LIST</div>

      {!isNull(lists) &&
        lists.map((list: PreferenceItem[], listIndex: number) => {
          return (
            <CustomCard
              key={listIndex}
              className="border-b pb-4 mb-4"
              title={`List Item ${listIndex + 1}`}
            >
              {list.map((listItem: PreferenceItem, itemIndex: number) =>
                renderPreferenceItem({
                  item: listItem,
                  user,
                  handleUpdate: (key: string, value: string) => {
                    onListUpdate({ key, value, listIndex, itemIndex });
                  },
                }),
              )}
            </CustomCard>
          );
        })}
    </>
  );
};
