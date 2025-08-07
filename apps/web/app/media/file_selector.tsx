'use client';

import { modHeaders } from '@/app/helpers/modHeaders';
import { show_error } from '@/app/helpers/show_error';
import { getImgUrl } from '@/app/helpers/getImgUrl';
import { isNull } from '@/app/helpers/isNull';
import { api_get_files, api_upload_file } from '@/app/routes/api_routes';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Upload, X, Save, Image as ImageIcon, Grid, List, Search, Filter } from 'lucide-react';

import indexedDB from '@/app/utils/indexdb';
import CustomCard from '@/app/widgets/custom_card';
import { CustomButton } from '@/app/widgets/custom_button';
import FileUploader from '@/app/media/file_uploader';
import FileBrowserView from '@/app/media/file_lib';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type FileSelectorProps = {
  onSelect: (selectedUrls: string[]) => void;
  onSelectFileData?: (data: FileType[]) => void;
  onClose: () => void;
  maxSelect?: number;
  user: UserTypes;
  maxHeight?: number;
  maxWidth?: number;
  siteInfo: BrandType;
  fileType?: ('image' | 'pdf' | 'video')[];
};

type ViewMode = 'grid' | 'list';

export const FileSelector: React.FC<FileSelectorProps> = ({
  onSelect,
  onSelectFileData,
  onClose,
  maxSelect = 10,
  user,
  maxHeight = 10000,
  maxWidth = 10000,
  siteInfo,
  fileType = ['image'],
}) => {
  const [selectedFileData, setSelectedFileData] = useState<FileType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileType[] | null>(null);

  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const toastShownRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = useCallback(
    (url: string, file: FileType) => {
      if (maxSelect === 1) {
        setSelectedUrls([url]);
        setSelectedFileData([file]);
      } else {
        setSelectedUrls((prev) => {
          if (prev.includes(url)) {
            toastShownRef.current = false;
            setSelectedFileData((prevFiles) => prevFiles.filter((item) => item.id !== file.id));
            return prev.filter((item) => item !== url);
          } else if (prev.length >= maxSelect) {
            if (!toastShownRef.current) {
              toast.warning(`You can't select more than ${maxSelect} images`);
              toastShownRef.current = true;
            }
            return prev;
          } else {
            toastShownRef.current = false;
            setSelectedFileData((prevFiles) => [...prevFiles, file]);
            return [...prev, url];
          }
        });
      }
    },
    [maxSelect],
  );

  const handleSave = () => {
    onSelect(selectedUrls);
    onSelectFileData?.(selectedFileData);
    onClose();
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const cf = await indexedDB.queryData({ table: 'files', conditions: {} });
        if (!isNull(cf)) {
          setFiles(cf);
          return;
        }
      } catch (error) {
        toast.error('Failed to load files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user.id, siteInfo.slug, selectedFiles]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const url = await api_get_files({
          subBase: siteInfo.slug,
          userId: user?.id,
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
        });
        const res = await response.json();

        if (res.status) {
          const enhancedData = res.data.map((file: any) => ({
            ...file,
            name: file.publicUrl.split('/').pop(),
            uploadedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            size: Math.floor(Math.random() * 5000000),
            cdnUrl: getImgUrl({ id: file.id, height: 500, width: 500 }),
          }));

          indexedDB.saveOrUpdateData({ data: enhancedData, table: 'files' });
          setFiles(enhancedData);
        }
      } catch (error) {
        toast.error('Failed to load files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user.id, siteInfo.slug, selectedFiles]);

  const handleFileChange = useCallback((fileList: File[]) => {
    const validFiles = fileList.filter((file) => file.size <= MAX_FILE_SIZE);

    if (validFiles.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files at once.`);
      setSelectedFiles(validFiles.slice(0, MAX_FILES));
      return;
    }

    if (validFiles.length < fileList.length) {
      setError(`Some files were skipped because they exceed the 10MB limit.`);
    } else {
      setError(null);
    }

    setSelectedFiles(validFiles);

    handleUpload(validFiles);
  }, []);

  const handleUpload = async (selectedFiles: any[]) => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append(`file`, file as any);
    });

    const toastId = toast.loading(`uploading ${selectedFiles.length} file(s)`);

    try {
      const url = await api_upload_file({ subBase: siteInfo.slug });
      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post', true),
        body: formData,
      });

      const { msg, status } = await response.json();

      if (status) {
        toast.success('Files uploaded successfully');
        setProgress(100);
        setActiveTab('library');
        indexedDB.clearTable('files');
      } else {
        toast.error(msg);
      }
      setSelectedFiles([]);
    } catch (error: any) {
      show_error(error.response?.data?.message || 'An error occurred during upload', error);
    } finally {
      setUploading(false);
      toast.dismiss(toastId);
    }
  };

  const filteredFiles = files
    ?.filter((file) => file.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    ?.sort((a: any, b: any) => new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime());

  useEffect(() => {
    if (selectedUrls[0]) {
      const img = new window.Image();
      img.src = selectedUrls[0];

      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  }, [selectedUrls]);

  return (
    <CustomCard
      title={'Media Library'}
      topRightWidget={
        <div className="flex items-center justify-between border-b">
          <div className="flex flex-row h-6 items-center space-x-2 w-full">
            <CustomButton
              type="button"
              onClick={() => {
                if (dimensions.height > maxHeight || dimensions.width > maxWidth) {
                  toast.error(`select image within dimension ${maxHeight}/${maxWidth}`);
                } else {
                  handleSave();
                }
              }}
              disabled={selectedUrls.length === 0}
              icon={<Save className="mr-2 h-3 w-3" />}
            >
              Add Selected
            </CustomButton>
            <CustomButton
              style={6}
              className="bg-gray-200 text-gray-500 hover:bg-gray-50"
              icon={<X className="mr-2 h-3 w-3" />}
              onClick={onClose}
            >
              Close
            </CustomButton>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-6xl flex flex-col mb-30 mt-5 flex-grow-0 mr-4">
        <Tabs
          defaultValue="upload"
          className="flex-1 flex flex-col"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="flex-1 p-4 space-y-4">
            <FileUploader
              onUpload={(files) => {
                handleFileChange(files);
              }}
              uploading={uploading}
              progress={progress}
            />
          </TabsContent>

          <TabsContent value="library" className="flex flex-col space-x-4">
            <div className="space-x-2 flex flex-row justify-between">
              <div className="w-full">
                <Input
                  placeholder="Search media items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="mr-2 h-4 w-4" />
                  Grid
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="mr-2 h-4 w-4" />
                  List
                </Button>
              </div>
            </div>
            <FileBrowserView
              loading={loading}
              viewMode={viewMode}
              filteredFiles={filteredFiles as any}
              selectedUrls={selectedUrls}
              handleImageClick={handleImageClick}
            />
          </TabsContent>
        </Tabs>
      </div>
    </CustomCard>
  );
};
