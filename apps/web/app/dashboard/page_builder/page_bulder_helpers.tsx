import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SIDEBAR_SECTIONS } from '@/dashboard/page_builder/page_bulder_constants';
import { Code, Edit, Search, Trash } from 'lucide-react';
import CustomDrawer from '@/app/src/custom_drawer';
import { isNull } from '@/app/helpers/isNull';
import CustomCodeWidget from '@/dashboard/page_builder/custom_code';
import {
  AddSectionModalProps,
  SectionOption,
  SidebarProps,
  SortableSectionProps,
} from '@/app/types/section';
import Image from 'next/image';
import FormInput from '@/app/widgets/hook_form_input';
import CustomModal from '@/app/widgets/custom_modal';

export function SortableSection({
  section,
  onRemove,
  onEdit,
  availableSections,
  addRowToSection,
  rows = [],
  allSections = [],
  user,
  siteInfo,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="w-full whitespace-nowrap" ref={setNodeRef} style={style}>
      <div className="flex flex-row justify-between space-x-2 overflow-x-auto scrollbar-hide">
        <div className="bg-white rounded-lg shadow-md p-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                {...attributes}
                {...listeners}
                className="cursor-move text-gray-400 hover:text-gray-600"
              >
                ⋮⋮
              </div>
              <span className="font-normal sm:font-bold whitespace-nowrap text-xs">
                {availableSections.find((s) => s.key === section.key)?.label || section.key}
              </span>
            </div>
            <div className="flex flex-row justify-end items-center space-x-2 ml-2">
              <button
                type="button"
                onClick={() => onEdit(section.id)}
                className="text-green-500 hover:text-green-700"
              >
                <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>

              <button
                type="button"
                onClick={() => onRemove(section.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>
            </div>
          </div>
        </div>

        {rows.map((row) => {
          return (
            <SortableRow
              key={row.id}
              section={row}
              onRemove={onRemove}
              onEdit={onEdit}
              availableSections={allSections}
              user={user}
              siteInfo={siteInfo}
            />
          );
        })}
        <button
          type="button"
          onClick={() => addRowToSection?.(section.id)}
          className="w-20 px-1 text-xs whitespace-nowrap border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Add Row
        </button>
      </div>
    </div>
  );
}

export function SortableRow({
  section,
  onRemove,
  onEdit,
  availableSections,
  user,
  siteInfo,
}: SortableSectionProps) {
  return (
    <div className="flex flex-row justify-between space-x-2 w-full">
      <div className="bg-white rounded-lg shadow-md p-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-normal sm:font-bold whitespace-nowrap text-xs">
              {availableSections.find((s) => s.key === section.key)?.label || section.key}
            </span>
          </div>
          <div className="flex flex-row justify-end items-center space-x-2 ml-2">
            <button
              type="button"
              onClick={() => onEdit(section.id)}
              className="text-green-500 hover:text-green-700"
            >
              <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
            </button>

            <button
              type="button"
              onClick={() => onRemove(section.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash className="h-3 sm:h-4 w-3 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function AddSectionModal({
  isOpen,
  onClose,
  onAdd,
  sections,
  title = 'Add New Section',
  user,
  siteInfo,
}: AddSectionModalProps) {
  const [custom, setCustom] = useState<SectionOption[]>([]);
  const [activeSection, setActiveSection] = useState<SectionOption | any>({});
  const [isCustomPanelOpen, setIsCustomPanelOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewSection, setPreviewSection] = useState<SectionOption | null>(null);

  useEffect(() => {
    setCustom([
      {
        type: 'custom_component',
        key: Date.now().toString() as any,
        label: 'Custom Widget',
        classes: [],
      },
    ]);
  }, []);

  if (!isOpen) return null;

  const handleOnAdd = (section: any, code = '') => {
    if (section.type === 'custom_component' && isNull(code)) {
      setActiveSection(section);
      setIsCustomPanelOpen(true);
    } else {
      setIsCustomPanelOpen(false);
      onAdd({ ...section, data: code ?? '' });
    }
  };

  // Sort sections to ensure custom_component is first
  const sortedSections = [...sections];
  const finalWithCustom = [...custom, ...sortedSections];

  // Filter sections based on search query
  const filteredSections = finalWithCustom.filter((section) =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle preview modal
  const handlePreview = (e: React.MouseEvent, section: SectionOption) => {
    e.stopPropagation(); // Prevent triggering the button click
    setPreviewSection(section);
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewSection(null);
  };

  return (
    <>
      <div className="space-y-4 p-2">
        {/* Search input */}
        <div className="relative my-2">
          <FormInput
            animate={true}
            showLabel={false}
            controlled={false}
            type="text"
            showPrefix={false}
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            name={''}
            icon={<Search className="h-4 w-4 text-gray-400" />}
            label={'Search sections...'}
          />
        </div>

        {/* Section grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSections.map((section) => (
            <div
              key={section.key}
              className={`flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                section.type === 'custom_component' ? '' : ''
              }`}
              onClick={() => handleOnAdd(section)}
            >
              <div className="w-full h-24 mb-2 rounded overflow-hidden flex items-center justify-center relative group">
                {section.type === 'custom_component' ? (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-600 flex flex-col items-center justify-center p-2">
                    <Code className="h-8 w-8 text-white mb-2" />
                    <span className="text-white text-sm font-medium text-center">
                      {section.label}
                    </span>
                    <span className="text-white text-xs opacity-80 mt-1">
                      Write custom code yourself or with AI
                    </span>
                  </div>
                ) : section.thumbnail ? (
                  <>
                    <Image
                      src={section.thumbnail}
                      alt={`${section.label} template`}
                      className="w-full h-full object-cover"
                      height={500}
                      width={500}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1 text-white text-xs font-medium text-center">
                      {section.label}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        onClick={(e) => handlePreview(e, section)}
                        className="bg-white text-gray-800 rounded-full p-2 text-xs font-medium cursor-pointer"
                      >
                        Preview
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-sm font-medium px-2 text-center">
                      {section.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredSections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sections matching {searchQuery} found
          </div>
        )}

        {/* Preview Modal */}
        {previewSection && (
          <CustomModal
            isOpen={!isNull(previewSection)}
            onClose={closePreview}
            title={`${previewSection.label} Preview`}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-auto p-2 mb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                {`${previewSection.label} Preview`}
                <button
                  type="button"
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={previewSection?.thumbnail ?? ''}
                  alt={`${previewSection?.label} preview`}
                  className="w-full object-contain"
                  width={500}
                  height={500}
                />
              </div>
            </div>
          </CustomModal>
        )}
      </div>

      {/* Custom Component Panel */}
      {isCustomPanelOpen && (
        <CustomDrawer
          isOpen={!!isCustomPanelOpen}
          direction="right"
          isWidthFull={true}
          showHeader={true}
          isHeightFull={true}
          onClose={() => setIsCustomPanelOpen(false)}
          header={'Custom'}
        >
          <CustomCodeWidget
            siteInfo={siteInfo}
            brand={user.brand ?? {}}
            user={user}
            onSave={(code, label) => {
              handleOnAdd({ ...activeSection, label }, code);
            }}
          />
        </CustomDrawer>
      )}
    </>
  );
}
export function Sidebar({
  title,
  sections,
  onRemove,
  onEdit,
  onAddSection,
  availableSections,
  addRowToSection,
  rows = [],
  allSections = [],
  user,
  siteInfo,
}: SidebarProps) {
  return (
    <div className="w-full">
      <div className="space-y-4">
        {sections.map((section) => (
          <SortableSection
            key={section.id}
            section={section}
            onRemove={onRemove}
            onEdit={onEdit}
            availableSections={SIDEBAR_SECTIONS}
            user={user}
            siteInfo={siteInfo}
          />
        ))}

        {rows.map((row) => {
          return (
            <SortableRow
              key={row.id}
              section={row}
              onRemove={onRemove}
              onEdit={onEdit}
              availableSections={allSections}
              user={user}
              siteInfo={siteInfo}
            />
          );
        })}
        <button
          type="button"
          onClick={onAddSection}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          + Add Sidebar Section
        </button>
      </div>
    </div>
  );
}
