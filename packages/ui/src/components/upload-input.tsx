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
  className,
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
      if (uploaded && uploaded.length > 0) {
        console.log('Upload complete:', uploaded); // Debug log
        onUploadComplete(uploaded);
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error); // Debug log
      setIsUploading(false);
    },
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      await startUpload(files);
    } catch (error) {
      console.error('Error starting upload:', error); // Debug log
      setIsUploading(false);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={className}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        {...props}
      />
      {children || label || (
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">
            {isUploading ? 'Uploading...' : 'Click to upload'}
          </span>
        </div>
      )}
    </div>
  );
}
