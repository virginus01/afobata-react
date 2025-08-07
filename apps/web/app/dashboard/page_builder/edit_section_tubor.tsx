import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { configurationsSelections } from '@/dashboard/page_builder/classes/tailwindcss2';
import SectionPreView from '@/dashboard/page_builder/section_preview';
import CustomCodeWidget from '@/dashboard/page_builder/custom_code';
import PreferenceWidget from '@/dashboard/page_builder/preferences';
import TailwindConfigSelector from '@/dashboard/page_builder/classes_edit';
import IconButton from '@/app/widgets/icon_button';
import { Save } from 'lucide-react';
import { BackwardIcon } from '@heroicons/react/24/outline';

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  onChange: ({ data, key, fullData }: { data: any; key: string; fullData?: any }) => void;
  classes?: any;
  sectionClasses?: any[];
  sectionData?: any;
  siteInfo: BrandType;
  user: UserTypes;
  auth?: any;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onChange,
  classes = [],
  sectionClasses = [],
  sectionData,
  siteInfo,
  user,
  auth = {}, // ✅ fallback
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-full border-none bg-white pb-20 min-h-full flex flex-col">
      <Tabs defaultValue="classes" className="flex-grow relative">
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex flex-row justify-between items-center overflow-auto scrollbar-hide">
            <IconButton icon={<BackwardIcon />} size="xs" onClick={onClose}>
              Cancel
            </IconButton>
            <TabsList className="flex gap-4 p-4">
              <TabsTrigger value="classes" className="text-xs sm:text-sm">
                Classes
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm">
                Content
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs sm:text-sm">
                Preview
              </TabsTrigger>
              {sectionData && !sectionData.parentId && (
                <TabsTrigger value="global" className="text-xs sm:text-sm">
                  Global
                </TabsTrigger>
              )}
            </TabsList>
            <IconButton
              icon={<Save className="h-3 w-3" />}
              size="xs"
              color="auto"
              className="bg-green-800 text-white font-bold px-2 my-2 mr-2"
              onClick={() => onSave(sectionData)} // ✅ Correct action
            >
              Save
            </IconButton>
          </div>
        </div>

        {/* Classes */}
        <TabsContent value="classes" className="flex-grow">
          <div className="flex flex-col sm:flex-row w-full">
            <div className="w-full sm:w-3/12 sm:border-r-2 border-gray-300 h-full">
              <TailwindConfigSelector
                section={sectionData}
                configurationsSelections={configurationsSelections as any}
                selectedClasses={Array.isArray(classes) ? classes : []}
                setSelectedClasses={(value) => {
                  onChange({ data: value, key: 'classes', fullData: sectionData });
                }}
              />
            </div>
            <div className="hidden sm:block w-3/4">
              <div className="fixed w-3/4 px-4 overflow-y-auto">
                <SectionPreView
                  data={{
                    ...sectionData,
                    classes,
                  }}
                  siteInfo={siteInfo}
                  auth={auth}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Content */}
        <TabsContent value="content">
          <PreferenceWidget
            siteInfo={siteInfo}
            brand={user.brand ?? {}} // ✅ safer
            user={user}
            iniPreferences={sectionData?.preferences ?? ''}
            onChange={(c: Preferences[]) => {
              onChange({ data: c, key: 'preferences', fullData: sectionData });
            }}
          />
          {sectionData?.type === 'custom_component' && (
            <CustomCodeWidget
              siteInfo={siteInfo}
              brand={user.brand ?? {}}
              user={user}
              initialCode={sectionData.data ?? ''}
              onSave={(code, label) =>
                onChange({
                  data: code,
                  key: 'data',
                  fullData: { ...sectionData, label },
                })
              }
            />
          )}
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <SectionPreView
            data={{
              ...sectionData,
              classes,
            }}
            siteInfo={siteInfo}
            auth={auth}
          />
        </TabsContent>

        {/* Global */}
        <TabsContent value="global" className="flex-grow">
          <div className="flex flex-col sm:flex-row w-full">
            <div className="w-full sm:w-2/4 sm:border-r-2 border-gray-300 h-full">
              <TailwindConfigSelector
                section={sectionData}
                configurationsSelections={configurationsSelections as any}
                selectedClasses={Array.isArray(sectionClasses) ? sectionClasses : []}
                setSelectedClasses={(value) => {
                  onChange({ data: value, key: 'sectionClasses', fullData: sectionData });
                }}
              />
            </div>
            <div className="hidden sm:block w-2/4">
              <div className="fixed w-2/4 px-4">
                <SectionPreView
                  data={{
                    ...sectionData,
                    classes: sectionClasses,
                  }}
                  siteInfo={siteInfo}
                  auth={auth}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
