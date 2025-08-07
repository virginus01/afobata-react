import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface StyleOption {
  label: string;
  value: string;
  preview?: string;
}

export const STYLE_OPTIONS = {
  spacing: {
    padding: [
      { label: "None", value: "p-0" },
      { label: "Small", value: "p-2" },
      { label: "Medium", value: "p-4" },
      { label: "Large", value: "p-6" },
      { label: "Extra Large", value: "p-8" },
    ],
    margin: [
      { label: "None", value: "m-0" },
      { label: "Small", value: "m-2" },
      { label: "Medium", value: "m-4" },
      { label: "Large", value: "m-6" },
      { label: "Extra Large", value: "m-8" },
    ],
  },
  layout: {
    width: [
      { label: "Full", value: "w-full" },
      { label: "3/4", value: "w-3/4" },
      { label: "1/2", value: "w-1/2" },
      { label: "Auto", value: "w-auto" },
    ],
    height: [
      { label: "Auto", value: "h-auto" },
      { label: "Full", value: "h-full" },
    ],
    display: [
      { label: "Block", value: "block" },
      { label: "Flex", value: "flex" },
      { label: "Grid", value: "grid" },
      { label: "Hidden", value: "hidden" },
    ],
  },
  background: {
    colors: [
      { label: "White", value: "bg-white" },
      { label: "Transparent", value: "bg-transparent" },
      { label: "Red", value: "bg-red-900" },
      { label: "Light Gray", value: "bg-gray-50" },
      { label: "Gray", value: "bg-gray-100" },
      { label: "Dark Gray", value: "bg-gray-200" },
      { label: "Primary Light", value: "bg-primary-50" },
      { label: "Primary", value: "bg-primary-100" },
      { label: "Secondary Light", value: "bg-secondary-50" },
      { label: "Secondary", value: "bg-secondary-100" },
    ],
    opacity: [
      { label: "Solid", value: "bg-opacity-100" },
      { label: "Semi", value: "bg-opacity-75" },
      { label: "Light", value: "bg-opacity-50" },
      { label: "Faint", value: "bg-opacity-25" },
    ],
    // NEW: Background image URL input field.
    image: [] as StyleOption[],
  },
  border: {
    width: [
      { label: "None", value: "border-0" },
      { label: "Thin", value: "border" },
      { label: "Medium", value: "border-2" },
      { label: "Thick", value: "border-4" },
    ],
    radius: [
      { label: "None", value: "rounded-none" },
      { label: "Small", value: "rounded" },
      { label: "Medium", value: "rounded-md" },
      { label: "Large", value: "rounded-lg" },
      { label: "Full", value: "rounded-full" },
    ],
    color: [
      { label: "Gray", value: "border-gray-200" },
      { label: "Primary", value: "border-primary-200" },
      { label: "Secondary", value: "border-secondary-200" },
    ],
  },
  typography: {
    size: [
      { label: "XS", value: "text-xs" },
      { label: "SM", value: "text-sm" },
      { label: "Base", value: "text-base" },
      { label: "LG", value: "text-lg" },
      { label: "XL", value: "text-xl" },
      { label: "2XL", value: "text-2xl" },
    ],
    weight: [
      { label: "Normal", value: "font-normal" },
      { label: "Medium", value: "font-medium" },
      { label: "SemiBold", value: "font-semibold" },
      { label: "Bold", value: "font-bold" },
    ],
    color: [
      { label: "Default", value: "text-gray-900" },
      { label: "Gray", value: "text-gray-500" },
      { label: "Primary", value: "text-primary-600" },
      { label: "Secondary", value: "text-secondary-600" },
    ],
  },
};

export interface ContentConfig {
  type: string;
  content: string;
  url?: string;
  className: string; // any additional custom classes
  styles: {
    typography: Record<string, string>;
    spacing: Record<string, string>;
    background: Record<string, string>;
    border: Record<string, string>;
    layout: Record<string, string>;
    [key: string]: any;
  };
}

interface StyleEditorProps {
  style: any;
  onChange: (style: any) => void;
  options: any;
}

/**
 * In the style editor we use a select element for any property whose name includes
 * "color" (case–insensitive). For the "image" property, an Input is rendered.
 */
export const StyleEditor: React.FC<StyleEditorProps> = ({
  style,
  onChange,
  options,
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(options).map(([category, categoryOptions]) => (
        <AccordionItem value={category} key={category}>
          <AccordionTrigger className="capitalize">{category}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {Object.entries(
                categoryOptions as Record<string, StyleOption[]>
              ).map(([property, values]) => (
                <div key={property} className="space-y-2">
                  <Label className="capitalize">{property}</Label>
                  {property.toLowerCase() === "image" ? (
                    // For background image, render an Input for URL.
                    <Input
                      placeholder="Enter background image URL"
                      value={(style[category] || {})[property] || ""}
                      onChange={(e) =>
                        onChange({
                          ...style,
                          [category]: {
                            ...(style[category] || {}),
                            [property]: e.target.value,
                          },
                        })
                      }
                    />
                  ) : property.toLowerCase().includes("color") ? (
                    <select
                      className="border rounded p-1 w-full"
                      value={(style[category] || {})[property] || ""}
                      onChange={(e) =>
                        onChange({
                          ...style,
                          [category]: {
                            ...(style[category] || {}),
                            [property]: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Select {property}</option>
                      {values.map((option: StyleOption) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <RadioGroup
                      value={(style[category] || {})[property] || ""}
                      onValueChange={(value) =>
                        onChange({
                          ...style,
                          [category]: {
                            ...(style[category] || {}),
                            [property]: value,
                          },
                        })
                      }
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {values.map((option: StyleOption) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={`${category}-${property}-${option.value}`}
                            />
                            <Label
                              htmlFor={`${category}-${property}-${option.value}`}
                              className="flex items-center space-x-2"
                            >
                              <span
                                className={`inline-block w-5 h-5 border ${
                                  option.preview ? option.preview : option.value
                                }`}
                              ></span>
                              <span>{option.label}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}

      <AccordionItem value="custom">
        <AccordionTrigger>Custom Classes</AccordionTrigger>
        <AccordionContent>
          <Input
            value={style.className || ""}
            onChange={(e) => onChange({ ...style, className: e.target.value })}
            placeholder="Add custom Tailwind classes"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const ContentEditor: React.FC<{
  content: ContentConfig;
  onChange: (content: ContentConfig) => void;
}> = ({ content, onChange }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="content">
        <AccordionTrigger>Content</AccordionTrigger>
        <AccordionContent>
          {content.type === "text" && (
            <textarea
              className="w-full min-h-[100px] p-2 border rounded"
              value={content.content}
              onChange={(e) =>
                onChange({ ...content, content: e.target.value })
              }
            />
          )}
          {(content.type === "button" || content.type === "link") && (
            <div className="space-y-2">
              <Input
                placeholder="Text"
                value={content.content}
                onChange={(e) =>
                  onChange({ ...content, content: e.target.value })
                }
              />
              <Input
                placeholder="URL"
                value={content.url || ""}
                onChange={(e) => onChange({ ...content, url: e.target.value })}
              />
            </div>
          )}
          {(content.type === "image" || content.type === "video") && (
            <Input
              placeholder="URL"
              value={content.content}
              onChange={(e) =>
                onChange({ ...content, content: e.target.value })
              }
            />
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="styles">
        <AccordionTrigger>Styles</AccordionTrigger>
        <AccordionContent>
          <Tabs defaultValue="typography">
            <TabsList>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="border">Border</TabsTrigger>
              {STYLE_OPTIONS.layout && (
                <TabsTrigger value="layout">Layout</TabsTrigger>
              )}
            </TabsList>
            {Object.entries(STYLE_OPTIONS).map(([category, options]) => (
              <TabsContent value={category} key={category}>
                <div className="space-y-4">
                  {Object.entries(options).map(([subCategory, values]) => (
                    <div key={subCategory}>
                      <Label className="mb-2 block">{subCategory}</Label>
                      {subCategory.toLowerCase() === "image" ? (
                        <Input
                          placeholder="Enter background image URL"
                          value={
                            (content.styles[category] || {})[subCategory] || ""
                          }
                          onChange={(e) =>
                            onChange({
                              ...content,
                              styles: {
                                ...content.styles,
                                [category]: {
                                  ...(content.styles[category] || {}),
                                  [subCategory]: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      ) : subCategory.toLowerCase().includes("color") ? (
                        <select
                          className="border rounded p-1 w-full"
                          value={
                            (content.styles[category] || {})[subCategory] || ""
                          }
                          onChange={(e) =>
                            onChange({
                              ...content,
                              styles: {
                                ...content.styles,
                                [category]: {
                                  ...(content.styles[category] || {}),
                                  [subCategory]: e.target.value,
                                },
                              },
                            })
                          }
                        >
                          <option value="">Select {subCategory}</option>
                          {values.map((option: StyleOption) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RadioGroup
                          value={
                            (content.styles[category] || {})[subCategory] || ""
                          }
                          onValueChange={(value) =>
                            onChange({
                              ...content,
                              styles: {
                                ...content.styles,
                                [category]: {
                                  ...(content.styles[category] || {}),
                                  [subCategory]: value,
                                },
                              },
                            })
                          }
                        >
                          <div className="grid grid-cols-2 gap-2">
                            {values.map((option: StyleOption) => (
                              <div
                                key={option.value}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${category}-${subCategory}-${option.value}`}
                                />
                                <Label
                                  htmlFor={`${category}-${subCategory}-${option.value}`}
                                  className="flex items-center space-x-2"
                                >
                                  <span
                                    className={`inline-block w-5 h-5 border ${
                                      option.preview
                                        ? option.preview
                                        : option.value
                                    }`}
                                  ></span>
                                  <span>{option.label}</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="custom">
        <AccordionTrigger>Custom Classes</AccordionTrigger>
        <AccordionContent>
          <Input
            value={content.className}
            onChange={(e) =>
              onChange({ ...content, className: e.target.value })
            }
            placeholder="Add custom Tailwind classes"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

/**
 * Rather than combining all classes into a single string,
 * the final configuration exports the style objects as–is.
 *
 * The modal container is now relatively positioned with a scrollable content area.
 * The footer (with Cancel/Save buttons) is fixed at the bottom.
 */
interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  defaultConfig?: {
    className: string;
    contents: ContentConfig[];
    sectionStyle?: { className: string };
  };
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultConfig,
}) => {
  // Initialize state from defaultConfig (or fallback)
  const [contents, setContents] = useState<ContentConfig[]>(
    defaultConfig?.contents || []
  );
  const [sectionStyle, setSectionStyle] = useState({
    spacing: {},
    background: {},
    border: {},
    layout: {},
    className: (defaultConfig as any)?.sectionStyle?.className || "",
  });

  // Update state if defaultConfig changes externally.
  useEffect(() => {
    if (defaultConfig) {
      setContents(defaultConfig.contents || []);
      setSectionStyle({
        spacing: {},
        background: {},
        border: {},
        layout: {},
        className: (defaultConfig as any)?.sectionStyle?.className || "",
      });
    }
  }, [defaultConfig]);

  if (!isOpen) {
    return null;
  }

  const addContent = (type: string) => {
    setContents([
      ...contents,
      {
        type,
        content: "",
        className: "",
        styles: {
          typography: {},
          spacing: {},
          background: {},
          border: {},
          layout: {},
        },
      },
    ]);
  };

  const updateContent = (index: number, content: ContentConfig) => {
    const newContents = [...contents];
    newContents[index] = content;
    setContents(newContents);
  };

  const removeContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  return (
    <div className="relative w-full h-[90vh] bg-white rounded p-5 shadow-lg">
      {/* Scrollable Content Area */}
      <div className="h-full overflow-y-auto pr-4 pb-20">
        <Tabs defaultValue="section">
          <TabsList>
            <TabsTrigger value="section">Section Style</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="section">
            <ScrollArea className="h-[600px]">
              {/* Section styling controls */}
              <StyleEditor
                style={sectionStyle}
                onChange={setSectionStyle}
                options={STYLE_OPTIONS}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="content">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button   type="button"  onClick={() => addContent("text")}>Add Text</Button>
                  <Button   type="button" onClick={() => addContent("button")}>
                    Add Button
                  </Button>
                  <Button   type="button" onClick={() => addContent("image")}>Add Image</Button>
                  <Button   type="button" onClick={() => addContent("video")}>Add Video</Button>
                </div>

                {contents.map((content, index) => (
                  <div key={index} className="border p-4 rounded">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">
                        {content.type.charAt(0).toUpperCase() +
                          content.type.slice(1)}
                      </h3>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeContent(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <ContentEditor
                      content={content}
                      onChange={(updated) => updateContent(index, updated)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Footer for Cancel/Save Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end gap-2">
        <Button   type="button" onClick={onClose}>Cancel</Button>
        <Button
          type="button"
          onClick={() => {
            // Persist the section style and each content's styles individually.
            const finalConfig = {
              sectionStyle, // the section style object (with spacing, background, border, layout, and custom classes)
              contents: contents.map((content) => ({
                type: content.type,
                content: content.content,
                url: content.url,
                styles: content.styles, // individual style objects
                customClass: content.className,
              })),
            };
            onSave(finalConfig);
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
