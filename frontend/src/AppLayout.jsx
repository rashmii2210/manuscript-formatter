import React from 'react';
import { useStore } from './store';
import ChatContainer from './ChatContainer';
import ArtifactViewer from './ArtifactViewer';

export default function AppLayout() {
  // Subscribe only to activeDocument to control layout width shifts efficiently
  const activeDocument = useStore((state) => state.activeDocument);

  return (
    // Main wrapper: full screen, disabled window scrolling, flex layout
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 overflow-hidden font-sans">
      
      {/* Chat Section: Takes 40% width when document is active, 100% (max-3xl) when inactive */}
      <div 
        className={`transition-all duration-500 ease-in-out flex flex-col ${
          activeDocument ? 'w-2/5 border-r border-gray-200 bg-white' : 'w-full max-w-3xl mx-auto shadow-xl bg-white'
        }`}
      >
        {/* App Header */}
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between z-10 relative">
          <h1 className="font-semibold text-lg text-gray-800 tracking-tight">Agentic Formatter</h1>
        </div>
        
        <ChatContainer />
      </div>
      
      {/* Artifact Section: Renders and takes 60% width only when a document exists */}
      {activeDocument && (
        <div className="w-3/5 flex bg-white transition-all duration-500 ease-in-out">
          <ArtifactViewer />
        </div>
      )}
    </div>
  );
}