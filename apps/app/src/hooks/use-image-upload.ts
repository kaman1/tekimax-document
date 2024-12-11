"use client";

import { useRef, useState } from "react";

export type UseImageUploadProps = {
  onUploadStart?: () => void;
  onUploadComplete?: (file: File) => void;
};

export const useImageUpload = ({ onUploadStart, onUploadComplete }: UseImageUploadProps = {}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setCurrentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Trigger upload handlers
      onUploadStart?.();
      onUploadComplete?.(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName(null);
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    fileName,
    currentFile,
  };
};
