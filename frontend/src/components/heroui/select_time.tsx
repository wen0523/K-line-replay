/**
 * 时间周期选择组件
 * 提供K线图时间周期选择功能，支持多种时间间隔
 * 重构后的版本，增强了类型安全和用户体验
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';

// UI组件
import { 
    Dropdown, 
    DropdownTrigger, 
    DropdownMenu, 
    DropdownItem, 
    Button 
} from "@heroui/react";

// 状态管理
import { useTimeStore, TimeFrame, VALID_TIME_FRAMES } from "@/store/timeStore";

// ==================== 类型定义 ====================

interface TimeSelectProps {
    /** 自定义样式类名 */
    className?: string;
    /** 按钮大小 */
    size?: 'sm' | 'md' | 'lg';
    /** 是否禁用组件 */
    disabled?: boolean;
    /** 时间周期变化回调 */
    onTimeChange?: (timeFrame: TimeFrame) => void;
    /** 自定义可选时间周期 */
    availableTimeFrames?: TimeFrame[];
}

interface TimeFrameOption {
    key: TimeFrame;
    label: string;
    description: string;
    minutes: number;
}

// ==================== 常量定义 ====================

/**
 * 时间周期选项配置
 */
const TIME_FRAME_OPTIONS: TimeFrameOption[] = [
    {
        key: '1M',
        label: '1M',
        description: '月线',
        minutes: 43200
    },
    {
        key: '1w',
        label: '1W',
        description: '周线',
        minutes: 10080
    },
    {
        key: '1d',
        label: '1D',
        description: '日线',
        minutes: 1440
    },
    {
        key: '4h',
        label: '4H',
        description: '4小时线',
        minutes: 240
    },
    {
        key: '1h',
        label: '1H',
        description: '小时线',
        minutes: 60
    },
    {
        key: '30m',
        label: '30m',
        description: '30分钟线',
        minutes: 30
    },
    {
        key: '15m',
        label: '15m',
        description: '15分钟线',
        minutes: 15
    },
    {
        key: '5m',
        label: '5m',
        description: '5分钟线',
        minutes: 5
    },
    {
        key: '1m',
        label: '1m',
        description: '分钟线',
        minutes: 1
    }
];

// ==================== 工具函数 ====================

/**
 * 格式化时间周期显示文本
 */
const formatTimeFrameLabel = (timeFrame: TimeFrame): string => {
    const option = TIME_FRAME_OPTIONS.find(opt => opt.key === timeFrame);
    return option?.label || timeFrame.toUpperCase();
};

/**
 * 获取时间周期描述
 */
const getTimeFrameDescription = (timeFrame: TimeFrame): string => {
    const option = TIME_FRAME_OPTIONS.find(opt => opt.key === timeFrame);
    return option?.description || '未知周期';
};

/**
 * 验证时间周期是否有效
 */
const isValidTimeFrame = (timeFrame: string): timeFrame is TimeFrame => {
    return VALID_TIME_FRAMES.includes(timeFrame as TimeFrame);
};

// ==================== 主组件 ====================

/**
 * 时间周期选择组件
 */
const TimeSelect: React.FC<TimeSelectProps> = ({
    className = '',
    size = 'sm',
    disabled = false,
    onTimeChange,
    availableTimeFrames = VALID_TIME_FRAMES
}) => {
    // ==================== 状态管理 ====================

    const { time: currentTime, setTime } = useTimeStore();
    const [displayLabel, setDisplayLabel] = useState<string>('1D');
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // ==================== 计算属性 ====================

    /**
     * 过滤后的时间周期选项
     */
    const filteredOptions = useMemo(() => {
        return TIME_FRAME_OPTIONS.filter(option => 
            availableTimeFrames.includes(option.key)
        );
    }, [availableTimeFrames]);

    /**
     * 当前选中的时间周期选项
     */
    const currentOption = useMemo(() => {
        return TIME_FRAME_OPTIONS.find(option => option.key === currentTime);
    }, [currentTime]);

    /**
     * 按钮样式类
     */
    const buttonClasses = useMemo(() => {
        return [
            'text-md',
            'min-w-[60px]',
            'font-medium',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            className
        ].filter(Boolean).join(' ');
    }, [disabled, className]);

    // ==================== 事件处理 ====================

    /**
     * 处理时间周期选择
     */
    const handleTimeFrameSelect = useCallback((selectedKey: React.Key) => {
        const selectedTimeFrame = selectedKey.toString();
        
        // 验证选择的时间周期
        if (!isValidTimeFrame(selectedTimeFrame)) {
            console.error('无效的时间周期:', selectedTimeFrame);
            return;
        }

        // 如果选择的时间周期与当前相同，则不进行任何操作
        if (selectedTimeFrame === currentTime) {
            console.log('选择的时间周期与当前相同，无需更新');
            return;
        }

        try {
            // 更新状态
            setTime(selectedTimeFrame);
            
            // 更新显示标签
            const newLabel = formatTimeFrameLabel(selectedTimeFrame);
            setDisplayLabel(newLabel);
            
            // 触发回调
            onTimeChange?.(selectedTimeFrame);
            
            // 关闭下拉菜单
            setIsOpen(false);
            
            console.log('时间周期已更新:', {
                from: currentTime,
                to: selectedTimeFrame,
                label: newLabel
            });
        } catch (error) {
            console.error('更新时间周期失败:', error);
        }
    }, [currentTime, setTime, onTimeChange]);

    /**
     * 处理下拉菜单开关状态
     */
    const handleOpenChange = useCallback((open: boolean) => {
        if (!disabled) {
            setIsOpen(open);
        }
    }, [disabled]);

    // ==================== 生命周期 ====================

    /**
     * 初始化显示标签
     */
    useEffect(() => {
        const initialLabel = formatTimeFrameLabel(currentTime);
        setDisplayLabel(initialLabel);
    }, [currentTime]);

    /**
     * 监听时间周期变化，同步显示标签
     */
    useEffect(() => {
        const newLabel = formatTimeFrameLabel(currentTime);
        if (newLabel !== displayLabel) {
            setDisplayLabel(newLabel);
        }
    }, [currentTime, displayLabel]);

    // ==================== 渲染 ====================

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            placement="bottom-start"
            classNames={{
                content: "min-w-[120px]"
            }}
        >
            <DropdownTrigger>
                <Button
                    className={buttonClasses}
                    size={size}
                    disabled={disabled}
                    variant="flat"
                    aria-label={`当前时间周期: ${getTimeFrameDescription(currentTime)}`}
                    title={getTimeFrameDescription(currentTime)}
                >
                    {displayLabel}
                    {/* 下拉箭头指示器 */}
                    <svg
                        className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                aria-label="选择时间周期"
                selectedKeys={new Set([currentTime])}
                selectionMode="single"
                onAction={handleTimeFrameSelect}
                classNames={{
                    list: "gap-1"
                }}
            >
                {filteredOptions.map((option) => (
                    <DropdownItem
                        key={option.key}
                        className={`
                            rounded-md transition-colors
                            ${currentTime === option.key 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }
                        `}
                        textValue={option.label}
                        description={option.description}
                        startContent={
                            currentTime === option.key && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )
                        }
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {option.description}
                            </span>
                        </div>
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
};

// ==================== 导出 ====================

export default TimeSelect;

// 导出类型（供其他组件使用）
export type { TimeSelectProps };