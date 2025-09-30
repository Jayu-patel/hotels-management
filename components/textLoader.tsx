import React from "react";

type TextLoaderProps = {
  text: string;
  loading?: boolean;
  className?: string;
};

const TextLoader: React.FC<TextLoaderProps> = ({ text, loading = false, className = "" }) => {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {text}
      {loading && (
        <span className="ml-2 h-5 w-5 border-2 border-t-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></span>
      )}
    </span>
  );
};

export default TextLoader;
