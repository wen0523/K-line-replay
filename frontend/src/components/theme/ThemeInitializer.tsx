'use client';

import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeInitializer() {
  const { theme, initialize, isInitialized, isTransitioning, setTransitioning } = useThemeStore();
  const previousThemeRef = useRef<string | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化主题
  useEffect(() => {
    initialize();
    
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      
      // 立即应用初始主题，避免闪烁
      html.classList.remove('light', 'dark');
      html.classList.add(theme);
      
      // 标记为已初始化
      requestAnimationFrame(() => {
        html.classList.add('theme-initialized');
      });
    }
  }, [initialize]);

  // 处理主题切换动画
  useEffect(() => {
    if (!isInitialized || typeof document === 'undefined') return;
    
    const html = document.documentElement;
    const currentTheme = theme;
    const previousTheme = previousThemeRef.current;
    
    // 如果是第一次设置或主题没有变化，直接应用
    if (!previousTheme || previousTheme === currentTheme) {
      html.classList.remove('light', 'dark');
      html.classList.add(currentTheme);
      previousThemeRef.current = currentTheme;
      return;
    }

    // 清除之前的过渡超时
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // 开始主题切换动画序列
    const performThemeTransition = async () => {
      // 阶段1: 准备阶段 - 禁用所有过渡
      html.classList.add('theme-preparing');
      html.classList.remove('theme-initialized', 'theme-transitioning');
      
      // 添加will-change优化
      html.classList.add('will-change-theme');
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 阶段2: 切换主题类
      html.classList.remove('light', 'dark');
      html.classList.add(currentTheme);
      
      await new Promise(resolve => setTimeout(resolve, 5));
      
      // 阶段3: 启用分层过渡动画
      html.classList.remove('theme-preparing');
      html.classList.add('theme-transitioning');
      
      // 阶段4: 等待动画完成后恢复正常状态
      transitionTimeoutRef.current = setTimeout(() => {
        html.classList.remove('theme-transitioning', 'will-change-theme');
        html.classList.add('theme-initialized');
        setTransitioning(false);
        transitionTimeoutRef.current = null;
      }, 400); // 与最长的过渡时间匹配
    };

    performThemeTransition();
    previousThemeRef.current = currentTheme;
  }, [theme, isInitialized, setTransitioning]);

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('theme-storage');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        useThemeStore.getState().setTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return null;
}