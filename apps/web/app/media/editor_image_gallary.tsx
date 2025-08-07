import React, { useState, useRef } from 'react';
import { Trash2, ImagePlus, ChevronLeft, ChevronRight, Eye, Star, FilePlus } from 'lucide-react';
import CustomDrawer from '@/app/src/custom_drawer';
import { FileSelector } from '@/app/media/file_selector';
import { Label } from '@/components/ui/label';
import { FaFilePdf } from 'react-icons/fa';
import FilePreview from '@/app/media/file_thumbnail';
import CustomModal from '@/app/widgets/custom_modal';
import CustomImage from '@/app/widgets/optimize_image';

interface ImageUploadGallaryProps {
  maxImages?: number;
  onImagesSelected?: (images: FileType[]) => void;
  initialImages?: FileType[];
  user?: UserTypes;
  siteInfo?: BrandType;
  label?: string;
  className?: string;
  fileType?: ('image' | 'pdf' | 'video')[];
}

const ImageUploadGallary: React.FC<ImageUploadGallaryProps> = ({
  maxImages = 8,
  onImagesSelected,
  initialImages = [],
  user,
  siteInfo,
  label,
  className,
  fileType = ['image'],
}) => {
  const [images, setImages] = useState<FileType[]>(initialImages);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);

  const handleImageSelect = (selectedData: FileType[]) => {
    // Limit total number of images
    const remainingSlots = maxImages - images.length;
    const newImages: FileType[] = [
      ...images,
      ...selectedData.slice(0, remainingSlots).map((file, index) => ({
        ...file,
        url: file.publicUrl,
        isFeatured: images.length === 0 && index === 0,
      })),
    ];

    setImages(newImages);
    setIsFileSelectorOpen(false);

    // Notify parent component about selected images
    if (onImagesSelected) {
      onImagesSelected(newImages);
    }
  };

  const openFileSelector = () => {
    setIsFileSelectorOpen(true);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);

    // If removed image was featured, make first image featured
    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isFeatured)) {
      updatedImages[0].isFeatured = true;
    }

    // Update the component's internal state
    setImages(updatedImages);

    // Notify parent component about updated images
    if (onImagesSelected) {
      onImagesSelected(updatedImages);
    }
  };

  const toggleFeaturedImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isFeatured: i === index,
    }));

    setImages(updatedImages);

    // Notify parent component about updated images
    if (onImagesSelected) {
      onImagesSelected(updatedImages);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount =
        direction === 'left' ? -scrollRef.current.offsetWidth : scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="w-full space-y-4 relative">
        {label && <Label>{label}</Label>}
        <div className="relative group">
          {images.length > 2 && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronLeft />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-4 no-scrollbar scroll-smooth"
          >
            {images.map((imageItem, index) => (
              <div
                key={index}
                className={`relative flex-shrink-0 w-28 h-28 border rounded-lg overflow-hidden group ${className}`}
              >
                <FilePreview
                  file={(imageItem as any) ?? {}}
                  width={100}
                  height={100}
                  url={imageItem.url as string}
                  type={'image'}
                  className="h-full w-full object-cover mix-blend-normal"
                />

                <div className="absolute top-2 right-2 flex space-x-2">
                  {imageItem?.type?.startsWith('image/') ? (
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className="bg-blue-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Eye size={16} />
                    </button>
                  ) : imageItem?.type === 'application/pdf' ? (
                    <button
                      type="button"
                      onClick={() => window.open(imageItem.url, '_blank')}
                      className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaFilePdf size={16} />
                    </button>
                  ) : imageItem?.type?.startsWith('video/') ? (
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className="bg-green-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Eye size={16} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFeaturedImage(index)}
                    className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition ${
                      imageItem.isFeatured
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <Star size={16} />
                  </button>
                </div>
              </div>
            ))}

            {images.length < maxImages && (
              <div
                onClick={openFileSelector}
                className="flex-shrink-0 w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
              >
                {fileType?.includes('image') && fileType.length === 1 ? (
                  <ImagePlus className="text-gray-400" size={36} />
                ) : (
                  <FilePlus className="text-gray-400" size={36} />
                )}
              </div>
            )}
          </div>
          {images.length > 2 && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronRight />
            </button>
          )}
        </div>

        {selectedImageIndex !== null && (
          <CustomModal
            title="file"
            isOpen={selectedImageIndex !== null}
            onClose={() => setSelectedImageIndex(null)}
          >
            {images[selectedImageIndex]?.type?.startsWith('image/') ? (
              <CustomImage
                className="w-full h-full object-contain max-h-[80vh] rounded-xl px-8"
                height={100}
                width={100}
                imgFile={images[selectedImageIndex]}
              />
            ) : images[selectedImageIndex].type === 'application/pdf' ? (
              <iframe
                src={images[selectedImageIndex].url as string}
                className="w-full h-[80vh]"
                title={`PDF Preview ${selectedImageIndex + 1}`}
              />
            ) : images[selectedImageIndex]?.type?.startsWith('video/') ? (
              <video
                controls
                className="w-full max-h-[80vh]"
                title={`Video Preview ${selectedImageIndex + 1}`}
              >
                <source
                  src={images[selectedImageIndex].url as string}
                  type={images[selectedImageIndex]?.type ?? ''}
                />
                Your browser does not support the video tag.
              </video>
            ) : null}
          </CustomModal>
        )}
      </div>
      <CustomDrawer
        direction="right"
        isWidthFull={true}
        isHeightFull={true}
        showHeader={false}
        isOpen={isFileSelectorOpen}
        onClose={() => setIsFileSelectorOpen(false)}
        header="Select Image"
      >
        <FileSelector
          maxSelect={1}
          onSelect={() => {}}
          onSelectFileData={handleImageSelect}
          onClose={() => setIsFileSelectorOpen(false)}
          user={user || {}}
          siteInfo={siteInfo || {}}
          fileType={fileType}
        />
      </CustomDrawer>
    </>
  );
};

export default ImageUploadGallary;
