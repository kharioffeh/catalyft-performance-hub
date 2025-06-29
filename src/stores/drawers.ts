
import { create } from 'zustand';

interface ScheduleDrawerState {
  isOpen: boolean;
  selectedDate: string | null;
  open: (params: { date: string }) => void;
  close: () => void;
}

export const useScheduleDrawer = create<ScheduleDrawerState>((set) => ({
  isOpen: false,
  selectedDate: null,
  open: (params) => set({ isOpen: true, selectedDate: params.date }),
  close: () => set({ isOpen: false, selectedDate: null }),
}));
