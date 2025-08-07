import React, { useState, useCallback, useEffect } from 'react';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { toast } from 'sonner';
import { clearCache, getOpenAIResponse } from '@/app/actions';
import FormInput from '@/app/widgets/hook_form_input';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { api_credit_and_debit_ai_units, availableAiModels, BASE_AI_MODEL } from '@/src/constants';
import { CustomButton } from '@/app/widgets/custom_button';
import { modHeaders } from '@/helpers/modHeaders';
import { useRouter } from 'next/navigation';
import { parseJsonResponse } from '@/app/utils/ai/ai_helpers';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { isNull } from '@/helpers/isNull';
import { randomNumber } from '@/helpers/randomNumber';
import { capitalize } from '@/helpers/capitalize';

// Define proper TypeScript types
export type TopicType = {
  id: string;
  title: string;
  description: string;
  subTitle?: string;
  body?: string;
};

type AiGenerateContentProps = {
  data: string;
  type: string;
  siteInfo: BrandType;
  user: UserTypes;
  onCompletion: (data: TopicType[]) => void;
  title: string;
  label: string;
  setTopics: (topics: TopicType[]) => void;
  setValue: (name: string, value: any) => void;
};

export default function AiGenerateContent({
  title,
  data,
  onCompletion,
  type,
  label,
  setTopics,
  setValue,
  siteInfo,
  user,
}: AiGenerateContentProps) {
  const [generate, setGenerate] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [model, setModel] = useState<AiModelType>(BASE_AI_MODEL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numTopics, setNumTopics] = useState(5);
  const [wordsPerTopic, setWordsPerTopic] = useState(150);
  const [unitCost, setUnitCost] = useState(0);
  const [message, setMessage] = useState<{
    type: 'error' | 'success' | 'info';
    content: string;
  } | null>(null);
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
      const url = await api_credit_and_debit_ai_units({ subBase: siteInfo.slug });
      if (isNull(unitCost) || unitCost <= 0) {
        toast.error("Units can't be zero");
        setIsGenerating(false); // Added missing state reset
        setMessage(null);
        return;
      }

      const body = {
        userId: user.id,
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
        setIsGenerating(false); // Added missing state reset
        setMessage(null);
        return;
      }
      clearCache('user');
      clearCache('users');
      router.refresh();

      switch (type) {
        case 'topics': {
          // Step 1: Generate the list of topics
          const topicsInstruction = `You're a typical Nigerian skilled blog content writer who creates HTML SEO friendly, engaging, well-researched topics that ranks better on search engines in a real human tone. Respond in valid JSON format with the following structure: {"topics": [{"title": "SEO-optimized title of the topic", "description": "SEO-optimized short description of the topic"}]}`;

          const topicsPrompt = `List exactly ${numTopics} topics to be discussed on the blog post titled "${title.trim()}"`;

          let rawResponse;
          try {
            // Ensure we're passing valid, non-null values to the API
            rawResponse = await getOpenAIResponse({
              prompt: topicsPrompt || '',
              model: model || BASE_AI_MODEL || '', // Added optional chaining
              instruction: topicsInstruction || '',
            });

            interface TopicsResponse {
              topics: Array<{
                title?: string;
                description?: string;
              }>;
            }

            // Parse and type-check the response
            const topicsResponse: TopicsResponse = parseJsonResponse(
              rawResponse,
              'topics',
            ) as TopicsResponse;

            if (!topicsResponse || !topicsResponse.topics) {
              throw new Error(`Failed to parse AI response for: ${title}`);
            }

            // Validate response structure
            if (!Array.isArray(topicsResponse.topics)) {
              console.error('Invalid AI response format for topics', topicsResponse);
              throw new Error("AI response didn't contain valid topics array");
            }

            // Create topic objects with unique IDs
            const topics: TopicType[] = topicsResponse.topics.map((topic, index) => ({
              id: `topic_${randomNumber(10)}_${Math.random().toString(36).substring(2, 9)}`,
              title: topic?.title || `Topic ${index + 1}`,
              description: topic?.description || '',
            }));

            if (topics.length === 0) {
              toast.error('No topics were generated. Please try again.');
              resetState();
              return;
            }

            // Update state with initial topics - using handleTopicUpdate to avoid duplicates
            setTopics(topics);
            setMessage({
              type: 'success',
              content: `Generated ${topics.length} topics. Creating content...`,
            });
            // Step 2: Generate content for each topic in sequence
            const enhancedTopics: TopicType[] = [...topics];
            for (let i = 0; i < topics.length; i++) {
              const topic = topics[i];
              try {
                const contentInstruction = `You're a typical Nigerian skilled blog content writer who creates HTML SEO friendly, engaging, well-researched content that ranks better on search engines in a real human tone. Respond in valid JSON format with the following structure: { "content": {"title": "SEO optimized subtitle for this section", "body": "Detailed HTML content for this section"}}`;

                const contentPrompt = `Write detailed, exactly ${wordsPerTopic} words, SEO-optimized content for the topic "${topic.title}" as part of a blog post titled "${title}". Make the content engaging, informative, and well-structured with proper HTML formatting.`;

                let rawContentResponse;
                try {
                  rawContentResponse = await getOpenAIResponse({
                    prompt: contentPrompt || '',
                    model: model || BASE_AI_MODEL || '', // Added optional chaining
                    instruction: contentInstruction || '',
                  });

                  // Define an explicit interface for the expected content response
                  interface ContentResponse {
                    content: {
                      title: string;
                      body: string;
                    };
                  }

                  // Parse and type-check the response
                  const contentResponse: ContentResponse = parseJsonResponse(
                    rawContentResponse,
                    'content',
                  ) as ContentResponse;

                  if (!contentResponse || !contentResponse.content) {
                    throw new Error(`Failed to generate content for topic: ${topic.title}`);
                  }

                  // Update the enhanced topics array with the generated content
                  enhancedTopics[i] = {
                    ...topic,
                    subTitle: contentResponse.content.title || topic.title,
                    body: contentResponse.content.body ? contentResponse.content.body : topic.title,
                  };
                } catch (contentError) {
                  console.error(`Error getting content for topic "${topic.title}":`, contentError);
                  console.info('Raw content response:', rawContentResponse);

                  // Don't halt the entire process, just mark this topic as failed
                  enhancedTopics[i] = {
                    ...topic,
                    subTitle: topic.title,
                    body: `<p>Content generation failed. Please try again later.</p>`,
                  };
                  setMessage({
                    type: 'error',
                    content: `Failed to generate content for "${topic.title}"`,
                  });
                }

                // Update state with progress
                setTopics([...enhancedTopics]); // Create new array to ensure state update

                // Notify progress
                if ((i + 1) % 2 === 0 || i === topics.length - 1) {
                  setMessage({
                    type: 'success',
                    content: `Generated content for ${i + 1} of ${topics.length} topics`,
                  });
                }
              } catch (topicError) {
                console.error(`Error processing topic "${topic.title}":`, topicError);
                enhancedTopics[i] = {
                  ...topic,
                  subTitle: topic.title,
                  body: `<p>Failed to generate content for this topic.</p>`,
                };
                setTopics([...enhancedTopics]); // Create new array to ensure state update
              }
            }

            // Call completion handler with all enhanced topics
            onCompletion(enhancedTopics);
            setMessage({ type: 'success', content: 'Content generation completed!' });
          } catch (error) {
            console.error('Error generating topics:', error);
            console.info('Raw response that caused error:', rawResponse);
            toast.error('Failed to generate topics. Please try again.');
            resetState();
            return;
          }

          break;
        }

        // Handle other types here
        default:
          toast.error(`Unsupported generation type: ${type}`);
          break;
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('An error occurred during content generation');
    } finally {
      setIsGenerating(false);
      setMessage(null);
    }
  }, [
    title,
    type,
    model,
    numTopics,
    wordsPerTopic,
    onCompletion,
    setTopics,
    unitCost,
    user,
    siteInfo,
    resetState,
    router,
  ]); // Added missing dependencies
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
        <div className="text-xs">Units Balance: {user.ai_units ?? 0}</div>
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
          <div className="flex flex-row space-x-1 h-full w-full items-center justify-between">
            <div className="w-full h-full">
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
            </div>
            <div className="h-full w-full">
              <FormInput
                showPrefix={false}
                label="Number of Topics"
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
            </div>

            <div className="h-full w-full">
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
