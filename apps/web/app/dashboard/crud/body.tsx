import React, { useCallback, useEffect, useState } from 'react';
import FormInput from '@/app/widgets/hook_form_input';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { capitalize } from '@/app/helpers/capitalize';
import { formatNumber } from '@/app/helpers/formatNumber';
import { isNull } from '@/app/helpers/isNull';
import { stripHtml } from '@/app/helpers/stripHtml';
import { truncateText } from '@/app/helpers/text';
import { UseFormReturn } from 'react-hook-form';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { FaEdit, FaPlus } from 'react-icons/fa';
import ProductDetailsComponent from '@/dashboard/crud/details_sidebar';
import {
  api_credit_and_debit_ai_units,
  availableAiModels,
  BASE_AI_MODEL,
} from '@/app/src/constants';
import { useRouter } from 'next/navigation';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { toast } from 'sonner';
import { modHeaders } from '@/app/helpers/modHeaders';
import { clearCache, getOpenAIResponse } from '@/app/actions';
import { formatAiText, parseJsonResponse } from '@/app/utils/ai/ai_helpers';
import { FaWandMagicSparkles } from 'react-icons/fa6';

export default function Body({
  setValue,
  setBody,
  body = '<p> </p>',
  type = 'plain',
  title = '',
  prompt = '',
  setBodyType,
  bodyType,
  siteInfo,
  user,
  methods,
  isNested = false,
}: {
  setValue: (name: string, value: any) => void;
  setBody: (body: string) => void;
  body: string;
  type?: 'topic' | 'module' | 'chapter' | 'plain';
  prompt?: string;
  title?: string;
  setBodyType: React.Dispatch<React.SetStateAction<string>>;
  methods: UseFormReturn<any>;
  bodyType: string;
  siteInfo: BrandType;
  user: UserTypes;
  isNested?: boolean;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [model, setModel] = useState<AiModelType>(BASE_AI_MODEL);
  const [wordsLength, setwordsLength] = useState(150);
  const [unitCost, setUnitCost] = useState(0);
  const [message, setMessage] = useState<{
    type: 'error' | 'success' | 'info';
    content: string;
  } | null>(null);
  const router = useRouter();
  const [generate, setGenerate] = useState(false);

  const resetState = useCallback(() => {
    setGenerate(false);
    setIsGenerating(false);
    setMessage(null);
  }, []);

  useEffect(() => {
    if (!model) return;
    const modelCost = model?.unitValue ?? 0;
    const cost = wordsLength * modelCost;
    setUnitCost(Number(cost));
  }, [wordsLength, model]);

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

      // Step 1: Generate the list of topics
      const topicsInstruction = `You're a typical Nigerian skilled blog content writer who creates HTML SEO friendly, engaging, well-researched topics that ranks better on search engines in a real human tone. break down into topics, use bullet and numbering, font colors etc. Respond in valid JSON format with the following structure: {"content": "SEO-optimized conetnt for existing blog with tailwind css for beautifications"}`;

      const contentPrompt = `in not more than ${wordsLength} and In a real human tone, write SEO-optimized, long-form blog post content that aggressively targets top search rankings on the topic "${title.trim()}"`;

      let rawResponse;
      try {
        // Ensure we're passing valid, non-null values to the API
        rawResponse = await getOpenAIResponse({
          prompt: prompt.replace('{wordsLength}', `${wordsLength}`) || contentPrompt || '',
          model: model || BASE_AI_MODEL || '', // Added optional chaining
          instruction: topicsInstruction || '',
        });

        interface ContentResponse {
          content: string;
        }

        // Parse and type-check the response
        const contentResponse: ContentResponse = parseJsonResponse(
          rawResponse,
          'topics',
        ) as ContentResponse;

        if (!contentResponse || isNull(contentResponse.content)) {
          throw new Error(`Failed to parse AI response for: ${title}`);
        }

        setBody(formatAiText(contentResponse.content));
        setMessage({ type: 'success', content: 'Content generation completed!' });
      } catch (error) {
        console.error('Error generating content:', error);
        console.info('Raw response that caused error:', rawResponse);
        toast.error('Failed to generate content. Please try again.');
        resetState();
        return;
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('An error occurred during content generation');
    } finally {
      setIsGenerating(false);
      setMessage(null);
    }
  }, [title, model, wordsLength, unitCost, user, siteInfo, resetState, setBody, prompt, router]); // Added missing dependencies
  // Toggle handler with validation
  const handleStartGenerate = useCallback(() => {
    const newGenerateState = !generate;
    setGenerate(newGenerateState);

    if (newGenerateState && !isGenerating) {
      handleGenerate();
    }
  }, [generate, isGenerating, handleGenerate]);

  let models: AiModelType[] = [];

  availableAiModels.forEach((model) => {
    models.push({
      ...model,
      title: model?.title?.replace('{name}', (siteInfo.name ?? '').replace(' ', '-')),
    });
  });
  return (
    <div className="w-full">
      <CustomCard
        title="Has Plain Body Content"
        topRightWidget={
          <ToggleSwitch
            className="text-xs"
            name={''}
            label=""
            onChange={(e) => {
              if (bodyType !== 'plain') {
                setBodyType('plain');
              } else {
                setBodyType('');
              }
            }}
            checked={bodyType === 'plain'}
          />
        }
        bottomWidget={
          bodyType === 'plain' && (
            <div>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row justify-between space-x-4 text-xs items-center">
                  <div className="font-normal text-xs">
                    {isNull(body) ? 'Add with Ai' : 'Edit with Ai'}
                  </div>
                  <FaWandMagicSparkles size={20} />
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

              {isGenerateOpen && (
                <div className="p-3 bg-gray-50 rounded-md space-y-3">
                  <div className="flex flex-row space-x-1 h-full w-full items-center justify-between">
                    <div className="w-full h-full">
                      <SearchableSelect
                        defaultValues={[model.id ?? '']}
                        items={models as any}
                        onSelect={(v: any) => {
                          const md = models.find((m) => m.id === v);
                          setModel(md ?? {});
                        }}
                        showSearch={false}
                        label="Model"
                      />
                    </div>

                    <div className="h-full w-full">
                      <FormInput
                        showPrefix={false}
                        label="Words Length"
                        type="number"
                        min={50}
                        max={1000}
                        step={50}
                        name="wordsLength"
                        defaultValue={wordsLength.toString()}
                        onBlur={(e) => {
                          const wpt = Math.max(50, Math.min(1000, parseInt(e.target.value) || 50));
                          setwordsLength(wpt);
                          setValue('wordsLength', wpt);
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
          )
        }
      >
        {bodyType === 'plain' && (
          <div className="relative w-full py-5 sm:py-10">
            {/* Body text with very low contrast */}
            <div className="w-full text-xs text-gray-400 opacity-50">
              {truncateText(stripHtml(body ?? '<div></div>'))}
            </div>

            {/* Edit or Add button overlay */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="h-6 w-16">
                <CustomButton
                  onClick={() => setSidebarOpen(true)}
                  iconPosition="after"
                  icon={
                    isNull(body) ? <FaPlus className="h-3 w-3" /> : <FaEdit className="h-3 w-3" />
                  }
                >
                  <div className="font-bold">{isNull(body) ? 'Add' : 'Edit'}</div>{' '}
                </CustomButton>
              </div>
            </div>
          </div>
        )}
      </CustomCard>

      {isSidebarOpen && (
        <ProductDetailsComponent
          actionTitle={'Body'}
          isFull={true}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          header="Content"
          onCompleted={(content) => {
            setBody(content);
            setSidebarOpen(false);
          }}
          data={body!}
        />
      )}
    </div>
  );
}
