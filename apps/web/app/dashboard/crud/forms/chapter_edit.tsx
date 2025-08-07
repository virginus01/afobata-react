import { CustomButton } from "@/app/widgets/custom_button";
import FormInput from "@/app/widgets/hook_form_input";
import React, { useState } from "react";
import CustomCard from "@/app/widgets/custom_card";
import { Save } from "lucide-react";
import Body from "../body";
import { UseFormReturn } from "react-hook-form";
import ImageUploadGallary from "@/app/media/editor_image_gallary";

interface ChapterFormProps {
  type: string;
  currentChapter: { id: string; title: string; body: string; description: string; image: FileType };
  updateCurrentChapter: (topic: any, field: string, value: any) => void;
  updateChapter: (topic: any) => void;
  setEditMode: (value: boolean) => void;
  methods: UseFormReturn<any>;
  bodyType: string;
  siteInfo: BrandType;
  user: UserTypes;
  setValue: (name: string, value: any) => void;
  title: string;
}

const ChapterForm: React.FC<ChapterFormProps> = ({
  type,
  currentChapter,
  updateCurrentChapter,
  updateChapter,
  setEditMode,
  setValue,
  title,
  bodyType,
  siteInfo,
  user,
  methods,
}) => {
  const contentPrompt = `Write a detailed explanation for the course module "${title}" under the chapter "${currentChapter.title}" in the course "${title}". 
              Include key concepts, examples, and practical applications. Ensure the response has approximately {wordsLength} words.
              Respond in valid JSON format:
              {"content": "Detailed topic content here"}`;
  return (
    <>
      <div className="flex flex-col space-y-4 py-4 px-1">
        <div className="flex flex-col w-full sm:flex-row sm:space-x-2">
          <div className="w-full sm:w-4/5">
            <CustomCard title={title}>
              <div className="flex flex-col space-y-6">
                <FormInput
                  key={`${currentChapter.id}-title`}
                  name={`${type}_${currentChapter.id}_${"title"}`}
                  label={"Title"}
                  defaultValue={currentChapter.title}
                  onBlur={(e) => updateCurrentChapter(currentChapter, "title", e.target.value)}
                />

                <FormInput
                  type="textarea"
                  rows={3}
                  key={`${currentChapter.id}-description`}
                  name={`${type}_${currentChapter.id}_${"description"}`}
                  label={"Description (optional)"}
                  defaultValue={currentChapter.description}
                  onBlur={(e) =>
                    updateCurrentChapter(currentChapter, "description", e.target.value)
                  }
                />
              </div>
            </CustomCard>
          </div>
          <div className="w-full sm:w-1/5 mt-4 sm:mt-0">
            <CustomCard title={"Image"}>
              <ImageUploadGallary
                maxImages={1}
                onImagesSelected={(image: FileType[]) => {
                  updateCurrentChapter(currentChapter, "image", image[0]);
                }}
                user={user}
                siteInfo={siteInfo}
                initialImages={currentChapter.image ? [currentChapter.image] : []}
              />
            </CustomCard>
          </div>
        </div>

        <Body
          setValue={setValue}
          setBody={(body: string) => {
            updateCurrentChapter(currentChapter, "body", body);
          }}
          title={currentChapter.title}
          prompt={contentPrompt}
          methods={methods}
          body={currentChapter.body ?? ""}
          setBodyType={() => {}}
          bodyType={"plain"}
          siteInfo={siteInfo}
          user={user}
        />

        <div className="flex justify-end space-x-2 mt-6">
          <div className="w-auto h-8">
            <CustomButton
              icon={<Save className="h-4 w-4" />}
              onClick={() => updateChapter(currentChapter)}
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

export default ChapterForm;
