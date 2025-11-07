import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ImageUpload } from './common/ImageUpload';
import { FEATURES } from '../constants';

export const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const feature = FEATURES.find(f => f.id === 'image-editor')!;

  const handleImageSelect = (file: File) => {
    setOriginalImage(file);
    setEditedImage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !originalImage || isLoading) return;

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const imageBase64 = await fileToBase64(originalImage);
      const imageUrl = await geminiService.editImage(prompt, imageBase64, originalImage.type);
      setEditedImage(imageUrl);
    } catch (err) {
      setError('Failed to edit image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="w-full">
            <ImageUpload onImageSelect={handleImageSelect} previewUrl={originalImagePreview} />
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make it black and white, add a cat"
                className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue"
                disabled={isLoading || !originalImage}
            />
            <button
                type="submit"
                disabled={isLoading || !prompt.trim() || !originalImage}
                className="p-3 bg-gemini-blue rounded-lg text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600 transition flex items-center justify-center w-32"
            >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Edit Image'}
            </button>
        </form>
         {error && <div className="text-red-400 p-2 bg-red-900/50 rounded-lg">{error}</div>}

        <div className="flex-1 flex items-center justify-center bg-gray-900/50 rounded-lg p-4 min-h-[300px]">
          {isLoading ? (
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-400">Applying your edits...</p>
            </div>
          ) : editedImage ? (
            <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
          ) : (
            <div className="text-center text-gray-500">
              <feature.Icon className="mx-auto h-24 w-24 opacity-20" />
              <p>Your edited image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
