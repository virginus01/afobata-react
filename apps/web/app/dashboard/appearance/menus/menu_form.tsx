import { CustomButton } from '@/app/widgets/custom_button';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import FormInput from '@/app/widgets/hook_form_input';
import { useState, useEffect } from 'react';
import { Trash } from 'lucide-react';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Please input name')
    .min(3, 'name must be at least 3 characters long'),
  description: Yup.string().optional(),
  position: Yup.string().oneOf(['main', 'mobile', 'footer']),
});

export default function MenuForm({
  menu,
  onSave,
  onDelete,
}: {
  menu: Menus;
  onSave: (menu: Menus) => void;
  onDelete: (id: string) => void;
}) {
  const [links, setLinks] = useState<Menus[]>(menu.links || []);

  const methods = useForm<Menus>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ...menu,
    },
  } as any);

  const {
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = methods;

  useEffect(() => {
    setLinks(menu.links || []);
  }, [menu.links]);

  const handleDelete = () => {
    if (menu.id) onDelete(menu.id);
  };

  const onSubmit = async (data: Menus) => {
    const isValid = await trigger();
    if (isValid) {
      onSave({
        ...menu,
        ...data,
        links,
      });
    }
  };

  const onDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const onLinkChange = (index: number, field: keyof Menus, value: string) => {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  };

  const addNewLink = () => {
    const newLink: Menus = {
      id: Date.now().toString(),
      name: '',
      link: '',
    };
    setLinks((prev) => [...prev, newLink]);
  };

  return (
    <div className="bg-gray-50 mb-20">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-5 p-4">
          <FormInput id="name" name="name" label="Menu name" placeholder="Enter menu name" />

          <FormInput id="description" name="description" rows={3} label="Enter menu description" />

          {links.map((link, index) => (
            <div key={link.id} className="flex flex-row items-center space-x-3">
              <FormInput
                controlled={false}
                onBlur={(e) => onLinkChange(index, 'name', e.target.value)}
                value={link.name}
                name={`links.${index}.name`}
                label="Menu Title"
              />
              <FormInput
                controlled={false}
                value={link.link}
                onBlur={(e) => onLinkChange(index, 'link', e.target.value)}
                name={`links.${index}.link`}
                label="Menu Link"
              />
              <CustomButton
                type="button"
                onClick={() => onDeleteLink(link.id ?? '')}
                className="w-6 h-7 text-xs"
              >
                <Trash className="h-3 w-3" />
              </CustomButton>
            </div>
          ))}

          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Menu Position</label>
            <Controller
              control={control}
              name="position"
              render={({ field }) => (
                <div className="space-y-2">
                  {['main', 'mobile', 'footer'].map((pos) => (
                    <div key={pos} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`position-${pos}`}
                        value={pos}
                        checked={field.value === pos}
                        onChange={() => field.onChange(pos)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`position-${pos}`}
                        className="text-sm font-medium text-gray-600"
                      >
                        {pos.charAt(0).toUpperCase() + pos.slice(1)} Menu
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="flex justify-end space-x-3 py-5">
            <CustomButton
              type="button"
              className="rounded-lg w-auto h-6 text-xs"
              style={5}
              onClick={handleDelete}
            >
              Remove
            </CustomButton>

            <CustomButton
              style={3}
              onClick={addNewLink}
              className="w-auto h-6 text-xs"
              type="button"
            >
              Add Link
            </CustomButton>

            <CustomButton className="w-auto h-6 text-xs" type="submit">
              {menu?.id ? 'Update Menu' : 'Create Menu'}
            </CustomButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
