import React from 'react';
import { SelectField, RaisedButton } from '@/app/widgets/widgets';
import FormInput from '@/app/widgets/hook_form_input';

interface CourseFieldsProps {
  multiple: any[];
  handleMultipleChange: (index: number, field: string, value: string) => void;
  handleMultiSelectChange: (event: React.ChangeEvent<HTMLSelectElement>, index: number) => void;
  actionTitle?: string;
  removeMultiple: (index: number) => void;
  addMultiple: () => void;
  options: { value: string; label: string }[];
  passwordView: boolean;
  formData: any;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  errors: any;
}

const CourseFields: React.FC<CourseFieldsProps> = ({
  multiple,
  handleMultipleChange,
  handleMultiSelectChange,
  removeMultiple,
  addMultiple,
  options,
  passwordView,
  formData,
  handleInputChange,
  handleSelectChange,
  errors,
  actionTitle,
}) => {
  return (
    <>
      {multiple.map((m, i) => (
        <div key={i} className="border-t-2 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                placeholder="eg: start by creating account first"
                name={`multiple_title_${i}`}
                value={m.title}
                onChange={(e) => handleMultipleChange(i, 'title', e.target.value)}
                label="Section Title"
                id={`multiple_title-input-${i}`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SelectField
                  name={`multiple_position_${i}`}
                  value={m.position}
                  onChange={(e) => handleMultiSelectChange(e, i)}
                  label="Position After"
                  id={`multiple-position-input-${i}`}
                  options={[
                    { value: '', label: 'Select Position' }, // Hardcoded field
                    ...multiple
                      .filter((option, index) => option.title && index !== i)
                      .map((option, index) => ({
                        value: index.toString(),
                        label: option.title,
                      })),
                  ]}
                />
              </div>
              <SelectField
                name={`selectedOption_${i}`}
                value={m.selectedOption}
                onChange={(e) => handleMultipleChange(i, 'selectedOption', e.target.value)}
                label="Free View"
                id={`select-option-${i}`}
                options={options}
              />
            </div>
          </div>
          <FormInput
            placeholder="eg: this is the first step which is account creation"
            name={`multiple_${i}`}
            value={m.name}
            onChange={(e: { target: { value: string } }) =>
              handleMultipleChange(i, 'body', e.target.value)
            }
            label="Add Course"
            id={`multiple-input-${i}`}
          />
          <div className="flex justify-end mb-2 text-sm font-normal text-gray-900 dark:text-white">
            <RaisedButton
              size="auto"
              color="danger"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              }
              iconPosition="before"
              onClick={() => removeMultiple(i)}
            >
              Remove
            </RaisedButton>
          </div>
          <div className="border-t-2 border-gray-300 my-4"></div>
        </div>
      ))}

      <div className="block mb-2 text-sm font-normal text-gray-900 dark:text-white">
        <RaisedButton
          size="md"
          color="danger"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v14m-7-7h14"
              />
            </svg>
          }
          iconPosition="before"
          onClick={addMultiple}
        >
          Add {actionTitle} Section
        </RaisedButton>
      </div>
      <div className="pt-5"></div>
      {passwordView && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            name="premiumPin"
            type="number"
            value={formData.premiumPin || ''}
            onChange={handleInputChange}
            label="5 digit Premium Pin (optional)"
            id="premium-pin"
            error={errors.premiumPin}
          />

          <FormInput
            type="number"
            name="freePin"
            value={formData.freePin || ''}
            onChange={handleInputChange}
            label="5 digit Free Pin (optional)"
            id="free-pin"
            error={errors.freePin}
          />

          <SelectField
            name="freeView"
            value={formData.freeView || ''}
            onChange={handleSelectChange}
            label="Free View"
            id="free-view"
            options={options}
          />
        </div>
      )}
    </>
  );
};

export default CourseFields;
