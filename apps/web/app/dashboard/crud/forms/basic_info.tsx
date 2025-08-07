import { isNull } from '@/app/helpers/isNull';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import FormInput from '@/app/widgets/hook_form_input';
import { RaisedButton } from '@/app/widgets/raised_button';
import { Edit } from 'lucide-react';
import React from 'react';
import { FaPlus, FaEdit, FaTimes } from 'react-icons/fa';
import slugify from 'slugify';
import { toast } from 'sonner';

interface CrudGeneralInfoProps {
  title: string;
  base: string;
  formData: any;
  errors: Record<string, any>;
  setValue: (name: string, value: any) => void;
  editSlug: boolean;
  setEditSlug: React.Dispatch<React.SetStateAction<boolean>>;
  setIsModalEditSlugVisible: React.Dispatch<React.SetStateAction<boolean>>;
  type: string;
  searchParams: { slug?: string };
  body: any;
}

const CrudGeneralInfo: React.FC<CrudGeneralInfoProps> = ({
  title,
  base,
  formData,
  errors,
  setValue,
  editSlug,
  setEditSlug,
  setIsModalEditSlugVisible,
  type,
  searchParams,
  body,
}) => {
  const formattedBase = base.charAt(0).toUpperCase() + base.slice(1);

  return (
    <CustomCard title={title} className="flex flex-col space-y-8">
      <div className="block sm:flex sm:justify-between items-center space-y-5 sm:space-y-0 sm:space-x-2 w-full">
        <FormInput
          className="w-full"
          name="title"
          onChange={(e) => setValue('title', e.target.value)}
          label={`${formattedBase} Title`}
          id="title-input"
          error={errors?.title?.message}
        />
        <FormInput
          className="w-full"
          name="subTitle"
          onChange={(e) => setValue('subTitle', e.target.value)}
          label={`${formattedBase} Sub Title (optional)`}
          id="sub-title-input"
          error={errors?.subTitle?.message}
        />
      </div>
      {formData && (
        <div className="my-4">
          <div className="flex flex-row items-center gap-4 w-full">
            <FormInput
              label={`${formattedBase} Slug`}
              onBlur={(e) => {
                const slug = slugify(e.target.value, {
                  lower: true,
                  strict: true,
                });
                setValue('slug', slug);
              }}
              disabled={!editSlug}
              name="slug"
              onChange={(e) => setValue('slug', e.target.value)}
              id="slug-input"
              className="w-full"
              error={errors?.slug}
            />
            <CustomButton
              type="button"
              className="h-7 w-7 flex items-center justify-center"
              iconPosition="after"
              onClick={() => {
                if (type === 'static' && searchParams.slug) {
                  toast.error("You can't edit static page slug");
                } else if (!editSlug) {
                  setIsModalEditSlugVisible(true);
                } else {
                  setEditSlug((prev) => !prev);
                }
              }}
            >
              {!editSlug ? <Edit className="h-4 w-4" /> : <FaTimes />}
            </CustomButton>
          </div>
        </div>
      )}
      <div className="w-full">
        <FormInput
          rows={3}
          type="textarea"
          name="description"
          onChange={(e) => setValue('description', e.target.value)}
          label={`${formattedBase} Description/Summary`}
          id="description-input"
          error={errors?.description?.message}
        />
      </div>
    </CustomCard>
  );
};

export default CrudGeneralInfo;
