/**
 * 播放控制图标组件
 * 提供开始和停止播放的图标，常用于媒体播放器、回放控制等场景
 * 重构后的版本，增强了类型安全和可定制性
 */

import React from 'react';

// ==================== 类型定义 ====================

/**
 * 播放控制图标组件属性
 */
interface PlayControlIconProps extends React.SVGProps<SVGSVGElement> {
    /** 图标大小 */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** 自定义类名 */
    className?: string;
    /** 图标颜色 */
    color?: string;
}

// ==================== 常量定义 ====================

/**
 * 图标尺寸映射
 */
const SIZE_CLASSES = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-10',
} as const;

/**
 * 默认属性
 */
const DEFAULT_PROPS = {
    size: 'md' as const,
    color: 'currentColor',
};

/**
 * 停止图标路径
 * 圆形背景中的方形停止按钮
 */
const STOP_ICON_PATH = "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM9 9H15V15H9V9Z";

/**
 * 开始图标路径
 * 圆形背景中的三角形播放按钮
 */
const START_ICON_PATH = "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM10.6219 8.41459L15.5008 11.6672C15.6846 11.7897 15.7343 12.0381 15.6117 12.2219C15.5824 12.2658 15.5447 12.3035 15.5008 12.3328L10.6219 15.5854C10.4381 15.708 10.1897 15.6583 10.0672 15.4745C10.0234 15.4088 10 15.3316 10 15.2526V8.74741C10 8.52649 10.1791 8.34741 10.4 8.34741C10.479 8.34741 10.5562 8.37078 10.6219 8.41459Z";

// ==================== 停止图标组件 ====================

/**
 * 停止图标组件
 */
const StopIcon: React.FC<PlayControlIconProps> = ({
    size = DEFAULT_PROPS.size,
    className = '',
    color = DEFAULT_PROPS.color,
    ...svgProps
}) => {
    // ==================== 样式计算 ====================

    const sizeClass = SIZE_CLASSES[size];
    const combinedClassName = `${sizeClass} ${className}`.trim();

    // ==================== 渲染 ====================

    return (
        <svg
            className={combinedClassName}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            fill={color}
            role="img"
            aria-label="停止播放"
            {...svgProps}
        >
            <path d={STOP_ICON_PATH} />
        </svg>
    );
};

// ==================== 开始图标组件 ====================

/**
 * 开始图标组件
 */
const StartIcon: React.FC<PlayControlIconProps> = ({
    size = DEFAULT_PROPS.size,
    className = '',
    color = DEFAULT_PROPS.color,
    ...svgProps
}) => {
    // ==================== 样式计算 ====================

    const sizeClass = SIZE_CLASSES[size];
    const combinedClassName = `${sizeClass} ${className}`.trim();

    // ==================== 渲染 ====================

    return (
        <svg
            className={combinedClassName}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            fill={color}
            role="img"
            aria-label="开始播放"
            {...svgProps}
        >
            <path d={START_ICON_PATH} />
        </svg>
    );
};

// ==================== 导出 ====================

export { StopIcon, StartIcon };

// 导出类型以供其他组件使用
export type { PlayControlIconProps };