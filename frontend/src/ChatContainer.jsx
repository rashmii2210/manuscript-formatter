import React, { useState } from 'react';
import { useStore } from './store';
import { uploadFile, formatText } from './api';

export default function ChatContainer() {
  const [input, setInput] = useState('');
  
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

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <p>Upload a manuscript or type a prompt to begin.</p>
          </div>
        )}
        
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] p-4 rounded-2xl bg-gray-100 rounded-bl-none flex gap-1.5 items-center shadow-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2 z-10 relative">
        <div className="flex items-center gap-2">
          <label htmlFor="style-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Target Style:</label>
          <select 
            id="style-select"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={isProcessing}
            className="text-sm bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 transition-all"
          >
            <option value="APA">APA 7th Edition</option>
            <option value="IEEE">IEEE</option>
            <option value="MLA">MLA 9th Edition</option>
            <option value="Chicago">Chicago Manual of Style</option>
            <option value="Nature">Nature Journal</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className={`flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-300 transition-all ${isProcessing ? 'opacity-70' : 'focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20'}`}>
          <label aria-label="Upload File" className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer rounded-full hover:bg-gray-200 transition-colors mb-1">
            <input 
              type="file" 
              className="hidden" 
              accept=".tex,.docx,.pdf,.txt" 
              onChange={handleFileUpload} 
              disabled={isProcessing}
            />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </label>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="flex-1 max-h-32 min-h-[40px] bg-transparent outline-none px-2 py-2 resize-none text-gray-700 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
            placeholder="Upload a document or type instructions..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <button type="submit" aria-label="Send Message" disabled={isProcessing || !input.trim()} className="p-2 mb-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}