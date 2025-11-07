
import React, { useRef } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  text?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, previewUrl, text = "Upload Image" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-gemini-blue transition-colors"
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
      ) : (
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l4.172-4.172a4 4 0 015.656 0L20 32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-2 block text-sm font-medium">{text}</span>
        </div>
      )}
    </div>
  );
};
   