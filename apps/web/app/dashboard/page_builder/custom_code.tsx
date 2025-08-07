import React, { useCallback, useState, useEffect } from 'react';
import FormInput from '@/app/widgets/hook_form_input';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { formatNumber } from '@/app/helpers/formatNumber';
import { isNull } from '@/app/helpers/isNull';
import { stripHtml } from '@/app/helpers/stripHtml';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { toast } from 'sonner';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { useRouter } from 'next/navigation';
import { modHeaders } from '@/app/helpers/modHeaders';
import { clearCache, getOpenAIResponse } from '@/app/actions';
import { formatAiText, parseJsonResponse } from '@/app/utils/ai/ai_helpers';
import { sanitizeHTML } from '@/app/helpers/html_helper';
import {
  api_credit_and_debit_ai_units,
  availableAiModels,
  BASE_AI_MODEL,
} from '@/app/src/constants';
import slugify from 'slugify';
import RichTextEditor from '@/app/widgets/rich_text_editor';

const startCode = `<div class="relative grid min-h-screen grid-cols-[1fr_2.5rem_auto_2.5rem_1fr] grid-rows-[1fr_1px_auto_1px_1fr] bg-white [--pattern-fg:var(--color-gray-950)]/5 dark:bg-gray-950 dark:[--pattern-fg:var(--color-white)]/10">
  <div class="col-start-3 row-start-3 flex max-w-lg flex-col bg-gray-100 p-2 dark:bg-white/10">
    <div class="rounded-xl bg-white p-10 text-sm/7 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
      <img src="/img/logo.svg" class="mb-11.5 h-6 dark:hidden" alt="Tailwind Play" />
      <img src="/img/logo-dark.svg" class="mb-11.5 h-6 not-dark:hidden" alt="Tailwind Play" />
      <div class="space-y-6">
        <p>An advanced online playground for Tailwind CSS, including support for things like:</p>
        <ul class="space-y-3">
          <li class="flex">
            <svg class="h-[1lh] w-5.5 shrink-0" viewBox="0 0 22 22" fill="none" stroke-linecap="square">
              <circle cx="11" cy="11" r="11" class="fill-sky-400/25" />
              <circle cx="11" cy="11" r="10.5" class="stroke-sky-400/25" />
              <path d="M8 11.5L10.5 14L14 8" class="stroke-sky-800 dark:stroke-sky-300" />
            </svg>
            <p class="ml-3">
              Customizing your theme with
              <code class="font-mono font-medium text-gray-950 dark:text-white">@theme</code>
            </p>
          </li>
          <li class="flex">
            <svg class="h-[1lh] w-5.5 shrink-0" viewBox="0 0 22 22" fill="none" stroke-linecap="square">
              <circle cx="11" cy="11" r="11" class="fill-sky-400/25" />
              <circle cx="11" cy="11" r="10.5" class="stroke-sky-400/25" />
              <path d="M8 11.5L10.5 14L14 8" class="stroke-sky-800 dark:stroke-sky-300" />
            </svg>
            <p class="ml-3">
              Adding custom utilities with
              <code class="font-mono font-medium text-gray-950 dark:text-white">@utility</code>
            </p>
          </li>
          <li class="flex">
            <svg class="h-[1lh] w-5.5 shrink-0" viewBox="0 0 22 22" fill="none" stroke-linecap="square">
              <circle cx="11" cy="11" r="11" class="fill-sky-400/25" />
              <circle cx="11" cy="11" r="10.5" class="stroke-sky-400/25" />
              <path d="M8 11.5L10.5 14L14 8" class="stroke-sky-800 dark:stroke-sky-300" />
            </svg>
            <p class="ml-3">
              Adding custom variants with
              <code class="font-mono font-medium text-gray-950 dark:text-white">@variant</code>
            </p>
          </li>
          <li class="flex">
            <svg class="h-[1lh] w-5.5 shrink-0" viewBox="0 0 22 22" fill="none" stroke-linecap="square">
              <circle cx="11" cy="11" r="11" class="fill-sky-400/25" />
              <circle cx="11" cy="11" r="10.5" class="stroke-sky-400/25" />
              <path d="M8 11.5L10.5 14L14 8" class="stroke-sky-800 dark:stroke-sky-300" />
            </svg>
            <p class="ml-3">Code completion with instant preview</p>
          </li>
        </ul>
        <p>Perfect for learning how the framework works, prototyping a new idea, or creating a demo to share online.</p>
      </div>
      <hr class="my-6 w-full border-(--pattern-fg)" />
      <p class="mb-3">Want to dig deeper into Tailwind?</p>
      <p class="font-semibold">
        <a href="https://tailwindcss.com/docs" class="text-gray-950 underline decoration-sky-400 underline-offset-3 hover:decoration-2 dark:text-white">Read the docs &rarr;</a>
      </p>
    </div>
  </div>
  <div class="relative -right-px col-start-2 row-span-full row-start-1 border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed"></div>
  <div class="relative -left-px col-start-4 row-span-full row-start-1 border-x border-x-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed"></div>
  <div class="relative -bottom-px col-span-full col-start-1 row-start-2 h-px bg-(--pattern-fg)"></div>
  <div class="relative -top-px col-span-full col-start-1 row-start-4 h-px bg-(--pattern-fg)"></div>
</div>`;

const CustomCodeWidget = ({
  siteInfo,
  brand,
  initialCode = '',
  user = {},
  onSave,
}: {
  siteInfo: BrandType;
  brand: BrandType;
  user: UserTypes;
  initialCode?: string;
  onSave: (code: string, label: string) => void;
}) => {
  const [code, setCode] = useState(initialCode || '<div> </div>');
  const [description, setDescription] = useState('');
  const [widgetTitle, setWidgetTitle] = useState(``);
  const [loading, setLoading] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [model, setModel] = useState<AiModelType>(BASE_AI_MODEL);
  const [complexity, setComplexity] = useState(2);
  const [unitCost, setUnitCost] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const [message, setMessage] = useState<{
    type: 'error' | 'success' | 'info';
    content: string;
  } | null>(null);

  const router = useRouter();

  // Calculate unit cost based on complexity
  useEffect(() => {
    if (!model) return;
    const modelCost = model?.unitValue ?? 0;
    const cost = complexity * 100 * modelCost;
    setUnitCost(Number(cost));
  }, [complexity, model]);

  // Reset state for generation
  const resetState = () => {
    setIsGenerating(false);
    setMessage(null);
  };
  const widgetSlug = slugify(widgetTitle ?? '', { lower: true, trim: true, replacement: '_' });

  // Generate code with AI
  const generateCodeWithAI = useCallback(async () => {
    if (!description || description.trim() === '') {
      toast.error('Please provide a widget description before generating');
      resetState();
      return;
    }

    setIsGenerating(true);
    setMessage({ type: 'info', content: 'Generating your custom code...' });

    try {
      // Debit AI units
      const url = await api_credit_and_debit_ai_units({ subBase: siteInfo.slug });
      if (isNull(unitCost) || unitCost <= 0) {
        toast.error("Units can't be zero");
        resetState();
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
        resetState();
        return;
      }

      clearCache('user');
      clearCache('users');

      // Generate the widget code with AI
      const codeInstruction = `You are a professional HTML, Tailwind CSS, and responsive website designer that creates custom code for section of website that very appealing to eyes. Create a valid, self-contained pure html, tailwindcss and inline css widget based on this description: "${description}".
      
      Complexity level: ${complexity}/5
      
      The code should:
      1. Use only HTML and Tailwind CSS classes for styling
      2. Be responsive and mobile-friendly
      3. Follow best practices and be well-commented
      4. No Javascript, head or body tags. Just a code for existing webpage.
      5. use lucide or fontawsome icons or svg icon where neccessary without importing any cdn,
      6. Be complete and ready to use

      Respond in valid JSON format with the following structure: {"content": "<div id=${widgetSlug}>YOUR_COMPONENT_CODE_HERE</div>"}`;

      let rawResponse;
      try {
        rawResponse = await getOpenAIResponse({
          prompt: `create an html and tailwind css code for '${description}' as a section of a page for the website ${siteInfo.name}`,
          model: model || BASE_AI_MODEL || '',
          instruction: codeInstruction,
        });

        interface CodeResponse {
          content: string;
        }

        // Parse and validate the response
        const codeResponse: CodeResponse = parseJsonResponse(rawResponse, 'code') as CodeResponse;

        if (!codeResponse || isNull(codeResponse.content)) {
          throw new Error(`Failed to parse AI response for widget`);
        }

        const formattedCode = formatAiText(codeResponse.content);
        setCode(formattedCode);
        setPreviewCode(formattedCode);
        setMessage({ type: 'success', content: 'Widget generated successfully!' });
      } catch (error) {
        console.error('Error generating code:', error);
        console.info('Raw response that caused error:', rawResponse);
        toast.error('Failed to generate widget code. Please try again.');
        resetState();
        return;
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('An error occurred during code generation');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }, [description, complexity, model, unitCost, siteInfo, router, user.id, widgetSlug]);

  // Handle save button click
  const handleSave = () => {
    if (!code || code.trim() === '') {
      toast.warning('Please enter or generate some code first');
      return;
    }

    if (!widgetTitle || widgetTitle.trim() === '') {
      toast.warning('Please enter a widget title');
      return;
    }

    if (code.length > 5000) {
      toast.error('The code is too large. Please simplify or split it');
      return;
    }

    try {
      const sanitizedCode = sanitizeHTML(code);
      onSave(sanitizedCode, widgetTitle);
      toast.success('Widget code saved successfully!');
    } catch (error) {
      toast.error('Failed to save code. Please check for errors');
    }
  };

  // Setup available AI models
  let models: AiModelType[] = [];
  availableAiModels.forEach((model) => {
    models.push({
      ...model,
      title: model?.title?.replace('{name}', (siteInfo.name ?? '').replace(' ', '-')),
    });
  });

  return (
    <div className="w-full mb-20">
      <CustomCard
        title="Custom Widget Generator"
        topRightWidget={
          <div className="flex justify-end space-x-3">
            <CustomButton
              onClick={() => {
                setCode(initialCode);
                setPreviewCode(initialCode);
                setDescription('');
                toast.info('Changes discarded');
              }}
            >
              Reset
            </CustomButton>
            <CustomButton onClick={handleSave} disabled={!code.trim() || isGenerating}>
              Save Widget
            </CustomButton>
          </div>
        }
        bottomWidget={
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <FaWandMagicSparkles size={16} />
                <span className="text-sm font-medium">Generate with AI</span>
              </div>
              <div className="text-xs">Units Balance: {formatNumber(user.ai_units ?? 0)}</div>
              <ToggleSwitch
                className="text-xs"
                name="ai-generate-toggle"
                label=""
                onChange={() => setIsGenerateOpen(!isGenerateOpen)}
                checked={isGenerateOpen}
              />
            </div>

            {isGenerateOpen && (
              <div className="p-4 bg-gray-50 rounded-md space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium py-4">
                    Describe the code you want AI to generate for your page
                  </label>
                  <FormInput
                    controlled={false}
                    type="textarea"
                    rows={3}
                    name="description"
                    placeholder="e.g., a section that describes what we do as a solar panel installation company"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SearchableSelect
                      defaultValues={[model.id ?? '']}
                      items={models as any}
                      onSelect={(v: any) => {
                        const md = models.find((m) => m.id === v);
                        setModel(md ?? {});
                      }}
                      showSearch={false}
                      label="AI Model"
                    />
                  </div>

                  <div className="flex flex-row justify-center space-x-2 items-center w-full">
                    <label className="text-xs font-medium">Complexity Level</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={complexity}
                        onChange={(e) => setComplexity(parseInt(e.target.value))}
                        className="w-full bg-amber-600"
                      />
                      <span className="text-sm">{complexity}/5</span>
                    </div>
                  </div>
                </div>

                {message ? (
                  <div
                    className={`text-sm flex justify-center items-center w-full py-3 ${
                      message.type === 'success'
                        ? 'text-green-700'
                        : message.type === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                    }`}
                  >
                    {message.content}
                  </div>
                ) : (
                  <div className="pt-2">
                    <CustomButton
                      submitting={isGenerating}
                      submittingText="Generating..."
                      disabled={isGenerating || !description.trim()}
                      onClick={generateCodeWithAI}
                    >
                      Generate @ {unitCost.toFixed(3)} units
                    </CustomButton>
                  </div>
                )}
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-2">
          <FormInput
            type="text"
            name="title"
            label="your section title. e.g Company Info"
            defaultValue={widgetTitle}
            onBlur={(e) => setWidgetTitle(e.target.value)}
            controlled={false}
          />

          {/* Code Editor */}
          <FormInput
            type="textarea"
            rows={10}
            name="code"
            label={'your code or generate with AI'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={(e) => setPreviewCode(e.target.value)}
            controlled={false}
          />
          {/* 
          <RichTextEditor
            value={previewCode}
            onChange={(v) => {
              setCode(v);
              setPreviewCode(v);
            }}
            placeholder={`write your custom `}
            onSave={() => {}}
          /> */}

          {/* Preview Panel */}
          <div className="p-4 bg-gray-50 border rounded-md">
            {previewCode ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(previewCode) }}></div>
            ) : (
              <div className="text-gray-400 text-center py-2">Preview will appear here</div>
            )}
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default CustomCodeWidget;
