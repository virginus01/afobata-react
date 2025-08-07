import React, { useState, useCallback, useEffect } from 'react';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { toast } from 'sonner';
import { clearCache, getOpenAIResponse } from '@/app/actions';
import { capitalize } from '@/helpers/capitalize';
import { formatNumber } from '@/helpers/formatNumber';
import { isNull } from '@/helpers/isNull';
import { randomNumber } from '@/helpers/randomNumber';
import FormInput from '@/app/widgets/hook_form_input';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { api_credit_and_debit_ai_units, availableAiModels, BASE_AI_MODEL } from '@/src/constants';
import { CustomButton } from '@/app/widgets/custom_button';
import { modHeaders } from '@/helpers/modHeaders';
import { Bot, Brain, MessageSquarePlus, Sparkle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatAiText, parseJsonResponse } from '@/app/utils/ai/ai_helpers';
import { FaWandMagicSparkles } from 'react-icons/fa6';

type AiGenerateChaptersProps = {
  data: string;
  type: string;
  siteInfo: BrandType;
  user: UserTypes;
  onCompletion: (data: ChapterType[]) => void;
  title: string;
  label: string;
  setChapters: (chapters: ChapterType[]) => void;
  setValue: (name: string, value: any) => void;
};

export default function AiGenerateChapters({
  title,
  data,
  onCompletion,
  type,
  label,
  setChapters,
  setValue,
  siteInfo,
  user,
}: AiGenerateChaptersProps) {
  const [generate, setGenerate] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [model, setModel] = useState<AiModelType>(BASE_AI_MODEL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numChapters, setNumChapters] = useState(5);
  const [numTopics, setNumTopics] = useState(5);
  const [message, setMessage] = useState<{
    type: 'error' | 'success' | 'info';
    content: string;
  } | null>(null);
  const [wordsPerTopic, setWordsPerTopic] = useState(150);
  const [unitCost, setUnitCost] = useState(0);
  const router = useRouter();

  const resetState = useCallback(() => {
    setGenerate(false);
    setIsGenerating(false);
    setMessage(null);
  }, []);

  useEffect(() => {
    if (!model) return;

    const modelCost = model?.unitValue ?? 0;
    const cost = wordsPerTopic * modelCost * numTopics;
    setUnitCost(Number(cost));
  }, [wordsPerTopic, numTopics, model]);

  const handleGenerate = useCallback(async () => {
    if (!title || title.trim() === '') {
      toast.error('Please provide a title before generating content');
      resetState();
      return;
    }

    setIsGenerating(true);
    setMessage({ type: 'success', content: 'Generating Content' });

    try {
      const url = await api_credit_and_debit_ai_units({ subBase: siteInfo?.slug });

      if (isNull(unitCost) || unitCost <= 0) {
        toast.error("Units can't be zero");
        return;
      }

      // Debit AI units before generation
      const body = {
        userId: user?.id,
        unit: unitCost,
        type: 'debit',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(body),
      });

      const res = await response.json();
      if (!res.status) {
        toast.error(res.msg);
        return;
      }

      clearCache('user');
      clearCache('users');
      router.refresh();

      // Step 1: Generate Chapters
      const chaptersInstruction = `You're a skilled blog content writer. Generate ${numChapters} well-structured chapters for a course titled "${title}". Avoid using words like chapter 1, chapter 2 etc in the title. Respond in valid JSON format:
    {"chapters": [{"title": "Chapter title", "description": "Brief chapter description"}]}`;

      const rawChaptersResponse = await getOpenAIResponse({
        prompt: `List exactly ${numChapters} chapters for the course titled "${title}"`,
        model: model || BASE_AI_MODEL || '',
        instruction: chaptersInstruction,
      });

      // Define an explicit interface for the expected response
      interface ChapterResponse {
        chapters?: Array<{
          title?: string;
          description?: string;
        }>;
      }

      // Parse and type-check the response
      const chaptersResponse = parseJsonResponse(
        rawChaptersResponse,
        'chapters',
      ) as ChapterResponse;

      // Initialize an empty array for chapters
      let generatedChapters: ChapterType[] = [];

      // Only proceed with mapping if chaptersResponse.chapters exists and is an array
      if (
        chaptersResponse &&
        chaptersResponse.chapters &&
        Array.isArray(chaptersResponse.chapters)
      ) {
        generatedChapters = chaptersResponse.chapters.map((chapter, index) => ({
          id: `chapter_${randomNumber(10)}_${Math.random().toString(36).substring(2, 9)}`,
          title: chapter?.title || `Chapter ${index + 1}`,
          description: formatAiText(chapter?.description || ''),
          topics: [],
        }));
      } else {
        console.error('Invalid chapters response:', chaptersResponse);
        throw new Error('Failed to generate chapters');
      }

      setChapters(generatedChapters);
      setMessage({
        type: 'success',
        content: `Generated ${generatedChapters.length} chapters. Now generating topics...`,
      });

      for (let i = 0; i < generatedChapters.length; i++) {
        const chapter = generatedChapters[i];

        try {
          const topicsInstruction = `Generate ${numTopics} topics under the chapter titled "${chapter.title}" as part of the course "${title}". 
        Respond in valid JSON format: 
        {"topics": [{"title": "Topic title", "description": "Brief topic description"}]}`;

          const rawTopicsResponse = await getOpenAIResponse({
            prompt: `List exactly ${numTopics} topics for the chapter titled "${chapter.title}"`,
            model: model || BASE_AI_MODEL || '',
            instruction: topicsInstruction,
          });

          // Define an explicit interface for the expected topics response
          interface TopicResponse {
            topics?: Array<{
              title?: string;
              description?: string;
            }>;
          }

          // Parse and type-check the response
          const topicsResponse = parseJsonResponse(rawTopicsResponse, 'topics') as TopicResponse;

          // Initialize an empty array for topics
          let topicsWithoutContent: ChapterType[] = [];

          // Only proceed if topicsResponse.topics exists and is an array
          if (topicsResponse && topicsResponse.topics && Array.isArray(topicsResponse.topics)) {
            topicsWithoutContent = topicsResponse.topics.map(
              (topic) =>
                ({
                  id: `topic_${randomNumber(10)}_${Math.random().toString(36).substring(2, 9)}`,
                  title: topic?.title || 'Untitled Topic',
                  description: formatAiText(topic?.description || ''),
                  body: '',
                  chapterId: chapter.id,
                }) as any,
            );
          } else {
            setMessage({
              type: 'error',
              content: `Failed to generate topics for chapter: ${chapter.title}`,
            });
            continue;
          }

          // Assign the generated topics to the chapter before proceeding
          generatedChapters[i].topics = topicsWithoutContent;

          // Update the state to show topics being generated
          setChapters([...generatedChapters]);
          setMessage({
            type: 'success',
            content: `Generated topics for chapter: ${chapter.title}. Now generating content...`,
          });

          let topicsWithContent = [];

          // Only proceed if topicsResponse.topics exists and is an array
          if (topicsResponse && topicsResponse.topics && Array.isArray(topicsResponse.topics)) {
            for (let j = 0; j < topicsResponse.topics.length; j++) {
              const topic = topicsResponse.topics[j] || {
                title: 'Untitled Topic',
                description: '',
              };
              const topicTitle = topic.title || 'Untitled Topic';

              try {
                const contentInstruction = `Write a detailed explanation for the course module "${topicTitle}" under the chapter "${chapter.title}" in the course "${title}". 
              Include key concepts, examples, and practical applications. Ensure the response has approximately ${wordsPerTopic} words.
              Respond in valid JSON format:
              {"content": "Detailed topic content here"}`;

                const rawContentResponse = await getOpenAIResponse({
                  prompt: `Write detailed content (~${wordsPerTopic} words) for the topic "${topicTitle}"`,
                  model: model || BASE_AI_MODEL || '',
                  instruction: contentInstruction,
                });

                // Define an explicit interface for the expected content response
                interface ContentResponse {
                  content?: string;
                }

                // Parse and type-check the response
                const contentResponse = parseJsonResponse(
                  rawContentResponse,
                  'content',
                ) as ContentResponse;

                if (!contentResponse || !contentResponse.content) {
                  throw new Error(`Failed to generate content for topic: ${topicTitle}`);
                }

                // Ensure we have a valid index before accessing
                if (
                  i >= 0 &&
                  i < generatedChapters.length &&
                  j >= 0 &&
                  j < (generatedChapters[i].topics ?? []).length
                ) {
                  const topicId = (generatedChapters[i].topics ?? [])[j].id;

                  topicsWithContent.push({
                    id: topicId,
                    title: topicTitle,
                    description: formatAiText(topic.description || ''),
                    chapterId: chapter.id,
                    body: formatAiText(contentResponse.content),
                  });

                  // Update the chapter's topic with the generated content
                  (generatedChapters[i].topics ?? [])[j].body = formatAiText(
                    contentResponse.content,
                  );
                }

                // Update the state after each topic's content is generated
                setChapters([...generatedChapters]);

                setMessage({ type: 'success', content: `Generated content for "${topicTitle}"` });
              } catch (contentError) {
                console.error(`Error generating content for topic "${topicTitle}":`, contentError);

                const errorMessage = `Content generation failed. ${wordsPerTopic} words expected.`;

                // Ensure we have a valid index before accessing
                if (
                  i >= 0 &&
                  i < generatedChapters.length &&
                  j >= 0 &&
                  j < (generatedChapters[i].topics ?? []).length
                ) {
                  const topicId = (generatedChapters[i].topics ?? [])[j].id;

                  topicsWithContent.push({
                    id: topicId,
                    title: topicTitle,
                    description: formatAiText(topic.description || ''),
                    body: '',
                    chapterId: chapter.id,
                    content: errorMessage,
                  });

                  // Update the chapter's topic with the error message
                  (generatedChapters[i].topics ?? [])[j].message = errorMessage;
                }

                // Update the state after each topic's content generation fails
                setChapters([...generatedChapters]);
              }
            }
          }

          // Only update if we have content
          if (topicsWithContent.length > 0) {
            // Assign topics with body content to the current chapter
            generatedChapters[i].topics = topicsWithContent;

            // Update the state after all topics for this chapter are processed
            setChapters([...generatedChapters]);
          }
        } catch (topicError) {
          console.error(`Error generating topics for chapter "${chapter.title}":`, topicError);
          generatedChapters[i].topics = [];
          setMessage({
            type: 'error',
            content: `Failed to generate topics for "${chapter.title}"`,
          });

          // Update the state to reflect the failure
          setChapters([...generatedChapters]);
        }
      }

      onCompletion(generatedChapters);
      toast.success('Chapter, topic, and content generation completed!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('An error occurred during content generation');
    } finally {
      setIsGenerating(false);
      setMessage(null);
    }
  }, [
    title,
    numChapters,
    numTopics,
    wordsPerTopic,
    model,
    setChapters,
    onCompletion,
    resetState,
    unitCost,
    user?.id,
    siteInfo?.slug,
    router,
  ]);

  // Toggle handler with validation
  const handleStartGenerate = useCallback(() => {
    const newGenerateState = !generate;
    setGenerate(newGenerateState);

    if (newGenerateState && !isGenerating) {
      handleGenerate();
    }
  }, [generate, isGenerating, handleGenerate]);

  return (
    <div className="space-y-3">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row justify-between space-x-4 text-xs items-center">
          <div> {label}</div> <FaWandMagicSparkles size={20} />
        </div>
        <div className="text-xs">Units Balance: {formatNumber(user.ai_units ?? 0)}</div>
        <div className="flex items-center gap-2">
          {isGenerating && <span className="text-xs text-blue-600">Generating...</span>}
          <ToggleSwitch
            className="text-xs flex flex-row justify-between"
            name="ai-generate"
            label=""
            onChange={() => setIsGenerateOpen(!isGenerateOpen)}
            checked={isGenerateOpen}
          />
        </div>
      </div>

      {/* Settings Panel */}
      {isGenerateOpen && (
        <div className="p-3 bg-gray-50 rounded-md space-y-3">
          <div className="flex flex-col space-y-4">
            <div className="w-full h-full flex flex-row space-x-1 items-center justify-between">
              <SearchableSelect
                defaultValues={[model.id ?? '']}
                items={availableAiModels as any}
                onSelect={(v: any) => {
                  const md = availableAiModels.find((m) => m.id === v);
                  setModel(md ?? {});
                }}
                showSearch={false}
                label="Model"
              />

              <div className="h-full w-full">
                <FormInput
                  showPrefix={false}
                  label="Number of Chapters"
                  type="number"
                  min={1}
                  max={50}
                  name="numChapters"
                  value={numChapters.toString()}
                  onBlur={(e) => {
                    const nt = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                    setValue('numChapters', nt);
                    setNumChapters(nt);
                  }}
                  disabled={isGenerating}
                />
              </div>
            </div>
            <div className="h-full w-full flex flex-row space-x-1 items-center justify-between">
              <FormInput
                showPrefix={false}
                label="Topics per chapter"
                type="number"
                min={1}
                max={20}
                name="numTopics"
                value={numTopics.toString()}
                onBlur={(e) => {
                  const nt = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
                  setValue('numTopics', nt);
                  setNumTopics(nt);
                }}
                disabled={isGenerating}
              />

              <FormInput
                showPrefix={false}
                label="Words per Topic"
                type="number"
                min={50}
                max={1000}
                step={50}
                name="wordsPerTopic"
                defaultValue={wordsPerTopic.toString()}
                onBlur={(e) => {
                  const wpt = Math.max(50, Math.min(1000, parseInt(e.target.value) || 50));

                  setWordsPerTopic(wpt);
                  setValue('wordsPerTopic', wpt);
                }}
                disabled={isGenerating}
              />
            </div>
          </div>
          {message ? (
            <i
              className={`text-xs flex justify-center items-center w-full ${
                message.type === 'success' ? 'text-blue-700' : 'text-red-700'
              } py-5`}
            >
              {message.content}
            </i>
          ) : (
            <div className="pt-10">
              <CustomButton
                submitting={isGenerating}
                submittingText="Generating"
                disabled={isGenerating}
                onClick={handleStartGenerate}
              >
                Generate {capitalize(type)} @ {unitCost.toFixed(3)} units
              </CustomButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
