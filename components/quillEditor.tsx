// "use client";

// import React, { useEffect, useRef } from "react";
// import dynamic from "next/dynamic";
// import "react-quill-new/dist/quill.snow.css";

// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// interface QuillEditorProps {
//   value: string;
//   onChange: (content: string) => void;
//   placeholder?: string;
//   resizable?: boolean;
//   minHeight?: string;
//   maxHeight?: string;
// }

// const QuillEditor: React.FC<QuillEditorProps> = ({
//   value,
//   onChange,
//   placeholder,
//   resizable = true,
//   minHeight = "150px",
//   maxHeight = "600px",
// }) => {
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleResize = () => {
//       if (wrapperRef.current) {
//         const quillContainer = wrapperRef.current.querySelector(
//           ".ql-container"
//         ) as HTMLElement | null;
//         if (quillContainer) {
//           quillContainer.style.height = "100%";
//         }
//       }
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, false] }],
//       ["bold", "italic", "underline"],
//       ["link", "image"],
//       [{ list: "ordered" }, { list: "bullet" }],
//     ],
//   };

//   return (
//     <div
//       ref={wrapperRef}
//       className={`border rounded-lg overflow-hidden ${
//         resizable ? "resize-y" : ""
//       }`}
//       style={{
//         minHeight,
//         maxHeight,
//         height: minHeight,
//       }}
//     >
//       <ReactQuill
//         theme="snow"
//         value={value}
//         onChange={onChange}
//         modules={modules}
//         placeholder={placeholder}
//         className="h-full [&_.ql-editor]:min-h-full"
//       />
//     </div>
//   );
// };

// export default QuillEditor;

"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  resizable?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder,
  resizable = true,
  minHeight = "150px",
  maxHeight = "600px",
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        const quillContainer = wrapperRef.current.querySelector(
          ".ql-container"
        ) as HTMLElement | null;
        if (quillContainer) {
          quillContainer.style.height = "100%";
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const modules = {
    // toolbar: [
    //   [{ header: [1, 2, 3, 4, 5, 6, false] }],
    //   [{ font: [] }],
    //   [{ size: ['small', false, 'large', 'huge'] }],
    //   ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    //   [{ color: [] }, { background: [] }],
    //   [{ align: [] }],
    //   [
    //     { list: 'ordered' },
    //     { list: 'bullet' },
    //     { indent: '-1' },
    //     { indent: '+1' },
    //     { script: 'sub' },
    //     { script: 'super' },
    //     { direction: 'rtl' },
    //   ],
    //   ['link', 'image', 'video'],
    //   ['clean'],
    // ],
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { list: 'check' },  // New: Adds checklist support
          { indent: '-1' },
          { indent: '+1' },
          { script: 'sub' },
          { script: 'super' },
          { direction: 'rtl' },
        ],
        ['link', 'image', 'video', 'formula'],  // New: Adds formula button
        ['clean'],
      ]
    }
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "color",
    "background",
    "align",
    "list",
    "indent",
    "link",
    "image",
    "video",
    "script",
    "formula"
  ];

  return (
    <div
      ref={wrapperRef}
      className={`border rounded-lg overflow-hidden ${
        resizable ? "resize-y" : ""
      }`}
      style={{
        minHeight,
        maxHeight,
        height: minHeight,
      }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        bounds={document.body}
        className="h-full [&_.ql-editor]:min-h-full"
      />
    </div>
  );
};

export default QuillEditor;