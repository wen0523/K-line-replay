import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeState = {
  theme: 'light' | 'dark';
  setTheme: (val: 'light' | 'dark') => void;
  isInitialized: boolean;
  initialize: () => void;
  isTransitioning: boolean;
  setTransitioning: (val: boolean) => void;
};

// 获取系统主题偏好
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isInitialized: false,
      isTransitioning: false,
      setTheme: (val: 'light' | 'dark') => {
        // 防抖处理，避免快速切换
        const currentTheme = get().theme;
        if (currentTheme === val || get().isTransitioning) return;
        
        // 设置过渡状态
        set({ isTransitioning: true });
        
        // 延迟设置主题，让ThemeInitializer处理DOM操作
        setTimeout(() => {
          set({ theme: val });
        }, 10);
      },
      setTransitioning: (val: boolean) => {
        set({ isTransitioning: val });
      },
      initialize: () => {
        if (get().isInitialized) return;
        
        // 如果没有保存的主题，使用系统主题
        const savedTheme = get().theme;
        const systemTheme = getSystemTheme();
        const initialTheme = savedTheme || systemTheme;
        
        set({ theme: initialTheme, isInitialized: true });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
