import FormInput from '@/app/widgets/hook_form_input';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';
import { useState, useEffect } from 'react';
import { CustomButton } from '@/app/widgets/custom_button';

export default function TranslationForm({
  translations, // array with [locale] as key eg en: array of en messages
  onSave,
  onDelete,
}: {
  translations: any;
  onSave: (translations: any) => void;
  onDelete: (key: string) => void;
}) {
  const { messages } = useGlobalEssential();
  const [editedTranslations, setEditedTranslations] = useState<any>({});

  // Initialize edited translations with current messages
  useEffect(() => {
    if (messages) {
      setEditedTranslations({ ...messages });
    }
  }, [messages]);

  const handleDelete = () => {
    if (translations.key) onDelete(translations.key);
  };

  const onSubmit = async () => {
    onSave({
      ...translations,
      ...editedTranslations,
    });
  };

  const onTranslationChange = (key: string, value: string) => {
    setEditedTranslations((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Function to render nested objects
  const renderTranslationInputs = (obj: any, parentKey = '') => {
    return Object.entries(obj).map(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={fullKey} className="mb-4">
            <h3 className="text-lg font-semibold mb-2 capitalize">{key}</h3>
            <div className="pl-4 border-l-2 border-gray-300">
              {renderTranslationInputs(value, fullKey)}
            </div>
          </div>
        );
      }

      return (
        <div key={fullKey} className="mb-3">
          <FormInput
            animate={false}
            controlled={false}
            rows={2}
            name={fullKey}
            label={`${key} (${fullKey})`}
            defaultValue={value as string}
            onChange={(e: any) => onTranslationChange(fullKey, e.target.value)}
            placeholder={`Enter translation for ${key}`}
          />
        </div>
      );
    });
  };

  return (
    <div className="bg-gray-50 mb-20 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Edit Translations</h2>

        {messages && Object.keys(messages).length > 0 ? (
          <div className="space-y-4">{renderTranslationInputs(messages)}</div>
        ) : (
          <p className="text-gray-500">No translations available</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 py-5 border-t pt-4">
        <CustomButton
          type="button"
          className="rounded-lg w-auto h-8 text-xs"
          style={5}
          onClick={handleDelete}
        >
          Remove
        </CustomButton>

        <CustomButton type="button" className="w-auto h-8 text-xs" onClick={onSubmit}>
          Save Translations
        </CustomButton>
      </div>
    </div>
  );
}
