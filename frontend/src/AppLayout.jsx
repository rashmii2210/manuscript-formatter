import React from 'react';
import { useStore } from './store';
import ChatContainer from './ChatContainer';
import ArtifactViewer from './ArtifactViewer';

export default function AppLayout() {
  const activeDocument = useStore((state) => state.activeDocument);

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <div 
        className={`transition-all duration-300 ease-in-out flex flex-col ${
          activeDocument ? 'w-2/5 border-r border-gray-200' : 'w-full max-w-3xl mx-auto'
        }`}
      >
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
          <h1 className="font-semibold text-lg text-gray-800">Agentic Formatter</h1>
        </div>
        <ChatContainer />
      </div>
      
      {activeDocument && (
        <div className="w-3/5 flex bg-white transition-all duration-300 ease-in-out">
          <ArtifactViewer />
        </div>
      )}
    </div>
  );
}