import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CustomImage from '@/app/media/file_thumbnail';
import { readableDate } from '@/app/helpers/readableDate';

import React from 'react';
import { formatFileSize } from '@/helpers/formatFileSize';

export default function FileBrowserView({
  loading,
  viewMode,
  filteredFiles,
  selectedUrls,
  handleImageClick,
}: {
  loading: boolean;
  viewMode: 'grid' | 'list';
  filteredFiles: any[];
  selectedUrls: string[];
  handleImageClick: (url: string, file: any) => void;
}) {
  return (
    <>
      <div className="w-full py-10">
        <div className="m-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {filteredFiles?.map((file, i) => (
                <Card
                  key={i}
                  className={`m-1 group cursor-pointer space-y-2 border border-none ${
                    selectedUrls.includes(file?.publicUrl ?? '')
                      ? 'ring-2 [--tw-ring-color:#10B981] ring-offset-2 rounded-lg'
                      : 'rounded-lg'
                  }`}
                  onClick={() => handleImageClick(file?.publicUrl ?? '', file)}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary/10">
                    <CustomImage
                      file={file}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover mix-blend-normal"
                      url={file.publicUrl ?? ''}
                      type={file.type}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white">
                        <p className="text-sm truncate">{file.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 p-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size || 0)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:grid md:grid-cols-[1fr,100px,150px,100px] gap-4 p-2 font-medium text-sm text-muted-foreground bg-secondary/5 rounded-lg">
                <div>File</div>
                <div>Size</div>
                <div>Uploaded</div>
              </div>

              {filteredFiles?.map((file, i) => (
                <Card
                  key={i}
                  className={`grid grid-cols-1 md:grid-cols-[1fr,100px,150px,100px] gap-2 md:gap-4 p-2 items-center hover:bg-secondary/5 rounded-lg ${
                    selectedUrls.includes(file?.publicUrl ?? '')
                      ? 'bg-primary/10 hover:bg-primary/10'
                      : ''
                  } border border-none`}
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => handleImageClick(file?.publicUrl ?? '', file)}
                  >
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <CustomImage
                        className="h-full w-full object-cover rounded"
                        file={file}
                        height={50}
                        width={50}
                        url={file.publicUrl ?? ''}
                        type={file.type}
                      />
                    </div>
                    <p className="text-sm truncate sm:max-w-[25ch]">{file.name}</p>
                  </div>

                  <div className="grid grid-cols-2 md:block pl-13 md:pl-0 text-sm text-muted-foreground">
                    <span className="md:hidden font-medium">Size:</span>
                    <span>{formatFileSize(file.size || 0)}</span>
                  </div>

                  <div className="grid grid-cols-2 md:block pl-13 md:pl-0 text-sm text-muted-foreground">
                    <span className="md:hidden font-medium">Uploaded:</span>
                    <span>{file?.createdAt && readableDate(file?.createdAt)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* {selectedUrls.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedUrls.length} item{selectedUrls.length !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                {selectedUrls.length === 1 && (
                  <Button type="button" variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </>
  );
}
