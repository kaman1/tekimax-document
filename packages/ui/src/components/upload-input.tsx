"use client";

import {
  type UploadFileResponse,
  useUploadFiles,
} from "@xixixao/uploadstuff/react";
import { type InputHTMLAttributes, useRef, useState } from "react";
import { ImageIcon, UploadIcon } from '@radix-ui/react-icons';

interface UploadInputProps {
  generateUploadUrl: () => Promise<string>;
  onUploadComplete: (uploaded: UploadFileResponse[]) => void;
  label?: React.ReactNode;
  maxFiles?: number;
  accept?: string;
  id?: string;
  type?: string;
  className?: string;
  required?: boolean;
  tabIndex?: number;
  children?: React.ReactNode;
}

export function UploadInput({
  generateUploadUrl,
  onUploadComplete,
  label,
  children,
  ...props
}: UploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadFiles(generateUploadUrl, {
    onUploadComplete: async (uploaded) => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsUploading(false);
      onUploadComplete(uploaded);
    },
    onUploadError: () => {
      setIsUploading(false);
    },
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    startUpload(files);
  };

  if (label) {
    return (
      <div className="relative">
        {label}
        <div 
          onClick={handleClick}
          className="absolute top-0 left-0 right-0 bottom-0 z-10 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
        >
          <div className="absolute inset-0 bg-black/50 rounded-full" />
          <div className="relative z-20 flex flex-col items-center gap-1 text-white">
            <UploadIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Upload</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          {...props}
        />
      </div>
    );
  }

  return (
    <div 
      className="absolute top-0 left-0 right-0 bottom-0 cursor-pointer rounded-full flex flex-col items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          <span className="text-xs text-white font-medium">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <UploadIcon className="h-5 w-5 text-white" />
          <span className="text-xs text-white font-medium">Upload</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        {...props}
      />
    </div>
  );
}
