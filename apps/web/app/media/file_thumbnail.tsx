import Image from "next/image";
import { FaFilePdf, FaFileVideo, FaFileAlt, FaFileImage } from "react-icons/fa";

const FilePreview = ({
  file,
  width = 100,
  height = 100,
  type,
  url,
  className,
}: {
  file: FileType;
  width: number;
  height: number;
  type: any;
  url?: string;
  className?: string;
}) => {
  const getExtension = (filename: string) => {
    return filename?.split(".").pop()?.toLowerCase() || "";
  };

  const extension = getExtension(file?.name ?? "");
  const mimeType = file?.type || "";

  const isImage =
    mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);

  const isPdf = mimeType === "application/pdf" || extension === "pdf";

  const isVideo = mimeType.startsWith("video/") || ["mp4", "mov", "avi", "mkv"].includes(extension);

  if ((isImage || type === "image") && url) {
    return (
      <Image
        width={width}
        height={height}
        className={className}
        src={url ?? "/images/placeholder.png"}
        alt={file?.name || "File preview"}
        onError={(e) => {
          e.currentTarget.src = "/images/placeholder.png";
          e.currentTarget.onerror = null;
        }}
      />
    );
  }

  if (isPdf || type === "pdf") {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <FaFilePdf className="text-red-500 w-10 h-10" />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <FaFileVideo className="text-blue-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <FaFileAlt className="text-gray-500 w-10 h-10" />
    </div>
  );
};

export default FilePreview;
