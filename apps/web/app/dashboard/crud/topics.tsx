import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CustomModal from '@/app/widgets/custom_modal';
import FormInput from '@/app/widgets/hook_form_input';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { Edit, Trash } from 'lucide-react';
import CustomDrawer from '@/app/src/custom_drawer';
import { capitalize } from '@/app/helpers/capitalize';
import { countWords } from '@/app/helpers/text';
import {
  ErrorOption,
  EventType,
  FieldArray,
  FieldArrayPath,
  FieldError,
  FieldErrors,
  FieldName,
  FieldValues,
  FormState,
  InternalFieldName,
  ReadFormState,
  RegisterOptions,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormRegisterReturn,
  UseFormReturn,
} from 'react-hook-form';
import { toast } from 'sonner';
import AiGenerate from '@/app/utils/ai_generate';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import TopicForm from '@/dashboard/crud/forms/topic_edit';

export default function Topics({
  setValue,
  setTopics,
  topics = [],
  type = 'topic',
  title = '',
  chapterId = '',
  setBodyType,
  bodyType,
  siteInfo,
  user,
  methods,
  isNested = false,
  setChapters,
  chapters,
}: {
  setValue: (name: string, value: any) => void;
  setTopics: React.Dispatch<React.SetStateAction<TopicType[]>>;
  setChapters: React.Dispatch<React.SetStateAction<ChapterType[]>>;
  chapters: ChapterType[];
  topics: TopicType[];
  type?: 'topic' | 'module' | 'chapter';
  title?: string;
  chapterId?: any;
  setBodyType: React.Dispatch<React.SetStateAction<string>>;
  methods: UseFormReturn<any>;
  bodyType: string;
  siteInfo: BrandType;
  user: UserTypes;
  isNested?: boolean;
}) {
  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const [newTopic, setNewTopic] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleTopicUpdate = (prevTopics: TopicType[], newTopics: TopicType[]): TopicType[] => {
    const existingTopicsMap = new Map(prevTopics.map((topic) => [topic.id, topic]));
    const updatedTopics = [...prevTopics];
    newTopics.forEach((newTopic) => {
      if (existingTopicsMap.has(newTopic.id)) {
        const existingIndex = updatedTopics.findIndex((t) => t.id === newTopic.id);
        updatedTopics[existingIndex] = {
          ...updatedTopics[existingIndex],
          ...newTopic,
        };
      } else {
        updatedTopics.push(newTopic);
      }
    });

    return updatedTopics;
  };

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
      setTopics(() => {
        const oldIndex = topics.findIndex((item) => item.id === active.id);
        const newIndex = topics.findIndex((item) => item.id === over.id);
        return arrayMove(topics, oldIndex, newIndex);
      });
    }

    if (!over) return;

    if (active.id === over.id) return;

    // Find the chapter that contains the topic
    const parentChapter = chapters?.find((c) => c.topics?.some((t) => t.id === active.id));

    if (!parentChapter) return;

    setChapters((prevChapters: ChapterType[]) =>
      prevChapters.map((chapter) => {
        if (chapter.id === parentChapter.id) {
          // Find indexes of the dragged topic
          const oldIndex = chapter?.topics?.findIndex((t) => t.id === active.id);
          const newIndex = chapter?.topics?.findIndex((t) => t.id === over.id);

          const updatedTopics = arrayMove(chapter?.topics!, oldIndex!, newIndex!);

          // Capture the reordered topics
          setTopics(updatedTopics);

          return {
            ...chapter,
            topics: updatedTopics, // Update the topics within the chapter
          };
        }
        return chapter;
      }),
    );

    setTimeout(() => {
      window.scrollTo(0, scrollY); // Restore scroll position
    }, 0);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setTopics([
        ...topics,
        { id: Date.now().toString(), title: newTopic.trim(), chapterId: chapterId },
      ]);
      setNewTopic('');
      setValue('new_chapter_title', '');
      setIsModalOpen(false);
    }
  };

  const editTopic = (topic: any) => {
    setCurrentTopic(topic);

    Object.keys(topic).map((t) => {
      setValue(`${type}_${topic.id}_${t}`, topic[t]);
    });

    setEditMode(true);
  };

  const updateTopic = (currentTopic: TopicType) => {
    setTopics(() =>
      topics.map((topic) => (topic.id === currentTopic.id ? { ...currentTopic } : topic)),
    );

    setEditMode(false);
  };

  const updateCurrentTopic = (ediedTopic: TopicType, key: string, value: any) => {
    setCurrentTopic({ ...ediedTopic, [key]: value });
  };

  const removeTopic = (id: string) => {
    setTopics(() => topics.filter((topic) => topic.id !== id));
  };

  function Content() {
    return (
      <div className="w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {topics?.map((topic) => (
                <SortableItem
                  key={topic.id}
                  topic={topic}
                  onEdit={editTopic}
                  onRemove={removeTopic}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setNewTopic('');
          }}
          className={`mt-4 w-full py-2 text-xs border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors ${
            title ?? 'text-xs'
          }`}
        >
          + Add {capitalize(type)} {title ?? `For ${title}`}
        </button>

        {isModalOpen && (
          <CustomModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Enter ${type.toUpperCase()}`}
          >
            <div className="w-full mx-auto px-20">
              <CustomCard title="Topic">
                <div className="w-full">
                  <FormInput
                    type="text"
                    onBlur={(e) => {
                      setNewTopic(e.target.value);
                    }}
                    className="mt-2 p-2 border rounded w-full"
                    label="Topic Title"
                    name={'AddTC'}
                  />
                </div>
                <div className="flex flex-row space-x-2 w-full h-6 justify-end mt-10">
                  <div className="w-16">
                    <CustomButton
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-300"
                    >
                      Cancel
                    </CustomButton>
                  </div>
                  <div className="w-16">
                    <CustomButton onClick={addTopic} type="button">
                      Add
                    </CustomButton>
                  </div>
                </div>
              </CustomCard>
            </div>
          </CustomModal>
        )}

        {editMode && currentTopic && (
          <CustomDrawer
            isOpen={editMode}
            direction="right"
            isWidthFull={false}
            showHeader={true}
            isHeightFull={true}
            onClose={() => {
              setEditMode(false);
            }}
            header={`Edit ${currentTopic.title}`}
          >
            <TopicForm
              type={type}
              currentTopic={currentTopic}
              updateCurrentTopic={updateCurrentTopic}
              updateTopic={updateTopic}
              setEditMode={setEditMode}
              bodyType={''}
              title={methods.watch('title')}
              siteInfo={siteInfo}
              user={user}
              setValue={setValue}
              methods={methods}
            />
          </CustomDrawer>
        )}
      </div>
    );
  }

  if (isNested) {
    return <Content />;
  }

  return (
    <CustomCard
      title="Has Topics"
      topRightWidget={
        <ToggleSwitch
          className="text-xs"
          name={''}
          label=""
          onChange={(e) => {
            if (bodyType !== 'topics') {
              setBodyType('topics');
            } else {
              setBodyType('');
            }
          }}
          checked={bodyType === 'topics'}
        />
      }
      bottomWidget={
        bodyType === 'topics' && (
          <AiGenerate
            siteInfo={siteInfo}
            user={user}
            label={'Write Topics With AI'}
            title={methods.watch('title')}
            data={methods.watch('description')}
            type={'topics'}
            setTopics={(newTopics: TopicType[]) => {
              setTopics(() => handleTopicUpdate(topics, newTopics));
            }}
            onCompletion={(topics) => {
              toast.success(`Completed: ${topics.length} generated`);
            }}
            setValue={setValue}
          />
        )
      }
    >
      {bodyType === 'topics' && <Content />}
    </CustomCard>
  );
}

function SortableItem({
  topic,
  onEdit,
  onRemove,
}: {
  topic: any;
  onEdit: (topic: any) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: topic.id,
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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white rounded shadow cursor-move"
    >
      <div className="flex flex-row space-x-3 justify-between">
        <div className="flex flex-row space-x-3">
          <div className="touch-none"> ⋮⋮</div>{' '}
          {/* Add touch-none to prevent default touch behavior */}
          <div className="text-xs">
            {topic.title} ({countWords(topic.body)})
          </div>
        </div>
        <div
          className="flex flex-row justify-end items-center space-x-2 ml-2"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(topic)}
            className="text-green-500 hover:text-green-700"
            type="button"
          >
            <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
          </button>
          <button
            onClick={() => onRemove(topic.id)}
            className="text-red-500 hover:text-red-700"
            type="button"
          >
            <Trash className="h-3 sm:h-4 w-3 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
