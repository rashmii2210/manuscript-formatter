import React, { useState } from 'react';
import { useStore } from './store';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function ArtifactViewer() {
  const { activeDocument, complianceScore } = useStore();
  const [tab, setTab] = useState('transformed'); // Tracks 'original' vs 'transformed' state
  const [viewMode, setViewMode] = useState('rendered'); // Tracks Visual vs Code view

  if (!activeDocument) return null;

  /**
   * Packages the currently viewed text into a Blob and triggers
   * a native browser download for the user as a .tex file.
   */
  const handleExport = () => {
    const textToExport = tab === 'original' ? activeDocument.original : activeDocument.transformed;
    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `manuscript_${tab}.tex`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentText = tab === 'original' ? activeDocument.original : activeDocument.transformed;

  /**
   * Strips out raw LaTeX document structure tags so the frontend
   * LaTeX renderer (KaTeX) only processes the math block equations.
   * This simulates a clean "compiled" preview.
   */
  const cleanTextForRendering = (text) => {
    if (!text) return '';
    return text
      .replace(/\\documentclass(\[.*?\])?\{.*?\}/g, '')
      .replace(/\\usepackage(\[.*?\])?\{.*?\}/g, '')
      .replace(/\\title\{.*?\}/g, '')
      .replace(/\\author\{.*?\}/g, '')
      .replace(/\\begin\{document\}/g, '')
      .replace(/\\end\{document\}/g, '')
      .replace(/\\maketitle/g, '')
      .replace(/\\begin\{abstract\}/g, 'Abstract\n')
      .replace(/\\end\{abstract\}/g, '\n')
      .trim();
  };

  return (
    <div className="flex flex-col w-full h-full shadow-inner shadow-gray-200 bg-[#fdfcf8]">
      
      {/* Header / Toolbar Area */}
      <div className="flex flex-col gap-3 p-4 border-b border-gray-200 bg-white/90 backdrop-blur z-20 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between">
          
          {/* Document State Toggles */}
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
          
          {/* Score & Export Area */}
          <div className="flex items-center gap-4">
            {/* Compliance Dashboard */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm" title="Formatting Compliance Score">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Compliance Score</span>
              <div className={`flex items-center justify-center h-6 w-10 rounded-md text-sm font-bold ${
                complianceScore >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {complianceScore}
              </div>
            </div>
            
            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors shadow-sm bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export .tex
            </button>
          </div>
        </div>

        {/* View Mode Toggles (Rendered Output vs Raw LaTeX Code) */}
        <div className="flex items-center justify-end">
           <div className="flex gap-1 bg-gray-100 p-1 rounded-md border border-gray-200">
             <button
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'rendered' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Rendered Output
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'code' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                LaTeX Code
              </button>
           </div>
        </div>
      </div>
      
      {/* Document Viewing Area - styled with custom webkit scrollbars */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 selection:bg-blue-200 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="max-w-3xl mx-auto bg-white shadow-md border border-gray-200 min-h-[800px] p-12 lg:p-16 rounded-sm relative z-0">
          
          {/* Render Math OR Raw Syntax */}
          {viewMode === 'rendered' ? (
            <div className="font-serif text-gray-800 leading-loose text-base whitespace-pre-wrap">
              <Latex>{cleanTextForRendering(currentText)}</Latex>
            </div>
          ) : (
            <pre className="font-mono text-sm text-gray-300 bg-gray-900 p-6 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {currentText}
            </pre>
          )}

        </div>
      </div>
    </div>
  );
}