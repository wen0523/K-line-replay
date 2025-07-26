/**
 * 关闭图标组件
 * 提供一个圆形背景的X关闭图标，常用于模态框、弹窗等场景
 * 重构后的版本，增强了类型安全和可定制性
 */

import React from 'react';

// ==================== 类型定义 ====================

/**
 * 关闭图标组件属性
 */
interface CloseIconProps extends React.SVGProps<SVGSVGElement> {
    /** 图标大小 */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** 自定义类名 */
    className?: string;
    /** 图标颜色 */
    color?: string;
    /** 是否显示圆形背景 */
    showBackground?: boolean;
}

// ==================== 常量定义 ====================

/**
 * 图标尺寸映射
 */
const SIZE_CLASSES = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
} as const;

/**
 * 默认属性
 */
const DEFAULT_PROPS = {
    size: 'md' as const,
    showBackground: true,
    color: 'currentColor',
};

// ==================== 主组件 ====================

/**
 * 关闭图标组件
 */
const CloseIcon: React.FC<CloseIconProps> = ({
    size = DEFAULT_PROPS.size,
    className = '',
    color = DEFAULT_PROPS.color,
    showBackground = DEFAULT_PROPS.showBackground,
    ...svgProps
}) => {
    // ==================== 样式计算 ====================

    const sizeClass = SIZE_CLASSES[size];
    const combinedClassName = `${sizeClass} ${className}`.trim();

    // ==================== 渲染 ====================

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={combinedClassName}
            viewBox="0 0 24 24" 
            fill={color}
            role="img"
            aria-label="关闭"
            {...svgProps}
        >
            {showBackground ? (
                // 带圆形背景的关闭图标
                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z" />
            ) : (
                // 简单的X图标
                <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
            )}
        </svg>
    );
};

// ==================== 导出 ====================

export default CloseIcon;

// 导出类型以供其他组件使用
export type { CloseIconProps };