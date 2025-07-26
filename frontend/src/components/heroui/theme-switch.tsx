/**
 * 主题切换组件
 * 提供明暗主题切换功能，支持系统主题检测和本地存储
 * 重构后的版本，增强了类型安全和用户体验
 */

import React, { useCallback, useEffect, useMemo } from 'react';

// UI组件
import { Switch } from '@heroui/react';

// 状态管理
import { useThemeStore, Theme } from '@/store/themeStore';

// 类型定义
import { CHART_THEMES } from '@/constants';

// ==================== 类型定义 ====================

interface ThemeSwitchProps {
    /** 自定义样式类名 */
    className?: string;
    /** 组件大小 */
    size?: 'sm' | 'md' | 'lg';
    /** 是否显示标签文本 */
    showLabel?: boolean;
    /** 自定义标签文本 */
    labelText?: string;
    /** 是否禁用组件 */
    disabled?: boolean;
    /** 主题变更回调函数 */
    onThemeChange?: (theme: Theme) => void;
}

// ==================== 图标组件 ====================

/**
 * 月亮图标组件（暗色主题）
 */
const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
                fill="currentColor"
            />
        </svg>
    );
};

/**
 * 太阳图标组件（明亮主题）
 */
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <g fill="currentColor">
                <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
                <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
            </g>
        </svg>
    );
};

// ==================== 工具函数 ====================

/**
 * 检测系统是否偏好暗色主题
 */
const detectSystemTheme = (): Theme => {
    if (typeof window === 'undefined') {
        return CHART_THEMES.DEFAULT;
    }

    try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? CHART_THEMES.DARK : CHART_THEMES.LIGHT;
    } catch (error) {
        console.warn('无法检测系统主题偏好:', error);
        return CHART_THEMES.DEFAULT;
    }
};

/**
 * 应用主题到DOM
 */
const applyThemeToDOM = (theme: Theme): void => {
    if (typeof document === 'undefined') return;

    try {
        const root = document.documentElement;
        
        // 移除所有主题类
        root.classList.remove('light', 'dark');
        
        // 添加新主题类
        if (theme === CHART_THEMES.DARK) {
            root.classList.add('dark');
        } else if (theme === CHART_THEMES.LIGHT) {
            root.classList.add('light');
        }
        
        // 设置CSS变量（如果需要）
        root.style.setProperty('--current-theme', theme);
        
        console.log('主题已应用到DOM:', theme);
    } catch (error) {
        console.error('应用主题到DOM时出错:', error);
    }
};

// ==================== 主组件 ====================

/**
 * 主题切换开关组件
 */
const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
    className = '',
    size = 'md',
    showLabel = false,
    labelText,
    disabled = false,
    onThemeChange
}) => {
    // ==================== 状态管理 ====================

    const { theme, setTheme } = useThemeStore();

    // ==================== 计算属性 ====================

    /**
     * 当前是否为暗色主题
     */
    const isDarkTheme = useMemo(() => {
        return theme === CHART_THEMES.DARK;
    }, [theme]);

    /**
     * 显示的标签文本
     */
    const displayLabel = useMemo(() => {
        if (labelText) return labelText;
        if (!showLabel) return '';
        return isDarkTheme ? '暗色主题' : '明亮主题';
    }, [labelText, showLabel, isDarkTheme]);

    /**
     * 主题切换的提示文本
     */
    const tooltipText = useMemo(() => {
        return isDarkTheme ? '切换到明亮主题' : '切换到暗色主题';
    }, [isDarkTheme]);

    /**
     * 开关的颜色配置
     */
    const switchColor = useMemo(() => {
        return isDarkTheme ? 'primary' : 'warning';
    }, [isDarkTheme]);

    // ==================== 事件处理 ====================

    /**
     * 处理主题切换
     */
    const handleThemeToggle = useCallback((isSelected: boolean) => {
        if (disabled) return;

        const newTheme = isSelected ? CHART_THEMES.DARK : CHART_THEMES.LIGHT;
        
        try {
            // 更新状态
            setTheme(newTheme);
            
            // 应用到DOM
            applyThemeToDOM(newTheme);
            
            // 触发回调
            onThemeChange?.(newTheme);
            
            // 保存到本地存储
            localStorage.setItem('preferred-theme', newTheme);
            
            console.log('主题已切换:', newTheme);
        } catch (error) {
            console.error('切换主题时出错:', error);
        }
    }, [disabled, setTheme, onThemeChange]);

    /**
     * 初始化主题
     */
    const initializeTheme = useCallback(() => {
        try {
            // 优先使用本地存储的主题
            const savedTheme = localStorage.getItem('preferred-theme') as Theme;
            
            let initialTheme: Theme;
            
            if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
                initialTheme = savedTheme;
                console.log('使用本地存储的主题:', savedTheme);
            } else {
                // 回退到系统主题
                initialTheme = detectSystemTheme();
                console.log('使用系统检测的主题:', initialTheme);
            }
            
            // 如果当前主题与初始主题不同，则更新
            if (theme !== initialTheme) {
                setTheme(initialTheme);
                applyThemeToDOM(initialTheme);
            }
        } catch (error) {
            console.error('初始化主题时出错:', error);
            // 使用默认主题作为回退
            setTheme(CHART_THEMES.DEFAULT);
            applyThemeToDOM(CHART_THEMES.DEFAULT);
        }
    }, [theme, setTheme]);

    // ==================== 生命周期 ====================

    /**
     * 组件挂载时初始化主题
     */
    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

    /**
     * 监听系统主题变化
     */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            // 只有在没有用户偏好设置时才跟随系统主题
            const savedTheme = localStorage.getItem('preferred-theme');
            if (!savedTheme) {
                const systemTheme = e.matches ? CHART_THEMES.DARK : CHART_THEMES.LIGHT;
                setTheme(systemTheme);
                applyThemeToDOM(systemTheme);
                console.log('跟随系统主题变化:', systemTheme);
            }
        };

        // 添加监听器
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        // 清理函数
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [setTheme]);

    /**
     * 主题变化时应用到DOM
     */
    useEffect(() => {
        applyThemeToDOM(theme);
    }, [theme]);

    // ==================== 渲染 ====================

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* 标签文本（左侧） */}
            {showLabel && displayLabel && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {displayLabel}
                </span>
            )}

            {/* 主题切换开关 */}
            <Switch
                isSelected={isDarkTheme}
                onValueChange={handleThemeToggle}
                size={size}
                color={switchColor}
                disabled={disabled}
                aria-label={tooltipText}
                title={tooltipText}
                classNames={{
                    base: "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center justify-between cursor-pointer rounded-lg gap-2 p-2 border-2 border-transparent data-[selected=true]:border-primary transition-colors",
                    wrapper: "p-0 h-4 overflow-visible",
                    thumb: "w-6 h-6 border-2 shadow-lg transition-transform data-[hover=true]:shadow-md data-[selected=true]:ml-6 rtl:data-[selected=true]:ml-0 rtl:data-[selected=true]:mr-6"
                }}
                startContent={
                    <SunIcon 
                        className={`w-4 h-4 transition-colors ${
                            isDarkTheme ? 'text-gray-400' : 'text-yellow-500'
                        }`} 
                    />
                }
                endContent={
                    <MoonIcon 
                        className={`w-4 h-4 transition-colors ${
                            isDarkTheme ? 'text-blue-400' : 'text-gray-400'
                        }`} 
                    />
                }
            >
                {/* 开关内部文本（如果需要） */}
                {showLabel && !displayLabel && (
                    <span className="text-small">
                        {isDarkTheme ? '暗色' : '明亮'}
                    </span>
                )}
            </Switch>

            {/* 状态指示器（可选） */}
            <div 
                className={`w-2 h-2 rounded-full transition-colors ${
                    isDarkTheme ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
                title={`当前主题: ${theme}`}
                aria-hidden="true"
            />
        </div>
    );
};

// ==================== 导出 ====================

export default ThemeSwitch;

// 导出类型（供其他组件使用）
export type { ThemeSwitchProps };
