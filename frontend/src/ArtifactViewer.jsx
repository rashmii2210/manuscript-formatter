import React, { useState } from 'react';
import { useStore } from './store';

export default function ArtifactViewer() {
  const { activeDocument, complianceScore } = useStore();
  const [tab, setTab] = useState('transformed');

  if (!activeDocument) return null;

  const currentText = tab === 'original' ? activeDocument.original : activeDocument.transformed;

  const handleExportTex = () => {
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manuscript_${tab}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openInOverleaf = () => {
    // Create a hidden form to seamlessly POST to Overleaf
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank'; // Opens in a new browser tab

    // Overleaf expects the LaTeX code in a parameter called 'snip'
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'snip';
    input.value = currentText;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div className="flex flex-col w-full h-full shadow-inner shadow-gray-200 bg-[#fdfcf8]">
      <div className="flex flex-col gap-3 p-4 border-b border-gray-200 bg-white/90 backdrop-blur z-20 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'original'}
              onClick={() => setTab('original')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'original' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              Original Document
            </button>
            <button
              role="tab"
              aria-selected={tab === 'transformed'}
              onClick={() => setTab('transformed')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'transformed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              Transformed Format
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Compliance Score</span>
              <div className={`flex items-center justify-center h-6 w-10 rounded-md text-sm font-bold ${
                complianceScore >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {complianceScore}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={openInOverleaf}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors shadow-sm bg-green-600 text-white hover:bg-green-700 focus:outline-none"
                title="Open and render perfectly in Overleaf"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Overleaf
              </button>
              
              <button 
                onClick={handleExportTex}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors shadow-sm bg-gray-900 text-white hover:bg-gray-800 focus:outline-none"
              >
                Download .tex
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 selection:bg-blue-200 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="max-w-3xl mx-auto bg-white shadow-md border border-gray-200 min-h-[800px] p-12 lg:p-16 rounded-sm relative z-0">
          <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {currentText}
          </pre>
        </div>
      </div>
    </div>
  );
}