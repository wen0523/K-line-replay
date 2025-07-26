/**
 * 数据获取自定义Hook
 * 提供K线数据获取功能，支持缓存、错误处理和重试机制
 * 重构后的版本，增强了类型安全和错误处理
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// API工具
import api from '../lib/api';

// 类型定义
import { KLineData, CryptoCurrency } from '@/types';

// ==================== 类型定义 ====================

interface UseDataOptions {
    /** 启用缓存 */
    enableCache?: boolean;
    /** 缓存过期时间（毫秒） */
    cacheExpiry?: number;
    /** 最大重试次数 */
    maxRetries?: number;
    /** 重试延迟（毫秒） */
    retryDelay?: number;
    /** 请求超时时间（毫秒） */
    timeout?: number;
}

interface UseDataReturn {
    /** 获取数据函数 */
    getData: (currency: string) => Promise<KLineData[] | null>;
    /** 是否正在加载 */
    loading: boolean;
    /** 错误信息 */
    error: string | null;
    /** 清除缓存 */
    clearCache: () => void;
    /** 重试上次失败的请求 */
    retry: () => Promise<void>;
    /** 取消当前请求 */
    cancelRequest: () => void;
}

interface CacheItem {
    data: KLineData[];
    timestamp: number;
    currency: string;
}

interface RequestState {
    currency: string;
    timestamp: number;
}

// ==================== 常量定义 ====================

const DEFAULT_OPTIONS: Required<UseDataOptions> = {
    enableCache: true,
    cacheExpiry: 5 * 60 * 1000, // 5分钟
    maxRetries: 3,
    retryDelay: 1000, // 1秒
    timeout: 10000 // 10秒
};

// ==================== 工具函数 ====================

/**
 * 验证货币符号格式
 */
const isValidCurrency = (currency: string): boolean => {
    return typeof currency === 'string' && currency.length > 0 && /^[A-Z0-9]+$/i.test(currency);
};

/**
 * 生成缓存键
 */
const getCacheKey = (currency: string): string => {
    return `kline_data_${currency.toUpperCase()}`;
};

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 验证K线数据格式
 */
const validateKLineData = (data: any): data is KLineData[] => {
    if (!Array.isArray(data)) {
        return false;
    }
    
    return data.every(item => 
        Array.isArray(item) && 
        item.length >= 6 && 
        typeof item[0] === 'number' && // timestamp
        typeof item[1] === 'number' && // open
        typeof item[2] === 'number' && // high
        typeof item[3] === 'number' && // low
        typeof item[4] === 'number' && // close
        typeof item[5] === 'number'    // volume
    );
};

// ==================== 主Hook ====================

/**
 * 数据获取Hook
 */
export function useData(options: UseDataOptions = {}): UseDataReturn {
    const {
        enableCache,
        cacheExpiry,
        maxRetries,
        retryDelay,
        timeout
    } = { ...DEFAULT_OPTIONS, ...options };

    // ==================== 状态管理 ====================

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 缓存引用
    const cacheRef = useRef<Map<string, CacheItem>>(new Map());
    
    // 请求控制器引用
    const abortControllerRef = useRef<AbortController | null>(null);
    
    // 最后请求状态引用
    const lastRequestRef = useRef<RequestState | null>(null);

    // ==================== 缓存管理 ====================

    /**
     * 获取缓存数据
     */
    const getCachedData = useCallback((currency: string): KLineData[] | null => {
        if (!enableCache) {
            return null;
        }

        const cacheKey = getCacheKey(currency);
        const cached = cacheRef.current.get(cacheKey);

        if (!cached) {
            return null;
        }

        // 检查缓存是否过期
        const now = Date.now();
        if (now - cached.timestamp > cacheExpiry) {
            cacheRef.current.delete(cacheKey);
            console.log('缓存已过期，已清除:', currency);
            return null;
        }

        console.log('使用缓存数据:', currency);
        return cached.data;
    }, [enableCache, cacheExpiry]);

    /**
     * 设置缓存数据
     */
    const setCachedData = useCallback((currency: string, data: KLineData[]) => {
        if (!enableCache) {
            return;
        }

        const cacheKey = getCacheKey(currency);
        const cacheItem: CacheItem = {
            data,
            timestamp: Date.now(),
            currency
        };

        cacheRef.current.set(cacheKey, cacheItem);
        console.log('数据已缓存:', currency);
    }, [enableCache]);

    /**
     * 清除所有缓存
     */
    const clearCache = useCallback(() => {
        cacheRef.current.clear();
        console.log('所有缓存已清除');
    }, []);

    // ==================== 请求管理 ====================

    /**
     * 取消当前请求
     */
    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            console.log('请求已取消');
        }
    }, []);

    /**
     * 执行API请求
     */
    const fetchDataFromAPI = useCallback(async (
        currency: string, 
        retryCount: number = 0
    ): Promise<KLineData[] | null> => {
        try {
            // 创建新的请求控制器
            abortControllerRef.current = new AbortController();
            
            console.log(`正在获取数据: ${currency} (尝试 ${retryCount + 1}/${maxRetries + 1})`);

            const response = await api.get('/data', {
                params: { symbol: currency },
                timeout,
                signal: abortControllerRef.current.signal
            });

            // 验证响应数据
            if (!response.data || !response.data.data) {
                throw new Error('API响应数据格式无效');
            }

            const prices = response.data.data;

            // 验证K线数据格式
            if (!validateKLineData(prices)) {
                throw new Error('K线数据格式无效');
            }

            console.log(`数据获取成功: ${currency}, 数据量: ${prices.length}`);
            return prices;

        } catch (error: any) {
            // 如果是取消请求，不进行重试
            if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
                console.log('请求被取消');
                return null;
            }

            console.error(`获取数据失败 (尝试 ${retryCount + 1}):`, error.message);

            // 如果还有重试次数，进行重试
            if (retryCount < maxRetries) {
                console.log(`${retryDelay}ms 后重试...`);
                await delay(retryDelay);
                return fetchDataFromAPI(currency, retryCount + 1);
            }

            // 重试次数用完，抛出错误
            throw new Error(`获取数据失败: ${error.message}`);
        } finally {
            abortControllerRef.current = null;
        }
    }, [maxRetries, retryDelay, timeout]);

    // ==================== 主要功能函数 ====================

    /**
     * 获取K线数据
     */
    const getData = useCallback(async (currency: string): Promise<KLineData[] | null> => {
        // 验证输入参数
        if (!isValidCurrency(currency)) {
            const errorMsg = '无效的货币符号格式';
            setError(errorMsg);
            console.error(errorMsg, currency);
            return null;
        }

        // 标准化货币符号
        const normalizedCurrency = currency.toUpperCase();

        // 记录请求状态
        lastRequestRef.current = {
            currency: normalizedCurrency,
            timestamp: Date.now()
        };

        try {
            setLoading(true);
            setError(null);

            // 尝试从缓存获取数据
            const cachedData = getCachedData(normalizedCurrency);
            if (cachedData) {
                return cachedData;
            }

            // 从API获取数据
            const data = await fetchDataFromAPI(normalizedCurrency);
            
            if (data) {
                // 缓存数据
                setCachedData(normalizedCurrency, data);
                return data;
            }

            return null;

        } catch (error: any) {
            const errorMsg = error.message || '获取数据时发生未知错误';
            setError(errorMsg);
            console.error('getData 错误:', error);
            return null;

        } finally {
            setLoading(false);
        }
    }, [getCachedData, setCachedData, fetchDataFromAPI]);

    /**
     * 重试上次失败的请求
     */
    const retry = useCallback(async (): Promise<void> => {
        if (!lastRequestRef.current) {
            console.warn('没有可重试的请求');
            return;
        }

        const { currency } = lastRequestRef.current;
        console.log('重试请求:', currency);
        
        await getData(currency);
    }, [getData]);

    // ==================== 生命周期 ====================

    /**
     * 组件卸载时清理
     */
    useEffect(() => {
        return () => {
            cancelRequest();
        };
    }, [cancelRequest]);

    /**
     * 定期清理过期缓存
     */
    useEffect(() => {
        if (!enableCache) {
            return;
        }

        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const keysToDelete: string[] = [];

            cacheRef.current.forEach((item, key) => {
                if (now - item.timestamp > cacheExpiry) {
                    keysToDelete.push(key);
                }
            });

            keysToDelete.forEach(key => {
                cacheRef.current.delete(key);
            });

            if (keysToDelete.length > 0) {
                console.log(`清理了 ${keysToDelete.length} 个过期缓存项`);
            }
        }, cacheExpiry);

        return () => {
            clearInterval(cleanupInterval);
        };
    }, [enableCache, cacheExpiry]);

    // ==================== 返回值 ====================

    return {
        getData,
        loading,
        error,
        clearCache,
        retry,
        cancelRequest
    };
}

// ==================== 导出 ====================

export default useData;

// 导出类型（供其他组件使用）
export type { UseDataOptions, UseDataReturn };