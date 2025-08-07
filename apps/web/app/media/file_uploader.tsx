// components/FileUploader.tsx

'use client';

import { Upload, File as FileIcon, FileText } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { formatFileSize } from '@/helpers/formatFileSize';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  uploading: boolean;
  progress: number;
}

export default function FileUploader({ onUpload, uploading, progress }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setSelectedFiles(filesArray);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <div className="flex items-center justify-center h-full text-red-600">
          <FileText className="w-12 h-12" />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <FileIcon className="w-12 h-12" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full h-64">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-secondary/5 hover:bg-secondary/10 border-secondary/20"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="mb-2 text-lg font-semibold">Drop files anywhere to upload</p>
            <p className="mb-4 text-sm text-muted-foreground">or select files from your computer</p>
            <Button size="lg" type="button" onClick={() => fileInputRef.current?.click()}>
              Select Files
            </Button>
          </div>
        </label>
        <input
          ref={fileInputRef}
          id="dropzone-file"
          type="file"
          onChange={handleFileChange}
          accept="*"
          multiple
          disabled={uploading}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{selectedFiles.length} file(s) selected</p>
            <Button type="button" onClick={handleUpload} disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>

          {uploading && <Progress value={progress} className="w-full h-2" />}

          <ScrollArea className="m-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 mx-2">
              {selectedFiles.map((file, index) => (
                <Card key={index} className="relative group border border-none">
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary/10">
                    {renderFilePreview(file)}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file?.size ?? 0)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
