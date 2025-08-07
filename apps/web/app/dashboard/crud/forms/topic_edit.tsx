import { CustomButton } from '@/app/widgets/custom_button';
import FormInput from '@/app/widgets/hook_form_input';
import CustomCard from '@/app/widgets/custom_card';
import { Save } from 'lucide-react';
import Body from '@/dashboard/crud/body';
import { UseFormReturn } from 'react-hook-form';
import ImageUploadGallary from '@/app/media/editor_image_gallary';

interface TopicFormProps {
  title: string;
  type: string;
  currentTopic: { id: string; title: string; body: string; image: FileType; description: string };
  updateCurrentTopic: (topic: any, field: string, value: any) => void;
  updateTopic: (topic: any) => void;
  setEditMode: (value: boolean) => void;
  methods: UseFormReturn<any>;
  bodyType: string;
  siteInfo: BrandType;
  user: UserTypes;
  setValue: (name: string, value: any) => void;
}

const TopicForm: React.FC<TopicFormProps> = ({
  title,
  type,
  currentTopic,
  setValue,
  updateCurrentTopic,
  updateTopic,
  setEditMode,
  bodyType,
  siteInfo,
  user,
  methods,
}) => {
  const contentPrompt = `Write detailed, exactly {wordsLength} words, SEO-optimized content for the topic "${currentTopic.title}" as part of a blog post titled "${title}". Make the content engaging, informative, and well-structured with proper HTML formatting.`;

  return (
    <>
      <div className="flex flex-col space-y-4 py-4 px-1">
        <div className="flex flex-col w-full sm:flex-row sm:space-x-2">
          <div className="w-full sm:w-4/5">
            <CustomCard title={title}>
              <div className="flex flex-col space-y-6">
                <FormInput
                  key={`${currentTopic.id}-title`}
                  name={`${type}_${currentTopic.id}_${'title'}`}
                  label={'Title'}
                  defaultValue={currentTopic.title}
                  onBlur={(e) => updateCurrentTopic(currentTopic, 'title', e.target.value)}
                />

                <FormInput
                  type="textarea"
                  rows={3}
                  key={`${currentTopic.id}-description`}
                  name={`${type}_${currentTopic.id}_${'description'}`}
                  label={'Description (optional)'}
                  defaultValue={currentTopic.description}
                  onBlur={(e) => updateCurrentTopic(currentTopic, 'description', e.target.value)}
                />
              </div>
            </CustomCard>
          </div>
          <div className="w-full sm:w-1/5 mt-4 sm:mt-0">
            <CustomCard title={'Image'}>
              <ImageUploadGallary
                maxImages={1}
                onImagesSelected={(image: FileType[]) => {
                  updateCurrentTopic(currentTopic, 'image', image[0]);
                }}
                user={user}
                siteInfo={siteInfo}
                initialImages={currentTopic.image ? [currentTopic.image] : []}
              />
            </CustomCard>
          </div>
        </div>

        <Body
          setValue={setValue}
          setBody={(body: string) => {
            updateCurrentTopic(currentTopic, 'body', body);
          }}
          title={currentTopic.title}
          prompt={contentPrompt}
          methods={methods}
          body={currentTopic.body ?? ''}
          setBodyType={() => {}}
          bodyType={'plain'}
          siteInfo={siteInfo}
          user={user}
        />
        <div className="flex justify-end space-x-2 mt-6">
          <div className="w-auto h-8">
            <CustomButton
              icon={<Save className="h-4 w-4" />}
              onClick={() => updateTopic(currentTopic)}
              type="button"
            >
              update
            </CustomButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopicForm;
