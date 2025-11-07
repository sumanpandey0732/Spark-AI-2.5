import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ImageUpload } from './common/ImageUpload';
import { FEATURES } from '../constants';
import type { GenerateVideosOperation } from '@google/genai';
import { VideoAspectRatio } from '../types';

const loadingMessages = [
    "Warming up the digital director...",
    "Choreographing pixels into motion...",
    "Rendering your cinematic vision...",
    "This can take a few minutes, hang tight!",
    "Adding the final touches of movie magic...",
    "Almost ready for the premiere..."
];

export const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    // Fix: Use VideoAspectRatio type from types.ts
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    const pollerRef = useRef<number | null>(null);

    const feature = FEATURES.find(f => f.id === 'video-generator')!;
    
    const checkApiKey = useCallback(async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setApiKeySelected(true);
        } else {
            setApiKeySelected(false);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);
    
    useEffect(() => {
        if(isLoading) {
            const interval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    return loadingMessages[(currentIndex + 1) % loadingMessages.length];
                });
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success to avoid race conditions and re-enable the UI
            setApiKeySelected(true);
        }
    };

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        setVideoUrl(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const pollOperation = useCallback(async (operation: GenerateVideosOperation) => {
        let currentOp = operation;
        while (!currentOp.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            try {
                currentOp = await geminiService.pollVideoOperation(currentOp);
            } catch (err: any) {
                if (err.message.includes("Requested entity was not found")) {
                    setApiKeySelected(false); // Reset key state on this specific error
                }
                throw err; // re-throw to be caught by handleSubmit
            }
        }
        return currentOp;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !imageFile || isLoading) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const imageBase64 = await fileToBase64(imageFile);
            let initialOperation = await geminiService.generateVideo(prompt, imageBase64, imageFile.type, aspectRatio);
            
            const finalOperation = await pollOperation(initialOperation);

            const downloadLink = finalOperation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink && process.env.API_KEY) {
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                setVideoUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("Video generation succeeded, but no download link was provided.");
            }
        } catch (err: any) {
            setError(`Failed to generate video: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
            if(pollerRef.current) clearInterval(pollerRef.current);
        }
    };
    
    if (!apiKeySelected) {
        return (
            <div className="flex flex-col h-full bg-gray-800">
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <h3 className="text-xl font-semibold mb-4">API Key Required for Veo</h3>
                    <p className="max-w-md mb-6 text-gray-400">
                        Video generation with Veo requires you to select an API key. This feature may incur costs.
                        Please review the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-gemini-blue underline">billing documentation</a> for details.
                    </p>
                    <button onClick={handleSelectKey} className="px-6 py-3 bg-gemini-blue rounded-lg text-white font-semibold hover:bg-blue-600 transition">
                        Select API Key
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-800">
            <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-y-auto">
                <div className="lg:w-1/3 space-y-4">
                    <ImageUpload onImageSelect={handleImageSelect} previewUrl={imagePreview} text="Upload Starting Image" />
                    <form onSubmit={handleSubmit} className="p-4 bg-gray-900 rounded-lg space-y-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., The camera slowly zooms out to reveal a vast landscape"
                            className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue min-h-[100px]"
                            rows={3}
                            disabled={!imageFile}
                        />
                        <select
                            value={aspectRatio}
                            // Fix: Use VideoAspectRatio type from types.ts
                            onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
                            className="w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue"
                            disabled={!imageFile}
                        >
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                        </select>
                        <button type="submit" disabled={isLoading || !prompt.trim() || !imageFile} className="w-full p-3 bg-gemini-blue rounded-lg text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600 transition">
                            Generate Video
                        </button>
                    </form>
                    {error && <div className="text-red-400 p-2 bg-red-900/50 rounded-lg">{error}</div>}
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-900/50 rounded-lg p-4">
                    {isLoading ? (
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-gray-400">{loadingMessage}</p>
                        </div>
                    ) : videoUrl ? (
                        <video src={videoUrl} controls autoPlay loop className="max-h-full max-w-full rounded-lg" />
                    ) : (
                        <div className="text-center text-gray-500">
                            <feature.Icon className="mx-auto h-24 w-24 opacity-20" />
                            <p>Your generated video will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
