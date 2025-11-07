
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { SparkSearch } from './components/SparkSearch';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageEditor } from './components/ImageEditor';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { VideoGenerator } from './components/VideoGenerator';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { SparkProView } from './components/SparkProView';
import { FeatureId } from './types';
import { FEATURES } from './constants';

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleFeatureSelect = (featureId: FeatureId) => {
    setActiveFeature(featureId);
    setIsSidebarOpen(false);
  };

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'chat':
        return <ChatView />;
      case 'spark-search':
        return <SparkSearch />;
      case 'spark-pro':
        return <SparkProView />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'image-editor':
        return <ImageEditor />;
      case 'image-analyzer':
        return <ImageAnalyzer />;
      case 'video-generator':
        return <VideoGenerator />;
      case 'video-analyzer':
        return <VideoAnalyzer />;
      default:
        return <ChatView />;
    }
  };
  
  const currentFeature = FEATURES.find(f => f.id === activeFeature)!;

  return (
    <div className="h-screen bg-gray-800 text-white flex overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        activeFeature={activeFeature}
        onFeatureSelect={handleFeatureSelect}
      />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-20 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex-shrink-0 flex items-center p-4 border-b border-gray-700">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Open menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-4">
                <currentFeature.Icon className="h-8 w-8 text-gemini-teal" />
                <h2 className="text-2xl font-semibold text-white ml-3">{currentFeature.name}</h2>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="fade-in h-full" key={activeFeature}>
            {renderActiveFeature()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;