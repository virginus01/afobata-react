import React, { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { SearchableSelect } from "@/app/widgets/widgets";

// Updated types
export interface ConfigOption {
  value: string;
  label: string;
  disabled: boolean;
}

export interface CategoryOption {
  category: string;
  options: string[] | { [key: string]: string[] }[];
  detailed: { value: string | number; class: string; title: string }[];
}

export interface TailwindConfigSelectorProps {
  configurationsSelections: CategoryOption[];
  selectedClasses?: any[];
  setSelectedClasses: (value: any[]) => void; // Accept array directly
  section: any;
}

const TailwindConfigSelector: React.FC<TailwindConfigSelectorProps> = ({
  configurationsSelections,
  selectedClasses = [],
  setSelectedClasses,
  section = {},
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string): void => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const removeSelectedClass = (indexToRemove: number): void => {
    const updatedSelection = selectedClasses.filter((_, index) => index !== indexToRemove);
    setSelectedClasses(updatedSelection);
  };

  return (
    <div className="w-full flex flex-col space-y-4 p-2 h-full">
      {configurationsSelections.map(({ category, options, detailed }) => {
        const categorySelectedClasses = selectedClasses.filter(
          (item: any) => item.category === category
        );

        return (
          <div key={category} className="border rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">{category}</span>
                {categorySelectedClasses.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {categorySelectedClasses.length}
                  </span>
                )}
              </div>
              {expandedCategories[category] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedCategories[category] && (
              <div className="p-4 space-y-3">
                {categorySelectedClasses.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex flex-wrap gap-2">
                      {categorySelectedClasses.map((item: any) => {
                        const classDetail = detailed.find((d) => d.class === item.class);
                        const displayTitle = classDetail?.title || item.class;
                        const originalIndex = selectedClasses.findIndex((sc: any) => sc === item);

                        return (
                          <div
                            key={originalIndex}
                            className="inline-flex items-center gap-1 bg-white border text-gray-800 px-2 py-1 rounded-md text-sm"
                          >
                            <span className="font-mono text-xs">{item.class}</span>
                            {displayTitle !== item.class && (
                              <span className="text-gray-600 text-xs">({displayTitle})</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeSelectedClass(originalIndex)}
                              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="w-full h-full">
                  <SearchableSelect
                    key={category}
                    className="w-full"
                    items={
                      detailed.map((item) => ({
                        value: item.class,
                        label: item.title,
                        disabled: false,
                      })) as any[]
                    }
                    onSelect={(value) => {
                      const isAlreadySelected = selectedClasses.some(
                        (item: any) => item.class === value && item.category === category
                      );

                      if (!isAlreadySelected) {
                        const newSelection = [...selectedClasses, { class: value, category }];
                        setSelectedClasses(newSelection);
                      }
                    }}
                    defaultValues={[]}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TailwindConfigSelector;
