import { create } from 'zustand';

// Zustand store for global state management.
// Using a global store prevents prop-drilling between ChatContainer and ArtifactViewer.
export const useStore = create((set) => ({
  // Core Data
  chatHistory: [], // Array of message objects: { role: 'user' | 'agent', content: string }
  activeDocument: null, // Object holding: { original: string, transformed: string, downloadUrl: string }
  
  // UI States
  isProcessing: false, // Tracks if the dummy/production API is currently fetching data
  selectedStyle: 'APA', // The target formatting style (e.g., APA, IEEE)
  complianceScore: 0, // A score out of 100 indicating adherence to the style guide
  
  // Actions to mutate the state
  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  setActiveDocument: (doc) => set({ activeDocument: doc }),
  setIsProcessing: (status) => set({ isProcessing: status }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setComplianceScore: (score) => set({ complianceScore: score }),
}));