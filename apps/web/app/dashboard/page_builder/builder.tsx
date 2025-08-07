import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  AddSectionModal,
  Sidebar,
  SortableSection,
} from '@/dashboard/page_builder/page_bulder_helpers';
import {
  FOOTER_SECTIONS,
  HEADER_SECTIONS,
  MAIN_SECTIONS,
  SIDEBAR_SECTIONS,
} from '@/dashboard/page_builder/page_bulder_constants';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EditSectionModal } from '@/dashboard/page_builder/edit_section_tubor';
import CustomDrawer from '@/app/src/custom_drawer';
import PreView from '@/dashboard/page_builder/preview';
import { BrandPreference, SectionOption } from '@/app/types/section';
import { CustomButton } from '@/app/widgets/custom_button';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { isNull } from '@/app/helpers/isNull';
import { useDrawer } from '@/app/contexts/drawer_context';

export default function PageBuilder({
  user,
  siteInfo,
  defaultData,
  id,
  iniSearchParams,
  onSave,
  onClose,
  sections = [],
  setSections,
}: PageBuilderProps) {
  let iLayout: ViewRenderLayout = defaultData.layout || {};

  const [isAddingMainSection, setIsAddingMainSection] = useState(false);
  const [isAddingLeftSection, setIsAddingLeftSection] = useState(false);
  const [isAddingRightSection, setIsAddingRightSection] = useState(false);
  const [isAddingHeaderSection, setIsAddingHeaderSection] = useState(false);
  const [isAddingFooterSection, setIsAddingFooterSection] = useState(false);
  const [isAddingBeforeSection, setIsAddingBeforeSection] = useState(false);
  const [isAddingAfterSection, setIsAddingAfterSection] = useState(false);
  const [hasHeader, setHasHeader] = useState(iLayout.hasHeader);
  const [hasBefore, setHasBefore] = useState(iLayout.hasBefore);
  const [hasAfter, setHasAfter] = useState(iLayout.hasAfter);
  const [hasFooter, setHasFooter] = useState(iLayout.hasFooter);
  const [leftSidebar, setLeftSidebar] = useState(iLayout.leftSidebar);
  const [rightSidebar, setRightSidebar] = useState(iLayout.rightSidebar);
  const [isSaving, setIsSaving] = useState(false);
  const [parentId, setParentId] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const editingSection = sections.find((s) => s.id === editingSectionId);
  const { setOnSaveData } = useDrawer();

  const handleEditSection = (id: string) => {
    setEditingSectionId(id);
  };

  const handleChange = ({
    key,
    data,
    fullData,
    close = false,
  }: {
    key: string;
    data: any;
    fullData: any;
    close?: boolean;
  }) => {
    try {
      const newSection = { ...editingSection, [key]: data };

      setSections((prevSections: any) =>
        prevSections.map((section: any) =>
          section.id === editingSectionId ? newSection : section,
        ),
      );
    } catch (error) {
      console.error('Error updating section:', error);
    }

    if (close) {
      setEditingSectionId(null);
    }
  };

  // Initialize sensors with configuration
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
      dragActivationConstraint: {
        distance: 10,
      },
    },
  });

  const pointerSensor = useSensor(PointerSensor);

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  // Combine all sensors
  const sensors = useSensors(pointerSensor, keyboardSensor, mouseSensor, touchSensor);

  const scrollContainerRef = useRef<any | null>(null);

  const handleAddSection = (
    section: SectionOption,
    position: 'main' | 'left' | 'right' | 'before' | 'after' | 'header' | 'footer',
    parentId: string,
  ) => {
    const newSection: ViewRenderData = {
      type: section.type,
      key: section.key,
      section: position,
      id: `section-${position}-${Date.now()}`,
      classes: section?.classes as any[],
      sectionClasses: section?.sectionClasses as any[],
      essentials: section.essentials ?? [],
      data: section.data,
      parentId: parentId,
      preferences: getPreferences(section.preferences, user?.brand?.type),
    };

    const newCustomSection: any = {
      type: 'custom_component',
      key: section.key,
      label: section.label ?? '',
      classes: section.classes,
      sectionClasses: section.sectionClasses,
      preferences: {},
    };

    if (['main', 'before', 'after'].includes(position) && section.type === 'custom_component') {
      MAIN_SECTIONS.push(newCustomSection);
    } else if (['header'].includes(position) && section.type === 'custom_component') {
      HEADER_SECTIONS.push(newCustomSection);
    } else if (['footer'].includes(position) && section.type === 'custom_component') {
      FOOTER_SECTIONS.push(newCustomSection);
    } else if (['right', 'left'].includes(position) && section.type === 'custom_component') {
      SIDEBAR_SECTIONS.push(newCustomSection);
    }

    setSections([...sections, newSection]);

    setIsAddingMainSection(false);
    setIsAddingLeftSection(false);
    setIsAddingRightSection(false);
    setIsAddingHeaderSection(false);
    setIsAddingFooterSection(false);
    setIsAddingBeforeSection(false);
    setIsAddingAfterSection(false);
    setParentId('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeSection = (id: string) => {
    const rows = sections.filter((section) => section.parentId === id);

    const oldParent: any = sections.find((section) => section.id !== id);

    if (rows.length > 0) {
      // Set first row as new parent with empty parentId
      const newParent = {
        ...rows[0],
        parentId: '',
        sectionClasses: oldParent.sectionClasses,
      };

      // Update remaining rows to point to new parent
      const newRows = sections
        .filter((section) => section.parentId === id && section.id !== rows[0].id)
        .map((section) => ({
          ...section,
          parentId: rows[0].id,
        }));

      setSections((prev) => [
        ...prev.filter(
          (section) => section.id !== id && !rows.some((row) => row.id === section.id),
        ),
        newParent,
        ...newRows,
      ]);

      return;
    }

    setSections(sections.filter((section) => section.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const pageData: PageBuilderData = {
      layout: {
        hasHeader,
        hasBefore,
        hasAfter,
        hasFooter,
        leftSidebar,
        rightSidebar,
      },
      sections,
    };
    try {
      if (onSave) {
        await onSave(pageData);
        setOnSaveData(pageData);
      }
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filterSections = (prefix: string) =>
    sections.filter((s) => s.id.startsWith(`section-${prefix}-`));

  const headerSections = filterSections('header');
  const footerSections = filterSections('footer');
  const beforeSections = filterSections('before');
  const afterSections = filterSections('after');
  const leftSections = filterSections('left');
  const rightSections = filterSections('right');
  const mainSections = sections.filter(
    (s) =>
      !s.id.startsWith('section-left-') &&
      !s.id.startsWith('section-right-') &&
      !s.id.startsWith('section-header-') &&
      !s.id.startsWith('section-footer-') &&
      !s.id.startsWith('section-before-') &&
      !s.id.startsWith('section-after-'),
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const ALL_SECTIONS = [
    ...MAIN_SECTIONS,
    ...FOOTER_SECTIONS,
    ...HEADER_SECTIONS,
    ...SIDEBAR_SECTIONS,
  ];

  // to be used 🔹
  return (
    <div className="">
      {/* Layout Settings */}
      <div className="fixed bg-white top-0 w-full mb-10">
        <div className="flex flex-row justify-between h-6 px-4 my-2">
          <div className="w-auto">
            <CustomButton
              icon={<FaTimes />}
              style={6}
              onClick={() => onClose?.()}
              disabled={isSaving}
            >
              Close
            </CustomButton>
          </div>

          <div className="w-auto">
            <CustomButton
              icon={<FaPaperPlane />}
              iconPosition="after"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Builder'}
            </CustomButton>
          </div>
        </div>
        <div className="relative w-full flex items-center justify-between">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 z-10  rounded-full p-1 bg-gray-50 hover:bg-gray-200"
          >
            <ChevronLeft size={24} />
          </button>
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto scrollbar-hide flex items-center space-x-4 py-2 px-10  justify-between"
            style={{
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
            }}
          >
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="headerCheckbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="headerCheckbox">Header</label>
            </div>

            <div className="flex items-center space-x-2 whitespace-nowrap">
              <input
                name="hasBefore"
                type="checkbox"
                id="beforeContentCheckbox"
                checked={hasBefore}
                onChange={(e) => setHasBefore(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="beforeContentCheckbox">Before Content</label>
            </div>

            <div className="flex items-center space-x-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="leftSidebarCheckbox"
                checked={leftSidebar}
                onChange={(e) => setLeftSidebar(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="leftSidebarCheckbox">Left Sidebar</label>
            </div>

            <div className="flex items-center space-x-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="rightSidebarCheckbox"
                checked={rightSidebar}
                onChange={(e) => setRightSidebar(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="rightSidebarCheckbox">Right Sidebar</label>
            </div>

            <div className="flex items-center space-x-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="afterContentCheckbox"
                checked={hasAfter}
                onChange={(e) => setHasAfter(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="afterContentCheckbox">After Content</label>
            </div>

            <div className="flex items-center space-x-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="footerCheckbox"
                checked={hasFooter}
                onChange={(e) => setHasFooter(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="footerCheckbox">Footer</label>
            </div>
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 z-10  rounded-full p-1 bg-gray-50 hover:bg-gray-200"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="m-4 p-2 top-10 mt-10 pt-10">
        {/* Header Section */}
        {hasHeader && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={headerSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mb-6">
                <div className="space-y-4">
                  {headerSections
                    .filter((s) => !s.parentId)
                    .map((section) => {
                      const rows = headerSections.filter((s) => s.parentId === section.id);

                      return (
                        <SortableSection
                          key={section.id}
                          section={section}
                          rows={rows}
                          allSections={ALL_SECTIONS}
                          addRowToSection={(id) => {
                            setParentId(id);
                            setIsAddingHeaderSection(true);
                          }}
                          onRemove={removeSection}
                          onEdit={handleEditSection}
                          availableSections={ALL_SECTIONS}
                          user={user}
                          siteInfo={siteInfo}
                        />
                      );
                    })}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingHeaderSection(true)}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Add Header Section
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Before Section */}
        {hasBefore && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={beforeSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mb-6">
                <div className="space-y-4">
                  {beforeSections
                    .filter((s) => !s.parentId)
                    .map((section) => {
                      const rows = beforeSections.filter((s) => s.parentId === section.id);

                      return (
                        <SortableSection
                          key={section.id}
                          section={section}
                          rows={rows}
                          allSections={ALL_SECTIONS}
                          addRowToSection={(id) => {
                            setParentId(id);
                            setIsAddingBeforeSection(true);
                          }}
                          onRemove={removeSection}
                          onEdit={() => handleEditSection(section.id)}
                          availableSections={ALL_SECTIONS}
                          user={user}
                          siteInfo={siteInfo}
                        />
                      );
                    })}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingBeforeSection(true)}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Add Before Section
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          {leftSidebar && (
            <div className="w-full sm:w-1/4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={leftSections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Sidebar
                    title="Left Sidebar"
                    sections={leftSections}
                    onRemove={removeSection}
                    onEdit={handleEditSection}
                    onAddSection={() => setIsAddingLeftSection(true)}
                    rows={[]}
                    allSections={ALL_SECTIONS}
                    addRowToSection={(id) => {
                      setParentId(id);
                      setIsAddingMainSection(true);
                    }}
                    availableSections={ALL_SECTIONS}
                    user={user}
                    siteInfo={siteInfo}
                  />
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Main Content */}

          <div className={`flex-grow ${!(leftSidebar || rightSidebar) ? 'w-full' : ''}`}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="draggable-item" style={{ touchAction: 'none' }}>
                <SortableContext
                  items={mainSections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {mainSections
                      .filter((s) => !s.parentId)
                      .map((section) => {
                        const rows = mainSections.filter((s) => s.parentId === section.id);

                        return (
                          <SortableSection
                            key={section.id}
                            section={section}
                            rows={rows}
                            allSections={ALL_SECTIONS}
                            addRowToSection={(id) => {
                              setParentId(id);
                              setIsAddingMainSection(true);
                            }}
                            availableSections={ALL_SECTIONS}
                            onRemove={removeSection}
                            onEdit={handleEditSection}
                            user={user}
                            siteInfo={siteInfo}
                          />
                        );
                      })}
                    {/* Add Main Section Button */}
                    <button
                      type="button"
                      onClick={() => setIsAddingMainSection(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                      + Add Main Section
                    </button>
                  </div>
                </SortableContext>
              </div>
            </DndContext>
          </div>

          {/* Right Sidebar */}
          {rightSidebar && (
            <div className="w-full sm:w-1/4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={rightSections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Sidebar
                    title="Right Sidebar"
                    sections={rightSections}
                    onRemove={removeSection}
                    onEdit={handleEditSection}
                    onAddSection={() => setIsAddingRightSection(true)}
                    rows={[]}
                    allSections={ALL_SECTIONS}
                    addRowToSection={(id) => {
                      setParentId(id);
                      setIsAddingMainSection(true);
                    }}
                    availableSections={ALL_SECTIONS}
                    user={user}
                    siteInfo={siteInfo}
                  />
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* After Section */}
        {hasAfter && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={afterSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-6">
                <div className="space-y-4">
                  {afterSections
                    .filter((s) => !s.parentId)
                    .map((section) => {
                      const rows = afterSections.filter((s) => s.parentId === section.id);
                      return (
                        <SortableSection
                          key={section.id}
                          section={section}
                          rows={rows}
                          allSections={ALL_SECTIONS}
                          addRowToSection={(id) => {
                            setParentId(id);
                            setIsAddingAfterSection(true);
                          }}
                          onRemove={removeSection}
                          onEdit={() => handleEditSection(section.id)}
                          availableSections={ALL_SECTIONS}
                          user={user}
                          siteInfo={siteInfo}
                        />
                      );
                    })}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingAfterSection(true)}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Add After Section
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Footer Section */}
        {hasFooter && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={footerSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-6">
                <div className="space-y-4">
                  {footerSections
                    .filter((s) => !s.parentId)
                    .map((section) => {
                      const rows = footerSections.filter((s) => s.parentId === section.id);
                      return (
                        <SortableSection
                          key={section.id}
                          rows={rows}
                          allSections={ALL_SECTIONS}
                          addRowToSection={(id) => {
                            setParentId(id);
                            setIsAddingFooterSection(true);
                          }}
                          section={section}
                          onRemove={removeSection}
                          onEdit={() => handleEditSection(section.id)}
                          availableSections={ALL_SECTIONS}
                          user={user}
                          siteInfo={siteInfo}
                        />
                      );
                    })}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingFooterSection(true)}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Add Footer Section
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Section Modals */}
      <CustomDrawer
        isOpen={isAddingMainSection}
        onClose={() => setIsAddingMainSection(false)}
        header="Add Main Section"
        isHeightFull={true}
        isWidthFull={true}
      >
        <AddSectionModal
          isOpen={isAddingMainSection}
          onClose={() => setIsAddingMainSection(false)}
          onAdd={(section) => handleAddSection(section, 'main', parentId)}
          sections={MAIN_SECTIONS}
          title="Add Main Section"
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      <CustomDrawer
        isOpen={isAddingLeftSection}
        onClose={() => setIsAddingLeftSection(false)}
        header="Add Left Sidebar Section"
        isHeightFull={true}
        isWidthFull={true}
      >
        <AddSectionModal
          isOpen={isAddingLeftSection}
          onClose={() => setIsAddingLeftSection(false)}
          onAdd={(section) => handleAddSection(section, 'left', parentId)}
          sections={SIDEBAR_SECTIONS}
          title="Add Left Sidebar Section"
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      <CustomDrawer
        isOpen={isAddingRightSection}
        onClose={() => setIsAddingRightSection(false)}
        header="Add Right Sidebar Section"
        isHeightFull={true}
        isWidthFull={true}
      >
        <AddSectionModal
          isOpen={isAddingRightSection}
          onClose={() => setIsAddingRightSection(false)}
          onAdd={(section) => handleAddSection(section, 'right', parentId)}
          sections={SIDEBAR_SECTIONS}
          title="Add Right Sidebar Section"
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      <CustomDrawer
        isOpen={isAddingHeaderSection}
        onClose={() => setIsAddingHeaderSection(false)}
        header="Add Header Section"
        isHeightFull={true}
        isWidthFull={true}
      >
        <AddSectionModal
          isOpen={isAddingHeaderSection}
          onClose={() => setIsAddingHeaderSection(false)}
          onAdd={(section) => handleAddSection(section, 'header', parentId)}
          sections={HEADER_SECTIONS}
          title="Add Header Section"
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      <CustomDrawer
        isOpen={isAddingFooterSection}
        onClose={() => setIsAddingFooterSection(false)}
        header="Add Footer Section"
        isHeightFull={true}
        isWidthFull={true}
      >
        <AddSectionModal
          isOpen={isAddingFooterSection}
          onClose={() => setIsAddingFooterSection(false)}
          onAdd={(section) => handleAddSection(section, 'footer', parentId)}
          sections={FOOTER_SECTIONS}
          title="Add Footer Section"
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      <CustomDrawer
        isOpen={isAddingBeforeSection}
        onClose={() => setIsAddingBeforeSection(false)}
        header="Add Before Section"
        isHeightFull={true}
        isWidthFull={true}
      >
        <AddSectionModal
          isOpen={isAddingBeforeSection}
          onClose={() => setIsAddingBeforeSection(false)}
          onAdd={(section) => handleAddSection(section, 'before', parentId)}
          sections={MAIN_SECTIONS}
          title="Add Before Section"
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      <CustomDrawer
        isOpen={isAddingAfterSection}
        onClose={() => setIsAddingAfterSection(false)}
        header="Add After Section"
        isHeightFull={true}
        isWidthFull={true}
      >
        <AddSectionModal
          isOpen={isAddingAfterSection}
          onClose={() => setIsAddingAfterSection(false)}
          onAdd={(section) => handleAddSection(section, 'after', parentId)}
          sections={MAIN_SECTIONS}
          title="Add After Section"
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      {editingSectionId && (
        <CustomDrawer
          isOpen={!!editingSectionId}
          direction="right"
          isWidthFull={true}
          showHeader={false}
          isHeightFull={true}
          onClose={() => setEditingSectionId(null)}
          header={sections.find((s) => s.id === editingSectionId)?.key || ({} as any) || 'Section'}
        >
          <EditSectionModal
            user={user}
            isOpen={!!editingSectionId}
            onClose={() => setEditingSectionId(null)}
            onSave={() => {
              setEditingSectionId(null);
            }}
            onChange={({ data, key, fullData }) => {
              handleChange({ key, data, fullData });
            }}
            siteInfo={siteInfo}
            sectionData={editingSection}
            classes={editingSection?.classes ?? []}
            sectionClasses={editingSection?.sectionClasses ?? []}
          />
        </CustomDrawer>
      )}
    </div>
  );
}

function getPreferences(preferences: any, tag: string): any[] {
  if (isNull(preferences) || isNull(tag)) return preferences?.default ?? [];
  if (Array.isArray(preferences)) return preferences;
  return preferences[tag] ?? preferences?.default ?? [];
}
