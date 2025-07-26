/**
 * 搜索图标组件
 * 提供放大镜搜索图标，常用于搜索框、搜索按钮等场景
 * 重构后的版本，增强了类型安全和可定制性
 */

import React from 'react';

// ==================== 类型定义 ====================

/**
 * 搜索图标组件属性
 */
interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
    /** 图标大小 */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** 自定义类名 */
    className?: string;
    /** 图标颜色 */
    color?: string;
    /** 是否显示边距 */
    showMargin?: boolean;
}

// ==================== 常量定义 ====================

/**
 * 图标尺寸映射
 */
const SIZE_CLASSES = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
} as const;

/**
 * 边距样式类
 */
const MARGIN_CLASSES = 'mr-2 ml-2';

/**
 * 默认属性
 */
const DEFAULT_PROPS = {
    size: 'md' as const,
    color: 'currentColor',
    showMargin: true,
};

/**
 * 搜索图标路径
 */
const SEARCH_ICON_PATH = "M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z";

// ==================== 主组件 ====================

/**
 * 搜索图标组件
 */
const SearchIcon: React.FC<SearchIconProps> = ({
    size = DEFAULT_PROPS.size,
    className = '',
    color = DEFAULT_PROPS.color,
    showMargin = DEFAULT_PROPS.showMargin,
    ...svgProps
}) => {
    // ==================== 样式计算 ====================

    const sizeClass = SIZE_CLASSES[size];
    const marginClass = showMargin ? MARGIN_CLASSES : '';
    const combinedClassName = `${sizeClass} ${marginClass} ${className}`.trim();

    // ==================== 渲染 ====================

    return (
        <svg 
            className={combinedClassName}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={color}
            role="img"
            aria-label="搜索"
            {...svgProps}
        >
            <path d={SEARCH_ICON_PATH} />
        </svg>
    );
};

// ==================== 导出 ====================

export default SearchIcon;

// 导出类型以供其他组件使用
export type { SearchIconProps };