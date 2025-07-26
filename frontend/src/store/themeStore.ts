/**
 * 主题状态管理
 * 管理应用的主题切换（明亮/暗黑模式）
 */

import { create } from 'zustand';

// ==================== 类型定义 ====================

/**
 * 支持的主题类型
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 主题状态接口
 */
interface ThemeState {
  /** 当前选中的主题 */
  theme: Theme;
  /** 设置主题 */
  setTheme: (theme: Theme) => void;
  /** 切换主题（在明亮和暗黑之间） */
  toggleTheme: () => void;
  /** 重置为默认主题 */
  resetTheme: () => void;
  /** 验证主题格式 */
  isValidTheme: (theme: string) => boolean;
  /** 获取主题显示名称 */
  getThemeLabel: (theme?: Theme) => string;
  /** 获取实际应用的主题（处理system主题） */
  getResolvedTheme: () => 'light' | 'dark';
}

// ==================== 常量定义 ====================

/** 默认主题 */
const DEFAULT_THEME: Theme = 'light';

/** 支持的主题列表 */
const VALID_THEMES: Theme[] = ['light', 'dark', 'system'];

/** 主题显示名称映射 */
const THEME_LABELS: Record<Theme, string> = {
  light: '明亮模式',
  dark: '暗黑模式',
  system: '跟随系统',
};

// ==================== 工具函数 ====================

/**
 * 验证主题格式
 */
const validateTheme = (theme: string): theme is Theme => {
  return VALID_THEMES.includes(theme as Theme);
};

/**
 * 获取主题的显示标签
 */
const getLabel = (theme: Theme): string => {
  return THEME_LABELS[theme] || theme;
};

/**
 * 检测系统主题偏好
 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 解析实际应用的主题
 */
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

// ==================== 主题状态Store ====================

/**
 * 主题状态管理Store
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  // 初始状态
  theme: DEFAULT_THEME,

  // 设置主题
  setTheme: (theme: Theme) => {
    // 验证主题格式
    if (!validateTheme(theme)) {
      console.warn('无效的主题:', theme);
      return;
    }

    set({ theme });
    console.log('主题已更新:', theme, `(${getLabel(theme)})`);
  },

  // 切换主题
  toggleTheme: () => {
    const currentTheme = get().theme;
    
    // 如果当前是system主题，先解析为实际主题再切换
    if (currentTheme === 'system') {
      const resolvedTheme = getSystemTheme();
      const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
      set({ theme: newTheme });
      console.log('主题已切换:', newTheme, `(${getLabel(newTheme)})`);
    } else {
      // 在light和dark之间切换
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      set({ theme: newTheme });
      console.log('主题已切换:', newTheme, `(${getLabel(newTheme)})`);
    }
  },

  // 重置为默认主题
  resetTheme: () => {
    set({ theme: DEFAULT_THEME });
    console.log('主题已重置为默认值:', DEFAULT_THEME);
  },

  // 验证主题格式
  isValidTheme: (theme: string) => {
    return validateTheme(theme);
  },

  // 获取主题显示名称
  getThemeLabel: (theme?: Theme) => {
    const currentTheme = theme || get().theme;
    return getLabel(currentTheme);
  },

  // 获取实际应用的主题
  getResolvedTheme: () => {
    const currentTheme = get().theme;
    return resolveTheme(currentTheme);
  },
}));

// ==================== 导出常量 ====================

export { VALID_THEMES, THEME_LABELS, DEFAULT_THEME };
