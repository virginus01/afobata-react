import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import CustomDrawer from '@/app/src/custom_drawer';
import { FileSelector } from '@/app/media/file_selector';
import { renderPreferenceItem } from '@/dashboard/page_builder/preference_items';

const PreferenceWidget = ({
  siteInfo,
  brand,
  user,
  iniPreferences,
  onChange,
  onImageSelect,
}: {
  siteInfo: BrandType;
  brand: BrandType;
  user: UserTypes;
  iniPreferences?: PreferenceItem[] | null;
  onChange: (pref: PreferenceItem[]) => void;
  onImageSelect?: (key: string) => void;
}) => {
  const initialPreferences: any[] = Array.isArray(iniPreferences) ? [...iniPreferences] : [];

  let existingBg = initialPreferences.find((p) => p.key === 'bg_image') ?? {
    type: 'image',
    key: 'bg_image',
    value: '',
  };

  const [preferences, setPreferences] = useState<PreferenceItem[]>([
    ...initialPreferences,
    existingBg,
  ]);
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);
  const [imgKey, setImgKey] = useState('');

  const handleUpdate = (key: string, newValue: string) => {
    let found = false;
    const updated = preferences
      .map((pref) => {
        if (pref.key === key) {
          if (!found) {
            found = true;
            return { ...pref, value: newValue };
          }
          return null;
        }
        return pref;
      })
      .filter((pref): pref is (typeof preferences)[number] => pref !== null);

    if (!found) {
      const inferredType = preferences.find((pref) => pref.key === key)?.type || 'text';
      updated.push({ key, value: newValue, type: inferredType });
    }

    setPreferences(updated);
    onChange(updated);
  };

  const handleImageClick = (key: string) => {
    setImgKey(key);
    setIsFileSelectorOpen(true);
  };

  const renderImageGrid = (images: PreferenceItem[]) => {
    return (
      <div className="overflow-x-auto mb-6">
        <div className="text-xs font-bold my-5">Update other Images</div>

        <div className="flex gap-3 min-w-min pb-2">
          {images.map((item) => (
            <div
              key={item.key}
              className="relative group cursor-pointer border rounded-lg overflow-hidden flex-shrink-0 w-24 h-24"
              onClick={() => handleImageClick(item.key)}
            >
              <div className="relative w-full h-full">
                {item.value ? (
                  <Image src={item.value} alt={item.key} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-medium px-1 text-center">{item.key}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!Array.isArray(preferences)) {
    return <div>No preferences available</div>;
  }

  const imagePreferences = preferences.filter(
    (pref) => pref.type === 'image' && pref.key !== 'bg_image',
  );
  const otherPreferences = preferences.filter((pref) => pref.type !== 'image');
  const bg = preferences.find((pref) => pref.key === 'bg_image') ?? ({} as any);

  return (
    <>
      <div className="space-y-6 p-4">
        {imagePreferences.length > 0 && renderImageGrid(imagePreferences)}
        {otherPreferences.map((item) =>
          renderPreferenceItem({
            item,
            user,
            handleUpdate: (key, value) => {
              handleUpdate(key, value);
            },
          }),
        )}

        <div className="text-xs font-bold my-5">Bacakground Image</div>
        <div
          key={bg.key}
          className="relative group cursor-pointer border rounded-lg overflow-hidden flex-shrink-0 w-24 h-24"
          onClick={() => handleImageClick(bg.key)}
        >
          <div className="relative w-full h-full">
            {bg.value ? (
              <Image src={bg.value} alt={bg.key} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white text-xs font-medium px-1 text-center">Background</p>
          </div>
        </div>
      </div>
      <CustomDrawer
        direction="right"
        isWidthFull={true}
        isHeightFull={true}
        showHeader={false}
        isOpen={isFileSelectorOpen}
        onClose={() => {}}
        header="Select Image"
      >
        <FileSelector
          maxSelect={1}
          onSelect={(e: any) => {
            handleUpdate(imgKey, e[0] ?? '');
            setIsFileSelectorOpen(false);
          }}
          onClose={() => setIsFileSelectorOpen(false)}
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>
    </>
  );
};

export default PreferenceWidget;
