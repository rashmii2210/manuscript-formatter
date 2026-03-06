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
        raw_text: `\\documentclass{article}\n\\title{Autonomous Agents}\n\\author{Raw Upload}\n\\begin{document}\n\\maketitle\n\nThis is a rough draft. We need to format the equation $E = mc^2$ and the block equation:\n$$ \\int_{a}^{b} x^2 dx $$\n\\end{document}`,
      });
    }, 1500);
  });
};

export const formatText = async (text, style) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        formatted_text: `\\documentclass{article}\n\\usepackage{amsmath}\n\\title{Autonomous Agents: A Formatted Approach}\n\\author{Agentic Formatter}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nThis document has been processed to simulate the agentic formatting process adhering to ${style} guidelines.\n\\end{abstract}\n\nThis is a refined draft. The inline equation is $E = mc^2$, and the properly structured block equation is:\n$$ \\int_{a}^{b} x^2 dx $$\n\\end{document}`,
        compliance_score: Math.floor(Math.random() * (100 - 85 + 1) + 85),
        download_url: '#'
      });
    }, 2500);
  });
};