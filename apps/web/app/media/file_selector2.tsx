import React, { useState, useCallback } from "react";
import Image from "next/image";

type FileSelectorProps = {
  files: { id: string; publicUrl: string }[];
  onSelect: (selectedUrls: string[]) => void;
};

export const FileSelector: React.FC<FileSelectorProps> = ({
  files,
  onSelect,
}) => {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const handleImageClick = useCallback((url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  }, []);

  const handleSave = () => {
    onSelect(selectedUrls);
  };

  return (
    <div>
      <div className="flex justify-end mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
          onClick={handleSave}
        >
          Save & Close
        </button>
        <button
          className="px-4 py-2 bg-gray-50 dark:bg-gray-9000 text-white rounded-md"
          onClick={() => onSelect([])}
        >
          Close
        </button>
      </div>
    </div>
  );
};
