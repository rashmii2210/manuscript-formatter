import { create } from 'zustand';

export const useStore = create((set) => ({
  chatHistory: [],
  activeDocument: null,
  isProcessing: false,
  selectedStyle: 'APA',
  complianceScore: 0,
  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  setActiveDocument: (doc) => set({ activeDocument: doc }),
  setIsProcessing: (status) => set({ isProcessing: status }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setComplianceScore: (score) => set({ complianceScore: score }),
}));