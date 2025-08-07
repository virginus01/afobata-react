import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CustomButton, Overlay } from '@/app/widgets/widgets';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes } from 'react-icons/fa';
import 'suneditor/dist/css/suneditor.min.css';
import '@/app/styles/sun_editor.css';
import plugins from 'suneditor/src/plugins';

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false,
});

interface DetailsComponentProps {
  data: string;
  onCompleted: (content: string) => void;
  isOpen: boolean;
  isFull?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  header?: string;
  actionTitle?: string;
}

const ProductDetailsComponent: React.FC<DetailsComponentProps> = ({
  data,
  onCompleted,
  isOpen,
  onClose,
  children,
  header,
  isFull,
  actionTitle,
}) => {
  const router = useRouter();
  const [editorContent, setEditorContent] = useState(data);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSaveAndClose = () => {
    onCompleted(editorContent);
  };

  const handleImageUploadBefore = (files: File[], info: any, uploadHandler: any) => {
    const formData = new FormData();
    formData.append('file', files[0]);

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        uploadHandler({
          result: [
            {
              url: data.url,
              name: files[0].name,
              size: files[0].size,
              type: files[0].type,
              uploaded: true,
            },
          ],
        });
      })
      .catch((error) => {
        console.error('Image upload failed:', error);
        uploadHandler();
      });

    return false;
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClose={onClose} />
      <div
        className={`fixed top-0 w-full ${
          isFull
            ? 'top-0 right-0 left-0 bottom-0 w-full h-full 2-50'
            : 'right-0 w-64 sm:w-2/6 h-full'
        } bg-gray-100 dark:bg-gray-900 shadow-lg transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out 2-50`}
      >
        <div className="flex justify-between items-center p-2 border-y border-l border-gray-300">
          <div className="flex flex-row space-x-4">
            <FaTimes
              className="mx-4 h-5 w-5 cursor-pointer hover:rotate-90 transition-transform duration-300"
              onClick={onClose}
            />
            <div className="text-lg font-medium">{header}</div>
          </div>
          <div className="flex">
            <CustomButton icon={<FaSave />} iconPosition="before" onClick={handleSaveAndClose}>
              <span className="font-normal">Save & Close</span>
            </CustomButton>
          </div>
        </div>

        <div className="flex flex-col h-full w-full overflow-y-auto smallEditor">
          <SunEditor
            height="100%"
            width="100%"
            defaultValue={editorContent}
            placeholder={`Write detailed information about this ${actionTitle} here. You can add pictures and other things.`}
            setOptions={{
              buttonList: [
                ['undo', 'redo'],
                ['font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike'],
                ['fontColor', 'hiliteColor', 'textStyle'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'lineHeight'],
                ['table', 'link', 'image', 'imageGallery', 'video'],
                ['fullScreen', 'showBlocks', 'codeView'],
                ['preview', 'print'],
              ],
              plugins: {
                font: plugins.font,
                fontSize: plugins.fontSize,
                formatBlock: plugins.formatBlock,
                fontColor: plugins.fontColor,
                hiliteColor: plugins.hiliteColor,
                textStyle: plugins.textStyle,
                align: plugins.align,
                horizontalRule: plugins.horizontalRule,
                list: plugins.list,
                table: plugins.table,
                link: plugins.link,
                image: plugins.image,
                video: plugins.video,
                imageGallery: plugins.imageGallery,
              },
              imageGalleryUrl: '/api/a/get/api_get_images',
              callBackSave: handleSaveAndClose,
            }}
            onImageUploadBefore={handleImageUploadBefore}
            onChange={handleEditorChange}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetailsComponent;
