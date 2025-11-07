import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import { getVideoFrames } from '../utils/helpers';
import { LoadingSpinner } from './common/LoadingSpinner';
import { FEATURES } from '../constants';

export const VideoAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState('Summarize this video.');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string | null>(null);
    
    const feature = FEATURES.find(f => f.id === 'video-analyzer')!;
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setAnalysis(null);
            setVideoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !videoFile || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        
        try {
            setProgress("Extracting frames from video...");
            const { frames } = await getVideoFrames(videoFile, 1); // 1 frame per second
            
            if (frames.length === 0) {
                throw new Error("Could not extract any frames from the video.");
            }
            
            setProgress(`Analyzing ${frames.length} frames...`);
            const result = await geminiService.analyzeVideo(prompt, frames);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to analyze video. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
            setProgress(null);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-gray-800">
            <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-y-auto">
                <div className="lg:w-1/2 flex flex-col gap-4">
                    <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                        {videoPreview ? (
                            <video src={videoPreview} controls className="max-h-full max-w-full" />
                        ) : (
                            <label htmlFor="video-upload" className="cursor-pointer text-center text-gray-400">
                                <feature.Icon className="mx-auto h-12 w-12" />
                                <span className="mt-2 block text-sm font-medium">Upload Video</span>
                            </label>
                        )}
                        <input id="video-upload" type="file" onChange={handleFileChange} className="hidden" accept="video/*" />
                    </div>
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask about the video..."
                            className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue"
                            disabled={isLoading || !videoFile}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim() || !videoFile}
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
                                <p className="mt-4 text-gray-400">{progress || 'Analyzing video...'}</p>
                            </div>
                        </div>
                    ) : analysis ? (
                        <div className="text-gray-200 whitespace-pre-wrap">{analysis}</div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <div>
                                <feature.Icon className="mx-auto h-24 w-24 opacity-20" />
                                <p>Video analysis will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
