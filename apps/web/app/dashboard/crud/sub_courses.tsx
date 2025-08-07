import React, { useEffect, useState } from 'react';
import {
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CustomCard from '@/app/widgets/custom_card';
import { Edit, Trash } from 'lucide-react';
import Topics from '@/dashboard/crud/topics';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { UseFormReturn } from 'react-hook-form';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { SearchableSelect } from '@/app/widgets/searchable_select';

export default function SubCourses({
  setValue,
  setSubCourses,
  subCourses,
  setBodyType,
  bodyType,
  siteInfo,
  user,
  methods,
}: {
  setValue: (name: string, value: any) => void;
  setSubCourses: React.Dispatch<React.SetStateAction<ChapterType[]>>;
  setBodyType: React.Dispatch<React.SetStateAction<string>>;
  methods: UseFormReturn<any>;
  subCourses: any[];
  bodyType: string;
  siteInfo: BrandType;
  user: UserTypes;
}) {
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>(subCourses);
  const {
    setBrand,

    data,
    setQueryConfig,
    setParams,
    setRefreshKey,
  } = useDynamicContext();

  let tag: string = `${user?.selectedProfile ?? ''}_${siteInfo?.id}`;
  let table: string = '';
  let conditions = { userId: user.id, status: 'published' };

  useEffect(() => {
    setQueryConfig({ conditions, table, tag });
  }, []);

  useEffect(() => {
    if (Array.isArray(data)) {
      let filtered = data;
      filtered = data.filter((d) => d.type === 'digital');
      setUserCourses(filtered);
    }
  }, [data]);

  // Initialize selected courses from subCourses prop
  useEffect(() => {
    if (subCourses && subCourses.length > 0) {
      setSelectedCourses(subCourses);
    }
  }, [subCourses]);

  // Update parent state when selectedCourses changes
  useEffect(() => {
    setSubCourses(selectedCourses);
    setValue('subCourses', selectedCourses);
  }, [selectedCourses, setSubCourses, setValue]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Start dragging after moving 10px with mouse
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Add a slight delay for touch to distinguish from taps
        tolerance: 5, // Allow small movements before activating drag
      },
    }),
  );

  const handleDragEnd = (event: any) => {
    const scrollY = window.scrollY;

    const { active, over } = event;
    if (active.id !== over.id) {
      setSelectedCourses((items: any[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  };

  const handleCourseSelect: any = (courseId: string) => {
    const selectedCourse = userCourses.find((course) => course.id === courseId);
    if (selectedCourse && !selectedCourses.find((course) => course.id === courseId)) {
      setSelectedCourses((prev) => [...prev, selectedCourse]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((course) => course.id !== courseId));
  };

  function SortableItem({
    course,
    onRemove,
    index,
  }: {
    course: any;
    onRemove: (id: string) => void;
    index: number;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: course.id,
      animateLayoutChanges: () => false,
      transition: null,
      disabled: false,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: 'none',
    };

    return (
      <div
        className="flex flex-col space-y-2"
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <div className="p-4 bg-white rounded shadow cursor-move">
          <div className="flex flex-row space-x-3 justify-between">
            <div className="flex flex-row space-x-3">
              <div> ⋮⋮</div>
              <div>
                Course {index + 1}: {course.title}
              </div>
            </div>
            <div
              className="flex flex-row justify-end items-center space-x-2 ml-2"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onRemove(course.id)}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                <Trash className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out already selected courses from the dropdown
  const availableCourses = userCourses.filter(
    (course) => !selectedCourses.find((selected) => selected.id === course.id),
  );

  return (
    <CustomCard
      title="Has SubCourse (Bundle)"
      topRightWidget={
        <ToggleSwitch
          className="text-xs"
          name={''}
          label=""
          onChange={(e) => {
            if (bodyType !== 'subCourses') {
              setBodyType('subCourses');
            } else {
              setBodyType('');
            }
          }}
          checked={bodyType === 'subCourses'}
        />
      }
    >
      {bodyType === 'subCourses' && (
        <div className="space-y-4">
          {/* Course Selection */}
          <SearchableSelect
            items={availableCourses.map((course) => ({
              value: course.id,
              label: course.title,
            }))}
            onSelect={handleCourseSelect}
            label="Select courses to add..."
            defaultValues={[]}
          />

          {/* Selected Courses List */}
          {selectedCourses.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Selected Courses:</h4>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedCourses.map((course) => course.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {selectedCourses.map((course, index) => (
                    <SortableItem
                      key={course.id}
                      course={course}
                      onRemove={handleRemoveCourse}
                      index={index}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {selectedCourses.length === 0 && bodyType === 'subCourses' && (
            <div className="text-gray-500 text-sm text-center py-4">
              No courses selected. Use the dropdown above to add courses.
            </div>
          )}
        </div>
      )}
    </CustomCard>
  );
}
