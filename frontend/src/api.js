// ==========================================
// PRODUCTION API (Commented out for backend integration)
// ==========================================

const BASE_URL = 'http://127.0.0.1:5000/api';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Upload failed');
  return response.json(); // Returns { session_id, metadata, message }
};

export const formatText = async (sessionId, style) => {
  const response = await fetch(`${BASE_URL}/format`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, target_style: style }),
  });
  
  if (!response.ok) throw new Error('Formatting failed');
  return response.json(); // Returns { latex_code, compliance_score, explainable_corrections }
};

// ==========================================
// DUMMY API (Active for frontend testing)
// ==========================================

// /**
//  * Simulates a file upload endpoint, returning raw LaTeX text.
//  * @param {File} file - The file selected by the user.
//  */
// export const uploadFile = async (file) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         raw_text: `\\documentclass{article}\n\\title{Autonomous Agents}\n\\author{Raw Upload}\n\\begin{document}\n\\maketitle\n\nThis is a rough draft. We need to format the equation $E = mc^2$ and the block equation:\n$$ \\int_{a}^{b} x^2 dx $$\n\\end{document}`,
//       });
//     }, 1500); // 1.5 second simulated network delay
//   });
// };

// /**
//  * Simulates the agentic formatting endpoint, returning transformed LaTeX.
//  * @param {string} text - The raw text to be formatted.
//  * @param {string} style - The target style guide (e.g., "APA").
//  */
// export const formatText = async (text, style) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         formatted_text: `\\documentclass{article}\n\\usepackage{amsmath}\n\\title{Autonomous Agents: A Formatted Approach}\n\\author{Agentic Formatter}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nThis document has been processed to simulate the agentic formatting process adhering to ${style} guidelines.\n\\end{abstract}\n\nThis is a refined draft. The inline equation is $E = mc^2$, and the properly structured block equation is:\n$$ \\int_{a}^{b} x^2 dx $$\n\\end{document}`,
//         compliance_score: Math.floor(Math.random() * (100 - 85 + 1) + 85), // Random score between 85-100
//         download_url: '#' // Dummy URL; the local Blob handles the actual export in the UI
//       });
//     }, 2500); // 2.5 second simulated processing delay
//   });
// };