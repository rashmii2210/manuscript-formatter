import React from 'react';
import { useStore } from './store';
import ChatContainer from './ChatContainer';
import ArtifactViewer from './ArtifactViewer';

export default function AppLayout() {
  const activeDocument = useStore((state) => state.activeDocument);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4ede3]">

      {/* Chat Panel */}
      <div
        className={`flex flex-col transition-all duration-500 ease-in-out flex-shrink-0 ${
          activeDocument
            ? 'w-[38%] border-r border-[#d9cfc4]'
            : 'w-full max-w-[700px] mx-auto shadow-lg'
        } bg-[#f4ede3]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d9cfc4] bg-[#f4ede3]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#b5622a] shadow-[0_0_6px_#b5622a80]" />
            <h1 className="text-sm font-bold tracking-widest uppercase text-[#1a1208]">
              Agentic Formatter
            </h1>
          </div>
        </div>

        <ChatContainer />
      </div>

      {/* Artifact Panel */}
      {activeDocument && (
        <div className="flex-1 flex bg-[#ede6d9] transition-all duration-500 ease-in-out">
          <ArtifactViewer />
        </div>
      )}
    </div>
  );
}