/**
 * K线数据处理工具函数
 * 提供数据更新和时间格式化等功能
 */

import { KLineData } from '@/types';

// ==================== 类型定义 ====================

/**
 * 时间格式化选项
 */
type TimeFormatOption = 'h' | 'd' | 'w' | 'm';

/**
 * 数据更新结果
 */
export interface DataUpdateResult {
    /** 更新后的数据 */
    data: KLineData;
    /** 是否发生了变化 */
    changed: boolean;
}

// ==================== 常量定义 ====================

/** 时间格式映射 */
const TIME_FORMAT_MAP: Record<TimeFormatOption, number> = {
    'h': 4, // 小时：保留到小时
    'd': 3, // 天：保留到天
    'w': 2, // 周：保留到月
    'm': 2, // 月：保留到月
};

// ==================== 工具函数 ====================

/**
 * 验证K线数据格式
 * @param data K线数据
 * @returns 是否为有效的K线数据
 */
const isValidKLineData = (data: any): data is KLineData => {
    if (!Array.isArray(data) || data.length !== 6) {
        return false;
    }

    const [timestamp, open, high, low, close, volume] = data;
    
    return (
        typeof timestamp === 'string' &&
        typeof open === 'number' &&
        typeof high === 'number' &&
        typeof low === 'number' &&
        typeof close === 'number' &&
        typeof volume === 'number' &&
        !isNaN(open) &&
        !isNaN(high) &&
        !isNaN(low) &&
        !isNaN(close) &&
        !isNaN(volume) &&
        high >= Math.max(open, close) &&
        low <= Math.min(open, close)
    );
};

/**
 * 安全地执行数值运算
 * @param a 第一个数值
 * @param b 第二个数值
 * @param precision 精度（小数位数）
 * @returns 运算结果
 */
const safeAdd = (a: number, b: number, precision: number = 5): number => {
    const result = a + b;
    return Number(result.toFixed(precision));
};

/**
 * 比较两个数值，返回较大值
 * @param a 第一个数值
 * @param b 第二个数值
 * @returns 较大的数值
 */
const safeMax = (a: number, b: number): number => {
    if (isNaN(a) || isNaN(b)) {
        return isNaN(a) ? (isNaN(b) ? 0 : b) : a;
    }
    return Math.max(a, b);
};

/**
 * 比较两个数值，返回较小值
 * @param a 第一个数值
 * @param b 第二个数值
 * @returns 较小的数值
 */
const safeMin = (a: number, b: number): number => {
    if (isNaN(a) || isNaN(b)) {
        return isNaN(a) ? (isNaN(b) ? 0 : b) : a;
    }
    return Math.min(a, b);
};

// ==================== 主要函数 ====================

/**
 * 更新K线数据（合并两个K线数据）
 * 用于将小周期数据合并到大周期数据中
 * 
 * @param data1 目标数据（将被更新）
 * @param data2 源数据（用于更新）
 * @returns 更新后的K线数据和变化状态
 */
export const updateData = (data1: KLineData, data2: KLineData): DataUpdateResult => {
    // 验证输入数据
    if (!isValidKLineData(data1) || !isValidKLineData(data2)) {
        console.warn('无效的K线数据格式');
        return {
            data: data1,
            changed: false
        };
    }

    // 记录原始数据用于比较
    const originalData = [...data1] as KLineData;

    try {
        // 更新最高价（取两者中的较大值）
        data1[2] = safeMax(data1[2], data2[2]);
        
        // 更新最低价（取两者中的较小值）
        data1[3] = safeMin(data1[3], data2[3]);
        
        // 更新收盘价（使用新数据的收盘价）
        data1[4] = data2[4];
        
        // 更新成交量（累加）
        data1[5] = safeAdd(data1[5], data2[5]);

        // 检查是否发生变化
        const changed = !(originalData as (string | number)[]).every((value, index) => value === data1[index]);

        if (changed) {
            console.log('K线数据已更新:', {
                原始: originalData,
                更新后: data1
            });
        }

        return {
            data: data1,
            changed
        };
    } catch (error) {
        console.error('更新K线数据时发生错误:', error);
        return {
            data: originalData,
            changed: false
        };
    }
};

/**
 * 更新K线数据的时间格式
 * 根据指定的时间格式截取时间戳
 * 
 * @param data K线数据
 * @param timeFormat 时间格式选项
 * @returns 更新后的K线数据
 */
export const updateTime = (data: KLineData, timeFormat: TimeFormatOption): KLineData => {
    // 验证输入数据
    if (!isValidKLineData(data)) {
        console.warn('无效的K线数据格式');
        return data;
    }

    // 验证时间格式选项
    if (!TIME_FORMAT_MAP.hasOwnProperty(timeFormat)) {
        console.warn('无效的时间格式选项:', timeFormat);
        return data;
    }

    try {
        const originalTimestamp = data[0];
        const timeParts = originalTimestamp.split('-');
        
        // 根据格式选项截取时间部分
        const keepParts = TIME_FORMAT_MAP[timeFormat];
        
        if (timeParts.length >= keepParts) {
            const newTimestamp = timeParts.slice(0, keepParts).join('-');
            
            // 创建新的数据副本
            const updatedData = [...data] as KLineData;
            updatedData[0] = newTimestamp;
            
            console.log('时间格式已更新:', {
                原始: originalTimestamp,
                格式: timeFormat,
                更新后: newTimestamp
            });
            
            return updatedData;
        } else {
            console.warn('时间戳格式不符合预期:', originalTimestamp);
            return data;
        }
    } catch (error) {
        console.error('更新时间格式时发生错误:', error);
        return data;
    }
};

/**
 * 格式化时间戳为可读格式
 * @param timestamp 时间戳字符串
 * @param format 格式选项
 * @returns 格式化后的时间字符串
 */
export const formatTimestamp = (timestamp: string, format: TimeFormatOption = 'd'): string => {
    try {
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            console.warn('无效的时间戳:', timestamp);
            return timestamp;
        }

        switch (format) {
            case 'h':
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'd':
                return date.toLocaleDateString('zh-CN');
            case 'w':
            case 'm':
                return date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit'
                });
            default:
                return timestamp;
        }
    } catch (error) {
        console.error('格式化时间戳时发生错误:', error);
        return timestamp;
    }
};

/**
 * 计算价格变化百分比
 * @param oldPrice 原价格
 * @param newPrice 新价格
 * @returns 变化百分比
 */
export const calculatePriceChangePercent = (oldPrice: number, newPrice: number): number => {
    if (isNaN(oldPrice) || isNaN(newPrice) || oldPrice === 0) {
        return 0;
    }
    
    const change = ((newPrice - oldPrice) / oldPrice) * 100;
    return Number(change.toFixed(2));
};

/**
 * 验证并修复K线数据
 * @param data K线数据
 * @returns 修复后的K线数据
 */
export const validateAndFixKLineData = (data: KLineData): KLineData => {
    if (!isValidKLineData(data)) {
        console.warn('K线数据格式错误，尝试修复');
        
        // 尝试修复数据，明确指定类型以避免never类型推断
        const dataArray = data as (string | number)[];
        const [timestamp, open, high, low, close, volume] = dataArray;
        
        return [
            String(timestamp || ''),
            Number(open) || 0,
            Number(high) || 0,
            Number(low) || 0,
            Number(close) || 0,
            Number(volume) || 0,
        ];
    }
    
    return data;
};