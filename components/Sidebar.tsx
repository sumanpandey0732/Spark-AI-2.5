import React from 'react';
import { FEATURES } from '../constants';
import { FeatureId } from '../types';

interface SidebarProps {
  activeFeature: FeatureId;
  onFeatureSelect: (featureId: FeatureId) => void;
  isSidebarOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeFeature, onFeatureSelect, isSidebarOpen }) => {
  return (
    <aside className={`bg-gray-900 text-white flex flex-col fixed top-0 left-0 h-full z-30 w-64 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 border-b border-gray-700 flex items-center justify-center min-h-[85px]">
        <h1 className="text-2xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-gemini-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.543l.227 1.001.227-1.001a2.25 2.25 0 00-1.523-1.523l-1.001-.227 1.001-.227a2.25 2.25 0 001.523-1.523l.227-1.001.227 1.001a2.25 2.25 0 001.523 1.523l1.001.227-1.001.227a2.25 2.25 0 00-1.523 1.523z" />
          </svg>
           <span className="whitespace-nowrap">
            Spark AI
          </span>
        </h1>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {FEATURES.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onFeatureSelect(feature.id)}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
              activeFeature === feature.id
                ? 'bg-gemini-blue text-white'
                : 'hover:bg-gray-700'
            }`}
          >
            <feature.Icon className="h-6 w-6 flex-shrink-0" />
            <span className="ml-3 whitespace-nowrap">
                {feature.name}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
