import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ImageUpload } from './common/ImageUpload';
import { FEATURES } from '../constants';

export const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState('What is in this image?');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const feature = FEATURES.find(f => f.id === 'image-analyzer')!;

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setAnalysis(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !imageFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      const result = await geminiService.analyzeImage(prompt, imageBase64, imageFile.type);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-y-auto">
        <div className="lg:w-1/2 flex flex-col gap-4">
            <ImageUpload onImageSelect={handleImageSelect} previewUrl={imagePreview} />
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask about the image..."
                    className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue"
                    disabled={isLoading || !imageFile}
                />
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim() || !imageFile}
                    className="p-3 bg-gemini-blue rounded-lg text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600 transition flex items-center justify-center w-32"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Analyze'}
                </button>
            </form>
            {error && <div className="text-red-400 p-2 bg-red-900/50 rounded-lg">{error}</div>}
        </div>
        <div className="flex-1 bg-gray-900/50 rounded-lg p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-400">Analyzing image...</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="text-gray-200 whitespace-pre-wrap">{analysis}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
              <div>
                <feature.Icon className="mx-auto h-24 w-24 opacity-20" />
                <p>Analysis will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
