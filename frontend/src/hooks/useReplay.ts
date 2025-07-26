/**
 * K线数据回放自定义Hook
 * 提供K线数据回放功能，包括播放控制、速度调节、进度管理等
 * 重构后的版本，增强了类型安全和代码可读性
 */

import { useCallback, useEffect, useState, useRef } from 'react';

// 类型定义
import { KLineData, ReplayConfig, TimeFrame } from '@/types';

// 工具函数
import { updateData, updateTime, DataUpdateResult } from '@/lib/utils';

// 状态管理
import { 
    usePriceStore, 
    useReplayStore, 
    usePriceUpStore, 
    usePriceChangeStore 
} from '@/store/priceStore';

// 常量
import { REPLAY_SPEEDS } from '@/constants';

// ==================== 类型定义 ====================

interface UseReplayOptions {
    /** 时间周期 */
    timeFrame?: TimeFrame;
    /** 自动开始回放 */
    autoStart?: boolean;
    /** 循环播放 */
    loop?: boolean;
    /** 回放完成回调 */
    onComplete?: () => void;
    /** 数据更新回调 */
    onDataUpdate?: (data: KLineData[], currentIndex: number) => void;
}

interface UseReplayReturn {
    /** 回放配置 */
    config: ReplayConfig;
    /** 处理后的数据 */
    processedData: KLineData[];
    /** 切换播放/暂停 */
    toggleReplay: () => void;
    /** 设置回放速度 */
    setSpeed: (speed: number) => void;
    /** 重置回放 */
    resetReplay: () => void;
    /** 跳转到指定位置 */
    seekTo: (index: number) => void;
    /** 回放进度百分比 */
    progress: number;
    /** 是否回放完成 */
    isComplete: boolean;
    /** 是否正在播放 */
    isPlaying: boolean;
    /** 当前数据索引 */
    currentIndex: number;
    /** 总数据长度 */
    totalLength: number;
}

// ==================== 工具函数 ====================

/**
 * 验证回放速度是否有效
 */
const isValidSpeed = (speed: number): boolean => {
    return (REPLAY_SPEEDS as readonly number[]).includes(speed);
};

/**
 * 将TimeFrame转换为TimeFormatOption
 */
const timeFrameToFormatOption = (timeFrame: TimeFrame | string): 'h' | 'd' | 'w' | 'm' => {
    switch (timeFrame) {
        case '1m':
        case '5m':
        case '15m':
        case '30m':
        case '1h':
            return 'h';
        case '4h':
        case '1d':
            return 'd';
        case '1w':
            return 'w';
        case '1M':
            return 'm';
        default:
            return 'h';
    }
};

/**
 * 计算回放间隔时间（毫秒）
 */
const calculateInterval = (speed: number): number => {
    return Math.max(50, 1000 / speed); // 最小间隔50ms
};

/**
 * 安全地获取K线数据的收盘价
 */
const getClosePrice = (data: KLineData): number => {
    return typeof data[4] === 'number' ? data[4] : 0;
};

// ==================== 主Hook ====================

/**
 * K线数据回放Hook
 */
export const useReplay = (
    data: KLineData[], 
    options: UseReplayOptions = {}
): UseReplayReturn => {
    const {
        timeFrame = '1m',
        autoStart = false,
        loop = false,
        onComplete,
        onDataUpdate
    } = options;

    // ==================== 状态管理 ====================

    // 回放配置状态
    const [config, setConfig] = useState<ReplayConfig>({
        speed: 1,
        isPlaying: false,
        currentIndex: 0,
    });

    // 处理后的数据状态
    const [processedData, setProcessedData] = useState<KLineData[]>([]);

    // 定时器引用
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // 全局状态
    const { setPrice } = usePriceStore();
    const { replay, setReplay } = useReplayStore();
    const { setPriceUp } = usePriceUpStore();
    const { setPriceChange } = usePriceChangeStore();

    // ==================== 计算属性 ====================

    const progress = data.length > 0 ? (config.currentIndex / data.length) * 100 : 0;
    const isComplete = config.currentIndex >= data.length;
    const totalLength = data.length;

    // ==================== 核心功能函数 ====================

    /**
     * 清理定时器
     */
    const clearReplayInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    /**
     * 更新价格相关状态
     */
    const updatePriceStates = useCallback((
        currentData: KLineData, 
        previousData?: KLineData
    ) => {
        try {
            const currentPrice = getClosePrice(currentData);
            const previousPrice = previousData ? getClosePrice(previousData) : currentPrice;
            const priceChange = currentPrice - previousPrice;
            
            // 更新全局价格状态
            setPrice(currentPrice);
            setPriceChange(priceChange);
            setPriceUp(priceChange >= 0);

            console.log('价格状态已更新:', {
                currentPrice,
                previousPrice,
                priceChange,
                isUp: priceChange >= 0
            });
        } catch (error) {
            console.error('更新价格状态失败:', error);
        }
    }, [setPrice, setPriceChange, setPriceUp]);

    /**
     * 处理单步数据更新
     */
    const processDataStep = useCallback((index: number) => {
        if (index >= data.length) {
            return false; // 表示已到达末尾
        }

        try {
            const currentData = data[index];
            const previousData = index > 0 ? data[index - 1] : undefined;
            
            // 更新时间戳
            const updatedData = updateTime([...currentData], timeFrameToFormatOption(timeFrame));
            
            // 更新价格状态
            updatePriceStates(updatedData, previousData);

            // 更新处理后的数据
            setProcessedData(prev => {
                const newData = [...prev];
                
                if (newData.length > 0) {
                    // 合并到最后一条数据
                    const lastData = newData[newData.length - 1];
                    const mergedResult = updateData([...lastData], updatedData);
                    newData[newData.length - 1] = mergedResult.data;
                } else {
                    // 添加第一条数据
                    newData.push(updatedData);
                }
                
                return newData;
            });

            // 触发数据更新回调
            onDataUpdate?.(processedData, index);

            return true; // 表示成功处理
        } catch (error) {
            console.error('处理数据步骤失败:', error);
            return false;
        }
    }, [data, timeFrame, updatePriceStates, onDataUpdate, processedData]);

    // ==================== 控制函数 ====================

    /**
     * 开始/暂停回放
     */
    const toggleReplay = useCallback(() => {
        setConfig(prev => {
            const newIsPlaying = !prev.isPlaying;
            
            // 同步全局回放状态
            setReplay(newIsPlaying);
            
            console.log('回放状态切换:', {
                from: prev.isPlaying,
                to: newIsPlaying,
                currentIndex: prev.currentIndex
            });
            
            return { ...prev, isPlaying: newIsPlaying };
        });
    }, [setReplay]);

    /**
     * 设置回放速度
     */
    const setSpeed = useCallback((speed: number) => {
        if (!isValidSpeed(speed)) {
            console.warn('无效的回放速度:', speed);
            return;
        }

        setConfig(prev => {
            console.log('回放速度已更新:', {
                from: prev.speed,
                to: speed
            });
            
            return { ...prev, speed };
        });
    }, []);

    /**
     * 重置回放
     */
    const resetReplay = useCallback(() => {
        // 清理定时器
        clearReplayInterval();
        
        // 重置状态
        setConfig(prev => ({
            ...prev,
            currentIndex: 0,
            isPlaying: false
        }));
        
        // 重置全局状态
        setReplay(false);
        setProcessedData([]);
        
        console.log('回放已重置');
    }, [clearReplayInterval, setReplay]);

    /**
     * 跳转到指定位置
     */
    const seekTo = useCallback((index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
        
        setConfig(prev => {
            console.log('回放位置跳转:', {
                from: prev.currentIndex,
                to: clampedIndex
            });
            
            return { ...prev, currentIndex: clampedIndex };
        });
        
        // 处理跳转位置的数据
        if (clampedIndex < data.length) {
            processDataStep(clampedIndex);
        }
    }, [data.length, processDataStep]);

    // ==================== 生命周期 ====================

    /**
     * 处理回放逻辑
     */
    useEffect(() => {
        // 如果不在播放状态或已完成，清理定时器
        if (!config.isPlaying || config.currentIndex >= data.length) {
            clearReplayInterval();
            return;
        }

        // 创建新的定时器
        const interval = calculateInterval(config.speed);
        
        intervalRef.current = setInterval(() => {
            setConfig(prev => {
                const nextIndex = prev.currentIndex + 1;
                
                // 检查是否到达末尾
                if (nextIndex >= data.length) {
                    // 回放完成处理
                    if (loop) {
                        // 循环播放，重置到开始
                        console.log('循环播放，重置到开始');
                        return { ...prev, currentIndex: 0 };
                    } else {
                        // 停止播放
                        console.log('回放完成，停止播放');
                        setReplay(false);
                        onComplete?.();
                        return { ...prev, isPlaying: false };
                    }
                }

                // 处理下一步数据
                const success = processDataStep(nextIndex);
                
                if (!success) {
                    console.error('处理数据失败，停止回放');
                    setReplay(false);
                    return { ...prev, isPlaying: false };
                }

                return { ...prev, currentIndex: nextIndex };
            });
        }, interval);

        // 清理函数
        return () => {
            clearReplayInterval();
        };
    }, [
        config.isPlaying, 
        config.speed, 
        config.currentIndex, 
        data.length, 
        loop,
        processDataStep,
        clearReplayInterval,
        setReplay,
        onComplete
    ]);

    /**
     * 自动开始回放
     */
    useEffect(() => {
        if (autoStart && data.length > 0 && !config.isPlaying) {
            console.log('自动开始回放');
            toggleReplay();
        }
    }, [autoStart, data.length, config.isPlaying, toggleReplay]);

    /**
     * 组件卸载时清理
     */
    useEffect(() => {
        return () => {
            clearReplayInterval();
        };
    }, [clearReplayInterval]);

    // ==================== 返回值 ====================

    return {
        config,
        processedData,
        toggleReplay,
        setSpeed,
        resetReplay,
        seekTo,
        progress,
        isComplete,
        isPlaying: config.isPlaying,
        currentIndex: config.currentIndex,
        totalLength
    };
};

// ==================== 导出 ====================

export default useReplay;

// 导出类型（供其他组件使用）
export type { UseReplayOptions, UseReplayReturn };