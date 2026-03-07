import React, { useState } from 'react';
import { useStore } from './store';

export default function ArtifactViewer() {
  const { activeDocument, complianceScore } = useStore();
  const [tab, setTab] = useState('transformed');

  if (!activeDocument) return null;

  const currentText = tab === 'original' ? activeDocument.original : activeDocument.transformed;

  // ── API / export logic unchanged ────────────────────────────────
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
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'snip';
    input.value = currentText;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };
  // ── end logic ────────────────────────────────────────────────────

  const scoreHigh = complianceScore >= 90;

  return (
    <div className="flex flex-col w-full h-full bg-[#ede6d9]">

      {/* ── Toolbar ── */}
      <div className="sticky top-0 z-20 px-5 py-3 border-b border-[#d9cfc4] bg-[#f4ede3] flex items-center justify-between gap-3 flex-wrap shadow-sm">

        {/* Tab toggles */}
        <div className="flex bg-[#ede6d9] border border-[#d9cfc4] rounded-xl p-1 gap-1" role="tablist">
          {[
            { key: 'original', label: 'Original' },
            { key: 'transformed', label: 'Transformed' },
          ].map(t => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                tab === t.key
                  ? 'bg-white text-[#1a1208] shadow-sm'
                  : 'text-[#7a6a58] hover:text-[#3d2f1e] hover:bg-[#f0e4d4]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">

          {/* Compliance score */}
          <div className="flex items-center gap-2 bg-white border border-[#d9cfc4] px-3 py-1.5 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-[#7a6a58] uppercase tracking-widest">Score</span>
            <div className="flex items-center gap-1.5">
              {/* Arc progress */}
              <svg width="26" height="26" viewBox="0 0 26 26">
                <circle cx="13" cy="13" r="9" fill="none" stroke="#ede6d9" strokeWidth="3" />
                <circle
                  cx="13" cy="13" r="9"
                  fill="none"
                  stroke={scoreHigh ? '#2d7a3a' : '#b5622a'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(complianceScore / 100) * 56.5} 56.5`}
                  transform="rotate(-90 13 13)"
                  className="transition-all duration-700"
                />
              </svg>
              <span className={`text-sm font-extrabold ${scoreHigh ? 'text-[#2d7a3a]' : 'text-[#b5622a]'}`}>
                {complianceScore}
              </span>
            </div>
          </div>

          {/* Open in Overleaf */}
          <button
            onClick={openInOverleaf}
            title="Open and render perfectly in Overleaf"
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl bg-[#2d6a2d] text-white hover:bg-[#245724] transition-colors shadow-sm tracking-wide"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Overleaf
          </button>

          {/* Download */}
          <button
            onClick={handleExportTex}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl bg-[#2d1f10] text-white hover:bg-[#3d2f1e] transition-colors shadow-sm tracking-wide"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .tex
          </button>
        </div>
      </div>

      {/* ── Document area ── */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d9cfc4] [&::-webkit-scrollbar-thumb]:rounded-full selection:bg-[#f0e4d4]">
        <div className="max-w-3xl mx-auto bg-[#faf7f2] border border-[#d9cfc4] min-h-[800px] rounded-sm shadow-md relative overflow-hidden">

          {/* Top accent bar — color shifts with tab */}
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] transition-all duration-300 ${
              tab === 'transformed'
                ? 'bg-gradient-to-r from-transparent via-[#b5622a] to-transparent'
                : 'bg-gradient-to-r from-transparent via-[#c4b8a8] to-transparent'
            }`}
          />

          <div className="p-10 lg:p-14 pt-12">
            <pre className="font-mono text-sm text-[#1a1208] whitespace-pre-wrap leading-relaxed">
              {currentText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}