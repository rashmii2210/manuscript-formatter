import React, { useState, useRef, useEffect } from 'react';
import { useStore } from './store';
import { uploadFile, formatText } from './api';

export default function ChatContainer() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { 
    chatHistory, 
    addMessage, 
    isProcessing,
    setIsProcessing, 
    setActiveDocument, 
    setComplianceScore,
    selectedStyle,
    setSelectedStyle
  } = useStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [input]);

  // ── API logic unchanged ──────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let originalText = "Preview only available for raw .tex or .txt uploads.";
    if (file.name.endsWith('.tex') || file.name.endsWith('.txt')) {
       originalText = await file.text();
    }

    addMessage({ role: 'user', content: `Uploaded document: ${file.name}` });
    setIsProcessing(true);

    try {
      const uploadResult = await uploadFile(file);
      const sessionId = uploadResult.session_id;

      const formatResult = await formatText(sessionId, selectedStyle);

      setActiveDocument({
        original: originalText,
        transformed: formatResult.latex_code,
        pdfData: formatResult.pdf_base64,
        downloadUrl: '#'
      });
      setComplianceScore(formatResult.compliance_score || 0);
      
      const correctionReasons = formatResult.explainable_corrections.map(c => c.reason).join("; ");
      addMessage({ role: 'agent', content: `I have applied ${selectedStyle} formatting. Key changes: ${correctionReasons}` });
      
    } catch (error) {
      addMessage({ role: 'agent', content: 'An error occurred while communicating with the formatting server.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const userText = input;
    addMessage({ role: 'user', content: userText });
    setInput('');
    setIsProcessing(true);
    
    try {
      const textFile = new File([userText], "prompt.tex", { type: "text/plain" });
      
      const uploadResult = await uploadFile(textFile);
      const formatResult = await formatText(uploadResult.session_id, selectedStyle);
      
      setActiveDocument({
        original: userText,
        transformed: formatResult.latex_code,
        pdfData: formatResult.pdf_base64,
        downloadUrl: '#'
      });
      setComplianceScore(formatResult.compliance_score || 0);
      addMessage({ role: 'agent', content: `I have formatted your text to match ${selectedStyle} guidelines.` });
      
    } catch (error) {
      addMessage({ role: 'agent', content: 'An error occurred while formatting the text.' });
    } finally {
      setIsProcessing(false);
    }
  };
  // ── end API logic ────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#f4ede3]">

      {/* ── Message History ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#d9cfc4] [&::-webkit-scrollbar-thumb]:rounded-full">

        {/* Empty state */}
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f0e4d4] border border-[#c4b8a8] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#b5622a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3d2f1e]">Upload a manuscript or type a prompt to begin.</p>
              <p className="text-xs text-[#a89880] mt-1">Supports .tex and .docx</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Agent avatar */}
            {msg.role === 'agent' && (
              <div className="w-7 h-7 rounded-lg bg-[#f0e4d4] border border-[#c4b8a8] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-[#b5622a]" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed font-medium ${
                msg.role === 'user'
                  ? 'bg-[#2d1f10] text-[#f9f3ea] rounded-2xl rounded-br-sm'
                  : 'bg-[#ede6d9] text-[#3d2f1e] rounded-2xl rounded-bl-sm border border-[#d9cfc4]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isProcessing && (
          <div className="flex w-full justify-start items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f0e4d4] border border-[#c4b8a8] flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-[#b5622a]" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#ede6d9] border border-[#d9cfc4] flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-[#b5622a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-[#b5622a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-[#b5622a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="px-4 pb-4 pt-3 border-t border-[#d9cfc4] bg-[#f4ede3] flex flex-col gap-2">

        {/* Style dropdown */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="style-select"
            className="text-[10px] font-bold text-[#7a6a58] uppercase tracking-widest flex-shrink-0"
          >
            Target Style:
          </label>
          <select
            id="style-select"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={isProcessing}
            className="text-xs font-semibold bg-white border border-[#c4b8a8] rounded-lg px-3 py-1.5 text-[#1a1208] outline-none focus:border-[#b5622a] focus:ring-2 focus:ring-[#f0e4d4] disabled:opacity-50 transition-all cursor-pointer"
          >
            <option value="APA">APA 7th Edition</option>
            <option value="IEEE">IEEE</option>
            <option value="MLA">MLA 9th Edition</option>
            <option value="Chicago">Chicago Manual of Style</option>
            <option value="Nature">Nature Journal</option>
          </select>
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className={`flex items-end gap-2 bg-white rounded-2xl border transition-all px-3 py-2 shadow-sm ${
            isProcessing
              ? 'opacity-70 border-[#d9cfc4]'
              : 'border-[#c4b8a8] focus-within:border-[#b5622a] focus-within:ring-2 focus-within:ring-[#f0e4d4]'
          }`}
        >
          {/* File upload */}
          <label
            aria-label="Upload File"
            className="p-1.5 text-[#a89880] hover:text-[#b5622a] hover:bg-[#f0e4d4] cursor-pointer rounded-lg transition-colors mb-0.5 flex-shrink-0"
          >
            <input
              type="file"
              className="hidden"
              accept=".tex,.docx,.pdf,.txt"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-transparent outline-none px-1 py-1.5 resize-none text-[#1a1208] text-sm font-medium placeholder-[#a89880] leading-relaxed [&::-webkit-scrollbar]:hidden"
            placeholder="Upload a document or type instructions..."
            rows={1}
            style={{ maxHeight: 128 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          {/* Submit button */}
          <button
            type="submit"
            aria-label="Send Message"
            disabled={isProcessing || !input.trim()}
            className="mb-0.5 p-2 rounded-xl bg-[#2d1f10] text-white hover:bg-[#3d2f1e] disabled:bg-[#d9cfc4] disabled:text-[#a89880] disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

        <p className="text-[10px] text-[#c4b8a8] text-center tracking-wide">shift + enter for newline</p>
      </div>
    </div>
  );
}