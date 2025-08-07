import React, { useRef, useEffect } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import plugins from "suneditor/src/plugins";
import "@/app/styles/sun_editor.css";

interface RichTextEditorProps {
  value: string;
  placeholder?: string;
  onChange: (content: string) => void;
  onSave?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  onSave,
}) => {
  const editorRef = useRef<any>(null);

  // Inject content into the editor if value changes after mount
  useEffect(() => {
    if (editorRef.current && typeof value === "string") {
      editorRef.current.setContents(value);
    }
  }, [value]);

  const handleImageUploadBefore = (files: File[], info: any, uploadHandler: any) => {
    const formData = new FormData();
    formData.append("file", files[0]);

    fetch("/api/upload", {
      method: "POST",
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
        console.error("Image upload failed:", error);
        uploadHandler();
      });

    return false;
  };

  return (
    <SunEditor
      getSunEditorInstance={(editor) => {
        editorRef.current = editor;
      }}
      height="100%"
      width="100%"
      placeholder={placeholder}
      setContents={value}
      setOptions={{
        buttonList: [
          ["undo", "redo"],
          ["font", "fontSize", "formatBlock"],
          ["bold", "underline", "italic", "strike"],
          ["fontColor", "hiliteColor", "textStyle"],
          ["removeFormat"],
          ["outdent", "indent"],
          ["align", "horizontalRule", "list", "lineHeight"],
          ["table", "link", "image", "imageGallery", "video"],
          ["fullScreen", "showBlocks", "codeView"],
          ["preview", "print"],
        ],
        plugins,
        imageGalleryUrl: "/api/a/get/api_get_images",
        callBackSave: onSave,

        // 🔒 Preserve class/style on all needed tags
        attributesWhitelist: {
          "*": "class|style",
          div: "class|style",
          span: "class|style",
          p: "class|style",
          ul: "class|style",
          li: "class|style",
          ol: "class|style",
          a: "class|style|href|target|rel",
          img: "class|style|src|alt|width|height",
          video: "class|style|src|controls",
          iframe: "class|style|src|frameborder|allowfullscreen",
          table: "class|style",
          thead: "class|style",
          tbody: "class|style",
          tr: "class|style",
          td: "class|style",
          th: "class|style",
        },

        // ✂️ Disable SunEditor's auto cleanup/sanitization

        // 📝 Keep all tags and attributes on paste
        pasteTagsWhitelist: "*",
      }}
      onImageUploadBefore={handleImageUploadBefore}
      onChange={onChange}
    />
  );
};

export default RichTextEditor;
