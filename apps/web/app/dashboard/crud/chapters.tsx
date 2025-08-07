import React, { useEffect, useState } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
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
import Topics from '@/dashboard/crud/topics';
import AiGenerateChapters from '@/app/utils/ai_generate_chapters';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import ChapterForm from '@/dashboard/crud/forms/chapter_edit';

export default function Chapters({
  setValue,
  setChapters,
  chapters,
  type = 'chapter',
  setBodyType,
  bodyType,
  siteInfo,
  user,
  methods,
}: {
  setValue: (name: string, value: any) => void;
  setChapters: React.Dispatch<React.SetStateAction<ChapterType[]>>;
  setBodyType: React.Dispatch<React.SetStateAction<string>>;
  methods: UseFormReturn<any>;
  chapters: ChapterType[];
  type?: 'topic' | 'module' | 'chapter';
  bodyType: string;
  siteInfo: BrandType;
  user: UserTypes;
}) {
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [newChapter, setNewChapter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [chapterTopics, setChapterTopics] = useState<ChapterType[]>([]);

  useEffect(() => {
    if (!chapterTopics || chapterTopics.length === 0) return;

    setChapters((prevChapters) =>
      prevChapters.map((chapter) => {
        const chapterRelatedTopics = handleTopicUpdate(
          chapter.topics ?? [],
          chapterTopics.filter((topic: TopicType) => topic.chapterId === chapter.id),
        );

        return {
          ...chapter,
          topics: chapterRelatedTopics,
        };
      }),
    );
  }, [chapterTopics, setChapters]);

  const handleChapterUpdate = (
    prevChapters: ChapterType[],
    newChapters: ChapterType[],
  ): ChapterType[] => {
    const existingChaptersMap = new Map(prevChapters.map((chapter) => [chapter.id, chapter]));
    const updatedChapters = [...prevChapters];
    newChapters.forEach((newChapter) => {
      if (existingChaptersMap.has(newChapter.id)) {
        const existingIndex = updatedChapters.findIndex((t) => t.id === newChapter.id);
        updatedChapters[existingIndex] = {
          ...updatedChapters[existingIndex],
          ...newChapter,
        };
      } else {
        updatedChapters.push(newChapter);
      }
    });

    return updatedChapters;
  };

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
      setChapters((items: ChapterType[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 0);
  };

  const addChapter = () => {
    if (newChapter.trim()) {
      const newChapterObj = { id: Date.now().toString(), title: newChapter.trim(), topics: [] };

      setChapters((prevChapters) => {
        const allChapters: ChapterType[] = handleChapterUpdate(prevChapters, [newChapterObj]);
        return allChapters;
      });

      setNewChapter('');
      setValue('new_chapter_title', '');
      setIsModalOpen(false);
    }
  };

  const editChapter = (chapter: any) => {
    setCurrentChapter(chapter);

    Object.keys(chapter).map((t) => {
      setValue(`${type}_${chapter.id}_${t}`, chapter[t]);
    });

    setEditMode(true);
  };

  const updateChapter = (currentChapter: ChapterType) => {
    setChapters((prevChapters: ChapterType[]) =>
      prevChapters.map((chapter) =>
        chapter.id === currentChapter.id ? { ...currentChapter } : chapter,
      ),
    );
    setEditMode(false);
  };

  const updateCurrentChapter = (ediedChapter: ChapterType, key: string, value: any) => {
    setCurrentChapter({ ...ediedChapter, [key]: value });
  };

  useEffect(() => {}, [currentChapter]);

  const removeChapter = (id: string) => {
    setChapters((prevChapters: ChapterType[]) =>
      prevChapters.filter((chapter) => chapter.id !== id),
    );
  };

  function SortableItem({
    chapter,
    onEdit,
    onRemove,
    index,
  }: {
    chapter: any;
    onEdit: (chapter: any) => void;
    onRemove: (id: string) => void;
    index: number;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: chapter.id,
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
                Chapter {index + 1}: {chapter.title}
              </div>
            </div>
            <div
              className="flex flex-row justify-end items-center space-x-2 ml-2"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onEdit(chapter)}
                className="text-green-500 hover:text-green-700"
                type="button"
              >
                <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>
              <button
                onClick={() => onRemove(chapter.id)}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                <Trash className="h-3 sm:h-4 w-3 sm:w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="ml-10" key={`${chapter.id}`}>
          <Topics
            chapterId={chapter.id}
            chapters={chapters}
            setChapters={setChapters}
            type="module"
            title={`Chapter ${index + 1}`}
            setValue={setValue}
            setTopics={setChapterTopics}
            topics={chapter.topics ?? []}
            user={user}
            siteInfo={siteInfo}
            methods={methods}
            setBodyType={setBodyType}
            bodyType={bodyType}
            isNested={true}
          />
        </div>
      </div>
    );
  }

  return (
    <CustomCard
      title="Has Chapters"
      topRightWidget={
        <ToggleSwitch
          className="text-xs"
          name={''}
          label=""
          onChange={(e) => {
            if (bodyType !== 'chapters') {
              setBodyType('chapters');
            } else {
              setBodyType('');
            }
          }}
          checked={bodyType === 'chapters'}
        />
      }
      bottomWidget={
        bodyType === 'chapters' && (
          <AiGenerateChapters
            siteInfo={siteInfo}
            user={user}
            label={'Write Chapters With AI'}
            title={methods.watch('title')}
            data={methods.watch('description')}
            type={'chapters'}
            setChapters={(newChapters: ChapterType[]) => {
              setChapters((prevChapters) => handleChapterUpdate(prevChapters, newChapters));
            }}
            onCompletion={(chapters) => {
              toast.success(`Completed: ${chapters.length} generated`);
            }}
            setValue={setValue}
          />
        )
      }
    >
      {bodyType === 'chapters' && (
        <div className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chapters.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {chapters.map((chapter, i) => (
                  <SortableItem
                    index={i}
                    key={chapter.id}
                    chapter={chapter}
                    onEdit={editChapter}
                    onRemove={removeChapter}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setNewChapter('');
            }}
            className="mt-4 w-full py-2 border text-xs border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            + Add {capitalize(type)}
          </button>

          {isModalOpen && (
            <CustomModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title={`Enter ${type.toUpperCase()}`}
            >
              <div className="w-auto mx-auto px-20">
                <CustomCard title="Chapter">
                  <div className="w-full">
                    <FormInput
                      type="text"
                      onChange={(e) => {
                        setNewChapter(e.target.value);
                      }}
                      className="mt-2 p-2 border rounded w-full"
                      label="Chapter Title"
                      name="AddTC"
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
                      <CustomButton onClick={addChapter} type="button">
                        Add
                      </CustomButton>
                    </div>
                  </div>
                </CustomCard>
              </div>
            </CustomModal>
          )}

          {editMode && currentChapter && (
            <CustomDrawer
              isOpen={editMode}
              direction="right"
              isWidthFull={false}
              showHeader={true}
              isHeightFull={true}
              onClose={() => {
                setEditMode(false);
              }}
              header={`Edit ${currentChapter.title}`}
            >
              <ChapterForm
                type={type}
                currentChapter={currentChapter}
                updateCurrentChapter={updateCurrentChapter}
                updateChapter={updateChapter}
                setEditMode={setEditMode}
                methods={methods}
                bodyType={''}
                siteInfo={siteInfo}
                user={user}
                setValue={setValue}
                title={methods.watch('title')}
              />
            </CustomDrawer>
          )}
        </div>
      )}
    </CustomCard>
  );
}
