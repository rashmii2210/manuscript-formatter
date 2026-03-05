// export const uploadFile = async (file) => {
//   const formData = new FormData();
//   formData.append('file', file);
  
//   const response = await fetch('/api/upload', {
//     method: 'POST',
//     body: formData,
//   });
  
//   if (!response.ok) {
//     throw new Error('Upload failed');
//   }
  
//   return response.json();
// };

// export const formatText = async (parsedText, selectedStyle) => {
//   const response = await fetch('/api/format', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ 
//       text: parsedText, 
//       style: selectedStyle 
//     }),
//   });
  
//   if (!response.ok) {
//     throw new Error('Formatting failed');
//   }
  
//   return response.json();
// };

export const uploadFile = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        raw_text: `RAW EXTRACTED TEXT FROM: ${file.name}\n\nTitle: Autonomous Agents\n\nIntroduction\nThis is a rough draft without proper academic formatting. We need to fix the margins, citations, and structure to meet journal standards.`,
      });
    }, 1500);
  });
};

export const formatText = async (text, style) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        formatted_text: `FORMATTED MANUSCRIPT (${style} STYLE)\n\nAbstract\nThis document has been processed by the mock API to simulate the agentic formatting process. The structure now adheres to the requested journal guidelines.\n\nKeywords: automation, agents, mock-data\n\nIntroduction\nThis is a rough draft without proper academic formatting. We need to fix the margins, citations, and structure to meet journal standards.`,
        compliance_score: Math.floor(Math.random() * (100 - 85 + 1) + 85),
        download_url: '#'
      });
    }, 2500);
  });
};