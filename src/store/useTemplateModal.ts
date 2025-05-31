
import { create } from 'zustand';

interface TemplateModalState {
  tpl: any | null;
  open: (template: any) => void;
  close: () => void;
}

export const useTemplateModal = create<TemplateModalState>((set) => ({
  tpl: null,
  open: (template) => set({ tpl: template }),
  close: () => set({ tpl: null })
}));
