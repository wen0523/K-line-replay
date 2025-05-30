import { create } from 'zustand';

type TimeState = {
  time: string;
  setTime: (val: string) => void;
};

export const useTimeStore = create<TimeState>((set) => ({
  time: '1d',
  setTime: (val) => set({ time: val }),
}));
