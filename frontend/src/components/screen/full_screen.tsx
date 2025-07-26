/**
 * 全屏控制组件
 * 提供进入和退出全屏模式的功能，支持多种浏览器兼容性
 * 重构后的版本，增强了错误处理和用户体验
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

// 图标组件
import FullScreenIcon from '../svg/fullscreen';

// ==================== 类型定义 ====================

interface FullScreenComponentProps {
    /** 目标容器ID，默认为'container' */
    containerId?: string;
    /** 自定义样式类名 */
    className?: string;
    /** 按钮大小 */
    size?: 'sm' | 'md' | 'lg';
    /** 是否显示提示文本 */
    showTooltip?: boolean;
    /** 全屏状态变化回调 */
    onFullscreenChange?: (isFullscreen: boolean) => void;
}

// 扩展Document类型以支持各种浏览器的全屏API
interface ExtendedDocument extends Document {
    mozCancelFullScreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    webkitFullscreenElement?: Element;
    msFullscreenElement?: Element;
}

// 扩展HTMLElement类型以支持各种浏览器的全屏API
interface ExtendedHTMLElement extends HTMLElement {
    mozRequestFullScreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
}

// ==================== 工具函数 ====================

/**
 * 检查当前是否处于全屏状态
 */
const isFullscreenActive = (): boolean => {
    const doc = document as ExtendedDocument;
    return !!(
        doc.fullscreenElement ||
        doc.mozFullScreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement
    );
};

/**
 * 进入全屏模式
 */
const enterFullscreen = async (element: HTMLElement): Promise<void> => {
    const extElement = element as ExtendedHTMLElement;
    
    try {
        if (element.requestFullscreen) {
            await element.requestFullscreen();
        } else if (extElement.mozRequestFullScreen) {
            await extElement.mozRequestFullScreen();
        } else if (extElement.webkitRequestFullscreen) {
            await extElement.webkitRequestFullscreen();
        } else if (extElement.msRequestFullscreen) {
            await extElement.msRequestFullscreen();
        } else {
            throw new Error('当前浏览器不支持全屏API');
        }
        console.log('已进入全屏模式');
    } catch (error) {
        console.error('进入全屏模式失败:', error);
        throw error;
    }
};

/**
 * 退出全屏模式
 */
const exitFullscreen = async (): Promise<void> => {
    const doc = document as ExtendedDocument;
    
    try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            await doc.mozCancelFullScreen();
        } else if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
            await doc.msExitFullscreen();
        } else {
            throw new Error('当前浏览器不支持退出全屏API');
        }
        console.log('已退出全屏模式');
    } catch (error) {
        console.error('退出全屏模式失败:', error);
        throw error;
    }
};

// ==================== 主组件 ====================

/**
 * 全屏控制组件
 */
const FullScreenComponent: React.FC<FullScreenComponentProps> = ({
    containerId = 'container',
    className = '',
    size = 'md',
    showTooltip = true,
    onFullscreenChange
}) => {
    // ==================== 状态管理 ====================

    const [container, setContainer] = useState<HTMLElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 组件引用
    const buttonRef = useRef<HTMLButtonElement>(null);

    // ==================== 计算属性 ====================

    /**
     * 按钮样式类
     */
    const buttonClasses = React.useMemo(() => {
        const sizeClasses = {
            sm: 'size-6',
            md: 'size-8',
            lg: 'size-10'
        };

        return [
            sizeClasses[size],
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'rounded-[6px]',
            'flex items-center justify-center',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            className
        ].join(' ');
    }, [size, isLoading, className]);

    /**
     * 提示文本
     */
    const tooltipText = React.useMemo(() => {
        if (!showTooltip) return '';
        return isFullscreen ? '退出全屏 (ESC)' : '进入全屏 (F11)';
    }, [showTooltip, isFullscreen]);

    // ==================== 事件处理 ====================

    /**
     * 处理全屏切换
     */
    const handleToggleFullscreen = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            if (isFullscreen) {
                // 退出全屏
                await exitFullscreen();
            } else {
                // 进入全屏
                if (!container) {
                    throw new Error(`找不到ID为"${containerId}"的容器元素`);
                }
                await enterFullscreen(container);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '全屏操作失败';
            setError(errorMessage);
            console.error('全屏操作失败:', error);
            
            // 显示用户友好的错误提示
            if (typeof window !== 'undefined' && window.alert) {
                window.alert(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isFullscreen, container, containerId, isLoading]);

    /**
     * 处理全屏状态变化
     */
    const handleFullscreenChange = useCallback(() => {
        const newIsFullscreen = isFullscreenActive();
        setIsFullscreen(newIsFullscreen);
        onFullscreenChange?.(newIsFullscreen);
        
        // 清除错误状态
        if (error) {
            setError(null);
        }
        
        console.log('全屏状态变化:', newIsFullscreen ? '已进入全屏' : '已退出全屏');
    }, [onFullscreenChange, error]);

    /**
     * 处理键盘事件
     */
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // F11键切换全屏
        if (event.key === 'F11') {
            event.preventDefault();
            handleToggleFullscreen();
        }
        // ESC键退出全屏
        else if (event.key === 'Escape' && isFullscreen) {
            // ESC键通常会自动退出全屏，这里只是确保状态同步
            setIsFullscreen(false);
        }
    }, [handleToggleFullscreen, isFullscreen]);

    // ==================== 生命周期 ====================

    /**
     * 组件挂载时初始化容器和事件监听
     */
    useEffect(() => {
        // 查找目标容器
        const targetContainer = document.getElementById(containerId);
        setContainer(targetContainer);

        if (!targetContainer) {
            console.warn(`未找到ID为"${containerId}"的容器元素`);
        }

        // 初始化全屏状态
        setIsFullscreen(isFullscreenActive());
    }, [containerId]);

    /**
     * 添加全屏状态变化监听器
     */
    useEffect(() => {
        const events = [
            'fullscreenchange',
            'mozfullscreenchange',
            'webkitfullscreenchange',
            'msfullscreenchange'
        ];

        // 添加事件监听器
        events.forEach(event => {
            document.addEventListener(event, handleFullscreenChange);
        });

        // 添加键盘事件监听器
        document.addEventListener('keydown', handleKeyDown);

        // 清理函数
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleFullscreenChange);
            });
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleFullscreenChange, handleKeyDown]);

    // ==================== 渲染 ====================

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className={buttonClasses}
                onClick={handleToggleFullscreen}
                disabled={isLoading || !container}
                title={tooltipText}
                aria-label={tooltipText}
                aria-pressed={isFullscreen}
            >
                {isLoading ? (
                    // 加载状态指示器
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
                ) : (
                    <FullScreenIcon className={isFullscreen ? 'text-blue-600' : ''} />
                )}
            </button>

            {/* 错误提示 */}
            {error && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded shadow-lg z-50 whitespace-nowrap">
                    {error}
                </div>
            )}

            {/* 状态指示器 */}
            {isFullscreen && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
        </div>
    );
};

// ==================== 导出 ====================

export default FullScreenComponent;

// 导出类型（供其他组件使用）
export type { FullScreenComponentProps };
