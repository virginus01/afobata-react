import React from 'react';
import { RaisedButton, SearchableSelect } from '@/app/widgets/widgets';
import { Card, CardContent } from '@/components/ui/card';
import FormInput from '@/app/widgets/hook_form_input';

interface TopicsFieldProps {
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

const TopicsField: React.FC<TopicsFieldProps> = ({
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
    <div className="mx-2 flex flex-col space-y-5 mt-10 mb-20">
      {multiple.map((m, i) => {
        return (
          <Card key={i} className="py-5 border border-none">
            <CardContent className="flex flex-col space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormInput
                    controlled={false}
                    placeholder="eg: start by creating account first"
                    name={`multiple_title_${i}`}
                    defaultValue={m.title}
                    onChange={(e) => handleMultipleChange(i, 'title', e.target.value)}
                    label="Section Title"
                    id={`multiple_title-input-${i}`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SearchableSelect
                      showSearch={false}
                      onSelect={(v: any) => handleMultipleChange(i, 'body', v)}
                      label="Position After"
                      items={[
                        { value: '', label: 'Select Position' },

                        ...multiple
                          .filter((option, index) => option.title && index !== i)
                          .map((option, index) => ({
                            value: index.toString(),
                            label: option.title,
                          })),
                      ]}
                      allowMultiSelect={false}
                      defaultValues={[m.position || '']}
                    />
                  </div>

                  <SearchableSelect
                    showSearch={false}
                    onSelect={(v: any) => handleMultipleChange(i, 'freeView', v)}
                    label="Free View"
                    items={[
                      { value: '', label: 'Select Option' },
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                    ]}
                    allowMultiSelect={false}
                    defaultValues={[m.freeView || '']}
                  />
                </div>
              </div>
              <FormInput
                controlled={false}
                placeholder="eg: this is the first step which is account creation"
                name={`multiple_${i}`}
                defaultValue={m.body}
                onBlur={(e) => {
                  handleMultipleChange(i, 'body', e.target.value);
                }}
                label="Add Course"
                id={`multiple-input-${i}`}
                type="textarea"
              />

              <div className="flex justify-end text-sm font-normal text-gray-900 dark:text-white">
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  }
                  iconPosition="before"
                  onClick={() => removeMultiple(i)}
                >
                  Remove
                </RaisedButton>
              </div>
            </CardContent>
          </Card>
        );
      })}

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
    </div>
  );
};

export { TopicsField };
