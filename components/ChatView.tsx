import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import * as geminiService from '../services/geminiService';
import { ChatMessage } from '../types';
import { LoadingSpinner } from './common/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './common/CodeBlock';
import { CopyButton } from './common/CopyButton';

export const ChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current = geminiService.createChatSession({ model: 'gemini-2.5-flash' });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]); // Scroll on new messages and when loading starts/stops
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            if (!chatRef.current) {
                throw new Error("Chat session not initialized.");
            }
            const stream = await chatRef.current.sendMessageStream({ message: currentInput });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'model') {
                        const updatedMessages = [...prev];
                        updatedMessages[prev.length - 1] = { ...lastMessage, parts: [{ text: modelResponse }] };
                        return updatedMessages;
                    }
                    return prev;
                });
            }

        } catch (err) {
            setError('Failed to get response. Please try again.');
            console.error(err);
             // remove the empty model message on error
             setMessages(prev => prev.filter((msg, index) => index !== prev.length -1 || msg.parts[0].text.length > 0));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-gray-800">
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-gemini-blue text-white' : 'bg-gray-700'}`}>
                                <div className="prose prose-invert max-w-none prose-p:my-0 prose-pre:my-2">
                                    <ReactMarkdown
                                        components={{
                                            // Fix: Add 'any' type to props to resolve TS error with 'inline' property.
                                            code({node, inline, className, children, ...rest}: any) {
                                              const match = /language-(\w+)/.exec(className || '')
                                              return !inline && match ? (
                                                <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                                              ) : (
                                                <code className={className} {...rest}>
                                                  {children}
                                                </code>
                                              )
                                            }
                                        }}
                                    >
                                        {msg.parts[0].text}
                                    </ReactMarkdown>
                                </div>
                                {msg.role === 'model' && msg.parts[0].text && !isLoading && (
                                    <div className="flex justify-end mt-1">
                                        <CopyButton textToCopy={msg.parts[0].text} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role !== 'model' && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-gray-700 flex items-center space-x-2">
                                <LoadingSpinner size="sm" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-gray-700">
                {error && <div className="text-red-400 p-2 mb-2 bg-red-900/50 rounded-lg">{error}</div>}
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gemini-blue"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-gemini-blue rounded-lg text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};
