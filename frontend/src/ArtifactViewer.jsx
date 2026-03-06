import React, { useState } from 'react';
import { useStore } from './store';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function ArtifactViewer() {
  const { activeDocument, complianceScore } = useStore();
  const [tab, setTab] = useState('transformed');
  const [viewMode, setViewMode] = useState('rendered');

  if (!activeDocument) return null;

  const handleExport = () => {
    if (activeDocument.downloadUrl) {
      window.location.href = activeDocument.downloadUrl;
    }
  };

  const currentText = tab === 'original' ? activeDocument.original : activeDocument.transformed;

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
    <div className="flex flex-col w-full h-full shadow-inner shadow-gray-200">
      <div className="flex flex-col gap-3 p-4 border-b border-gray-200 bg-gray-50/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-200/60 p-1 rounded-lg">
            <button
              onClick={() => setTab('original')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'original' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              Original Document
            </button>
            <button
              onClick={() => setTab('transformed')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === 'transformed' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              Transformed Format
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Compliance Score</span>
              <div className={`flex items-center justify-center h-6 w-10 rounded-md text-sm font-bold ${
                complianceScore >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {complianceScore}
              </div>
            </div>
            
            <button 
              onClick={handleExport}
              disabled={!activeDocument.downloadUrl}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                activeDocument.downloadUrl 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export .docx
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
           <div className="flex gap-1 bg-gray-100 p-1 rounded-md border border-gray-200">
             <button
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'rendered' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Rendered Output
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  viewMode === 'code' 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                LaTeX Code
              </button>
           </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-12 bg-[#fdfcf8] selection:bg-blue-200">
        <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-100 min-h-[800px] p-16">
          {viewMode === 'rendered' ? (
            <div className="font-serif text-gray-800 leading-loose text-base whitespace-pre-wrap">
              <Latex>{cleanTextForRendering(currentText)}</Latex>
            </div>
          ) : (
            <pre className="font-mono text-sm text-gray-100 bg-gray-900 p-6 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {currentText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}