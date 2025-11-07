
import { GoogleGenAI, GenerateVideosOperation, Chat, Part, Modality, GenerateContentResponse } from "@google/genai";
import { ImageAspectRatio, VideoAspectRatio } from "../types";
import { DEVELOPER_ATTRIBUTION } from "../constants";

// For Veo, we need to create a new instance each time to get the latest key.
// For others, it's fine to reuse, but creating new one is safer.
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string, aspectRatio: ImageAspectRatio): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image was generated.");
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
                { text: prompt },
            ],
        },
    });
    return response.text;
};

export const analyzeVideo = async (prompt: string, frames: string[]): Promise<string> => {
    const ai = getAi();
    const imageParts: Part[] = frames.map(frame => ({
        inlineData: {
            data: frame,
            mimeType: 'image/jpeg',
        },
    }));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, ...imageParts] },
    });
    return response.text;
};

export const generateVideo = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: VideoAspectRatio): Promise<GenerateVideosOperation> => {
    const ai = getAi();
    
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
    });
    return operation;
};

export const pollVideoOperation = async (operation: GenerateVideosOperation): Promise<GenerateVideosOperation> => {
    const ai = getAi();
    return await ai.operations.getVideosOperation({ operation: operation });
};

// Chat creation
export const createChatSession = (config: { model: string, tools?: any, history?: any }): Chat => {
    const ai = getAi();
    const isChatModel = config.model === 'gemini-2.5-flash' || config.model === 'gemini-2.5-pro';
    return ai.chats.create({
        model: config.model,
        config: {
          ...(config.tools && { tools: config.tools }),
          ...(isChatModel && { systemInstruction: DEVELOPER_ATTRIBUTION }),
        },
        history: config.history,
    });
};