import { useUserContext } from '@/app/contexts/user_context';
import React, { useState } from 'react';
import ListView from '@/app/widgets/listView';
import CustomDrawer from '@/app/src/custom_drawer';
import { randomNumber } from '@/app/helpers/randomNumber';
import { isNull } from '@/app/helpers/isNull';
import { supported_lang } from '@/app/src/constants';
import TranslationForm from '@/dashboard/appearance/translation/translation_form';

interface TranslationPageProps {
  onAction: (action: any[]) => void;
}

export default function TranslationPage({ onAction }: TranslationPageProps) {
  const { essentialData } = useUserContext();
  const [translations, setTranslations] = useState<any[]>(essentialData?.brand?.translations || []);
  const [selectedTranslation, setSelectedTranslation] = useState<any>({});

  const handleCreateOrUpdateTranslation = (updatedTranslation: any) => {
    // Check if translation already exists by locale/language ID
    const existingTranslationIndex = translations.findIndex(
      (t) => t.locale === updatedTranslation.locale,
    );

    if (existingTranslationIndex !== -1) {
      // Update existing translation
      const updatedTranslations = [...translations];
      updatedTranslations[existingTranslationIndex] = updatedTranslation;
      setTranslations(updatedTranslations);
      onAction(updatedTranslations);
    } else {
      // Create new translation
      const newTranslation = {
        ...updatedTranslation,
        locale: selectedTranslation.id, // Use the selected language ID as locale
        id: randomNumber(), // Generate unique ID if needed
      };
      const newTranslations = [...translations, newTranslation];
      setTranslations(newTranslations);
      onAction(newTranslations);
    }

    // Close drawer after save
    setSelectedTranslation({});
  };

  const handleDeleteTranslation = (translationKey: string) => {
    const filteredTranslations = translations.filter((t) => t.locale !== translationKey);
    setTranslations(filteredTranslations);
    setSelectedTranslation({});
    onAction(filteredTranslations);
  };

  const handleLanguageSelect = (langData: any) => {
    // Find existing translation for this language or create new one
    const existingTranslation = translations.find((t) => t.locale === langData.id);

    if (existingTranslation) {
      setSelectedTranslation(existingTranslation);
    } else {
      // Create new translation object for this language
      setSelectedTranslation({
        id: langData.id,
        locale: langData.id,
        name: langData.title,
        messages: {}, // Empty messages object to be filled
      });
    }
  };

  return (
    <div className="flex flex-col py-5">
      <div className="flex flex-row justify-between items-center mb-4 h-7 px-2">
        <div className="text-lg font-semibold">Translations</div>
        <div className="text-sm text-gray-500">
          {translations.length} language{translations.length !== 1 ? 's' : ''} configured
        </div>
      </div>

      <div className="flex-grow">
        <ListView
          data={supported_lang.map((lang) => {
            // Check if this language already has translations
            const hasTranslation = translations.some((t) => t.locale === lang.id);

            return {
              id: lang.id,
              title: lang.name,
              value: lang.id,
              subtitle: hasTranslation ? 'Configured' : 'Not configured',
              status: hasTranslation ? 'active' : 'inactive',
            };
          })}
          setActiveData={handleLanguageSelect}
          display={[]}
        />
      </div>

      <CustomDrawer
        isOpen={!isNull(selectedTranslation?.id)}
        onClose={() => setSelectedTranslation({})}
        isHeightFull={true}
        isWidthFull={true}
        header={`${selectedTranslation?.name || 'Language'} Translations`}
      >
        <TranslationForm
          translations={selectedTranslation}
          onSave={handleCreateOrUpdateTranslation}
          onDelete={handleDeleteTranslation}
        />
      </CustomDrawer>
    </div>
  );
}
