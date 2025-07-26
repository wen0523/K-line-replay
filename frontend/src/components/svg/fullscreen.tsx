/**
 * 全屏图标组件
 * 提供全屏模式切换的图标，支持进入和退出全屏状态的视觉表示
 * 重构后的版本，增强了类型安全和可定制性
 */

import React from 'react';

// ==================== 类型定义 ====================

/**
 * 全屏图标组件属性
 */
interface FullScreenIconProps extends React.SVGProps<SVGSVGElement> {
    /** 图标大小 */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** 自定义类名 */
    className?: string;
    /** 图标颜色 */
    color?: string;
    /** 是否为退出全屏状态 */
    isExitMode?: boolean;
}

// ==================== 常量定义 ====================

/**
 * 图标尺寸映射
 */
const SIZE_CLASSES = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
    xl: 'size-8',
} as const;

/**
 * 默认属性
 */
const DEFAULT_PROPS = {
    size: 'md' as const,
    color: 'currentColor',
    isExitMode: false,
};

// ==================== 图标路径 ====================

/**
 * 进入全屏模式图标路径
 */
const ENTER_FULLSCREEN_PATH = "M8 3V5H4V9H2V3H8ZM2 21V15H4V19H8V21H2ZM22 21H16V19H20V15H22V21ZM22 9H20V5H16V3H22V9Z";

/**
 * 退出全屏模式图标路径
 */
const EXIT_FULLSCREEN_PATH = "M18 7H22V9H20V11H18V7ZM8 7V11H6V9H4V7H8ZM18 17V21H16V19H14V17H18ZM8 17H12V19H10V21H8V17Z";

// ==================== 主组件 ====================

/**
 * 全屏图标组件
 */
const FullScreenIcon: React.FC<FullScreenIconProps> = ({
    size = DEFAULT_PROPS.size,
    className = '',
    color = DEFAULT_PROPS.color,
    isExitMode = DEFAULT_PROPS.isExitMode,
    ...svgProps
}) => {
    // ==================== 样式计算 ====================

    const sizeClass = SIZE_CLASSES[size];
    const combinedClassName = `${sizeClass} ${className}`.trim();

    // ==================== 图标路径选择 ====================

    const iconPath = isExitMode ? EXIT_FULLSCREEN_PATH : ENTER_FULLSCREEN_PATH;
    const ariaLabel = isExitMode ? '退出全屏' : '进入全屏';

    // ==================== 渲染 ====================

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg"
            className={combinedClassName}
            viewBox="0 0 24 24" 
            fill={color}
            role="img"
            aria-label={ariaLabel}
            {...svgProps}
        >
            <path d={iconPath} />
        </svg>
    );
};

// ==================== 导出 ====================

export default FullScreenIcon;

// 导出类型以供其他组件使用
export type { FullScreenIconProps };