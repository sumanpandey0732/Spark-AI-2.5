import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { LoadingSpinner } from './common/LoadingSpinner';
import { FEATURES } from '../constants';
import { ImageAspectRatio } from '../types';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  // Fix: Use ImageAspectRatio type from types.ts
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feature = FEATURES.find(f => f.id === 'image-generator')!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await geminiService.generateImage(prompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-y-auto">
        <div className="lg:w-1/3 space-y-4">
          <form onSubmit={handleSubmit} className="p-4 bg-gray-900 rounded-lg space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic cityscape at sunset, with flying cars"
                className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue min-h-[100px]"
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
              <select
                id="aspectRatio"
                value={aspectRatio}
                // Fix: Use ImageAspectRatio type from types.ts
                onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}
                className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue"
              >
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
                <option value="4:3">Standard (4:3)</option>
                <option value="3:4">Tall (3:4)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full p-3 bg-gemini-blue rounded-lg text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600 transition flex items-center justify-center"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              <span className={isLoading ? 'ml-2' : ''}>Generate Image</span>
            </button>
          </form>
          {error && <div className="text-red-400 p-2 bg-red-900/50 rounded-lg">{error}</div>}
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-900/50 rounded-lg p-4">
          {isLoading ? (
             <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-400">Generating your masterpiece...</p>
             </div>
          ) : generatedImage ? (
            <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
          ) : (
            <div className="text-center text-gray-500">
                <feature.Icon className="mx-auto h-24 w-24 opacity-20" />
                <p>Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
