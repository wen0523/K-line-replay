/**
 * 速度图标组件
 * 提供快进/播放速度控制图标，常用于媒体播放器、回放控制等场景
 * 重构后的版本，增强了类型安全和可定制性
 */

import React from 'react';

// ==================== 类型定义 ====================

/**
 * 速度图标组件属性
 */
interface SpeedIconProps extends React.SVGProps<SVGSVGElement> {
    /** 图标大小 */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** 自定义类名 */
    className?: string;
    /** 图标颜色 */
    color?: string;
    /** 速度倍数（用于aria-label） */
    speedMultiplier?: number;
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
    speedMultiplier: 1,
};

/**
 * 速度图标路径
 * 双箭头快进图标，表示加速播放
 */
const SPEED_ICON_PATH = "M12 13.3334L2.77735 19.4818C2.54759 19.635 2.23715 19.5729 2.08397 19.3432C2.02922 19.261 2 19.1645 2 19.0658V4.93433C2 4.65818 2.22386 4.43433 2.5 4.43433C2.59871 4.43433 2.69522 4.46355 2.77735 4.5183L12 10.6667V4.93433C12 4.65818 12.2239 4.43433 12.5 4.43433C12.5987 4.43433 12.6952 4.46355 12.7774 4.5183L23.376 11.584C23.6057 11.7372 23.6678 12.0477 23.5146 12.2774C23.478 12.3323 23.4309 12.3795 23.376 12.4161L12.7774 19.4818C12.5476 19.635 12.2372 19.5729 12.084 19.3432C12.0292 19.261 12 19.1645 12 19.0658V13.3334ZM10.3944 12.0001L4 7.7371V16.263L10.3944 12.0001ZM14 7.7371V16.263L20.3944 12.0001L14 7.7371Z";

// ==================== 主组件 ====================

/**
 * 速度图标组件
 */
const SpeedIcon: React.FC<SpeedIconProps> = ({
    size = DEFAULT_PROPS.size,
    className = '',
    color = DEFAULT_PROPS.color,
    speedMultiplier = DEFAULT_PROPS.speedMultiplier,
    ...svgProps
}) => {
    // ==================== 样式计算 ====================

    const sizeClass = SIZE_CLASSES[size];
    const combinedClassName = `${sizeClass} text-gray-600 ${className}`.trim();

    // ==================== 辅助功能 ====================

    const ariaLabel = speedMultiplier > 1 
        ? `${speedMultiplier}倍速播放` 
        : '快进播放';

    // ==================== 渲染 ====================

    return (
        <svg
            className={combinedClassName}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            fill={color}
            role="img"
            aria-label={ariaLabel}
            {...svgProps}
        >
            <path d={SPEED_ICON_PATH} />
        </svg>
    );
};

// ==================== 导出 ====================

export default SpeedIcon;

// 导出类型以供其他组件使用
export type { SpeedIconProps };