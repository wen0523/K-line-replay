import { create } from 'zustand';

type ThemeState = {
  theme: string;
  setTheme: (val: string) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  setTheme: (val) => set({ theme: val }),
}));
