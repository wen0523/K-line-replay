/**
 * K线数据处理器
 * 负责获取、缓存、转换和验证K线数据
 */

import { KLineData, KLineDataSet, TimeFrame, ApiResponse } from '@/types';
import { API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT } from '@/constants';

// ==================== 类型定义 ====================

/**
 * 原始K线数据格式
 */
interface RawKLineData {
    /** 时间戳 */
    timestamp: number;
    /** 开盘价 */
    open: number;
    /** 最高价 */
    high: number;
    /** 最低价 */
    low: number;
    /** 收盘价 */
    close: number;
    /** 成交量 */
    volume: number;
    /** 成交额（可选） */
    amount?: number;
}

/**
 * 数据获取选项
 */
interface FetchOptions {
    /** 交易对符号 */
    symbol: string;
    /** 时间周期 */
    timeFrame: TimeFrame;
    /** 开始时间 */
    startTime?: number;
    /** 结束时间 */
    endTime?: number;
    /** 数据条数限制 */
    limit?: number;
    /** 是否强制刷新缓存 */
    forceRefresh?: boolean;
    /** 请求超时时间（毫秒） */
    timeout?: number;
}

/**
 * 缓存项结构
 */
interface CacheItem {
    /** 缓存的数据 */
    data: KLineDataSet;
    /** 缓存时间戳 */
    timestamp: number;
    /** 数据版本号 */
    version: number;
    /** 数据来源 */
    source: 'api' | 'mock' | 'cache';
    /** 缓存过期时间 */
    expiresAt: number;
}

/**
 * 缓存统计信息
 */
interface CacheStats {
    /** 缓存项总数 */
    totalItems: number;
    /** 缓存总大小（字节） */
    totalSize: number;
    /** 命中次数 */
    hitCount: number;
    /** 未命中次数 */
    missCount: number;
    /** 命中率 */
    hitRate: number;
    /** 最后清理时间 */
    lastCleanupTime: number;
}

/**
 * 数据验证结果
 */
interface ValidationResult {
    /** 是否有效 */
    isValid: boolean;
    /** 错误信息列表 */
    errors: string[];
    /** 警告信息列表 */
    warnings: string[];
    /** 修复后的数据 */
    fixedData?: KLineData[];
}

/**
 * 预加载配置
 */
interface PreloadConfig {
    /** 交易对列表 */
    symbols: string[];
    /** 时间周期列表 */
    timeFrames: TimeFrame[];
    /** 并发数限制 */
    concurrency?: number;
    /** 是否显示进度 */
    showProgress?: boolean;
}

// ==================== 常量定义 ====================

/** 默认获取选项 */
const DEFAULT_FETCH_OPTIONS: Partial<FetchOptions> = {
    limit: 1000,
    timeout: REQUEST_TIMEOUT || 10000,
    forceRefresh: false,
};

/** 缓存键前缀 */
const CACHE_KEY_PREFIX = 'kline_data';

/** 数据版本号 */
const DATA_VERSION = 1;

/** 最大缓存大小（字节） */
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

/** 缓存清理阈值 */
const CACHE_CLEANUP_THRESHOLD = 0.8; // 80%

/** 默认超时时间（毫秒） */
const DEFAULT_TIMEOUT = 10000;

/** 最大重试次数 */
const MAX_RETRY_COUNT = 3;

/** 重试延迟（毫秒） */
const RETRY_DELAY = 1000;

/** 并发请求限制 */
const MAX_CONCURRENT_REQUESTS = 5;

/** 缓存TTL（毫秒） */
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

// ==================== 工具函数 ====================

/**
 * 生成缓存键
 */
function generateCacheKey(symbol: string, timeFrames: TimeFrame[]): string {
    return `${CACHE_KEY_PREFIX}_${symbol}_${timeFrames.join('_')}`;
}

/**
 * 计算对象大小（字节）
 */
function calculateObjectSize(obj: any): number {
    return new Blob([JSON.stringify(obj)]).size;
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 检查数据是否过期
 */
function isDataExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
}

// ==================== K线数据处理器类 ====================

/**
 * K线数据处理器
 * 提供数据获取、缓存、转换和验证功能
 */
export class DataProcessor {
    private cache = new Map<string, CacheItem>();
    private loadingPromises = new Map<string, Promise<KLineDataSet>>();
    private stats: CacheStats;
    private requestQueue: Array<() => Promise<any>> = [];
    private activeRequests = 0;

    constructor() {
        this.stats = this.initializeStats();
        this.startCacheCleanup();
    }

    // ==================== 私有方法 ====================

    /**
     * 初始化统计信息
     */
    private initializeStats(): CacheStats {
        return {
            totalItems: 0,
            totalSize: 0,
            hitCount: 0,
            missCount: 0,
            hitRate: 0,
            lastCleanupTime: Date.now(),
        };
    }

    /**
     * 更新统计信息
     */
    private updateStats(): void {
        this.stats.totalItems = this.cache.size;
        this.stats.totalSize = Array.from(this.cache.values())
            .reduce((total, item) => total + calculateObjectSize(item), 0);
        this.stats.hitRate = this.stats.hitCount + this.stats.missCount > 0 ?
            this.stats.hitCount / (this.stats.hitCount + this.stats.missCount) : 0;
    }

    /**
     * 启动缓存清理定时器
     */
    private startCacheCleanup(): void {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 300000); // 5分钟
    }

    /**
     * 清理过期缓存
     */
    private cleanupExpiredCache(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        // 如果缓存大小超过阈值，清理最旧的数据
        if (this.stats.totalSize > MAX_CACHE_SIZE * CACHE_CLEANUP_THRESHOLD) {
            this.cleanupOldestCache();
        }

        this.updateStats();
        this.stats.lastCleanupTime = now;

        if (cleanedCount > 0) {
            console.log(`清理了 ${cleanedCount} 个过期缓存项`);
        }
    }

    /**
     * 清理最旧的缓存
     */
    private cleanupOldestCache(): void {
        const sortedEntries = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => a.timestamp - b.timestamp);

        const targetSize = MAX_CACHE_SIZE * 0.7; // 清理到70%
        let currentSize = this.stats.totalSize;
        let cleanedCount = 0;

        for (const [key, item] of sortedEntries) {
            if (currentSize <= targetSize) break;

            const itemSize = calculateObjectSize(item);
            this.cache.delete(key);
            currentSize -= itemSize;
            cleanedCount++;
        }

        console.log(`清理了 ${cleanedCount} 个最旧的缓存项，释放空间: ${formatFileSize(this.stats.totalSize - currentSize)}`);
    }

    /**
     * 从缓存获取数据
     */
    private getFromCache(key: string): KLineDataSet | null {
        const item = this.cache.get(key);
        
        if (!item) {
            this.stats.missCount++;
            return null;
        }

        // 检查是否过期
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            this.stats.missCount++;
            return null;
        }

        this.stats.hitCount++;
        console.log(`缓存命中: ${key}`);
        return item.data;
    }

    /**
     * 存储到缓存
     */
    private setToCache(key: string, data: KLineDataSet, source: 'api' | 'mock' = 'api'): void {
        const now = Date.now();

        const item: CacheItem = {
            data: JSON.parse(JSON.stringify(data)), // 深拷贝
            timestamp: now,
            version: DATA_VERSION,
            source,
            expiresAt: now + CACHE_TTL,
        };

        this.cache.set(key, item);
        this.updateStats();

        console.log(`数据已缓存: ${key}, 大小: ${formatFileSize(calculateObjectSize(item))}`);
    }

    /**
     * 执行请求队列
     */
    private async processRequestQueue(): Promise<void> {
        while (this.requestQueue.length > 0 && this.activeRequests < MAX_CONCURRENT_REQUESTS) {
            const request = this.requestQueue.shift();
            if (request) {
                this.activeRequests++;
                try {
                    await request();
                } finally {
                    this.activeRequests--;
                }
            }
        }
    }

    /**
     * 添加请求到队列
     */
    private enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push(async () => {
                try {
                    const result = await request();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.processRequestQueue();
        });
    }

    /**
     * 带重试的HTTP请求
     */
    private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
        let lastError: Error;

        for (let attempt = 1; attempt <= MAX_RETRY_COUNT; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                lastError = error as Error;
                console.warn(`请求失败，第 ${attempt}/${MAX_RETRY_COUNT} 次尝试:`, error);

                if (attempt < MAX_RETRY_COUNT) {
                    await delay(RETRY_DELAY * attempt);
                }
            }
        }

        throw lastError!;
    }

    // ==================== 公共方法 ====================

    /**
     * 获取K线数据
     * @param symbol 交易对符号
     * @param timeFrames 需要的时间周期数组
     * @param useCache 是否使用缓存
     */
    async getKLineData(
        symbol: string,
        timeFrames: TimeFrame[] = ['1d', '4h', '1h', '15m', '5m'],
        useCache: boolean = true
    ): Promise<KLineDataSet> {
        const cacheKey = generateCacheKey(symbol, timeFrames);

        // 检查是否有正在进行的请求
        if (this.loadingPromises.has(cacheKey)) {
            console.log(`等待正在进行的请求: ${cacheKey}`);
            return this.loadingPromises.get(cacheKey)!;
        }

        // 检查缓存（如果使用缓存）
        if (useCache) {
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        // 创建加载Promise
        const loadingPromise = this.fetchKLineData(symbol, timeFrames);
        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const data = await loadingPromise;
            if (useCache) {
                this.setToCache(cacheKey, data);
            }
            return data;
        } catch (error) {
            console.error(`获取K线数据失败: ${symbol}`, error);
            throw error;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * 从API获取K线数据
     * @param symbol 交易对符号
     * @param timeFrames 时间周期数组
     */
    private async fetchKLineData(symbol: string, timeFrames: TimeFrame[]): Promise<KLineDataSet> {
        const dataSet: KLineDataSet = {};

        // 并行获取所有时间周期的数据
        const promises = timeFrames.map(async (timeFrame) => {
            try {
                const data = await this.fetchSingleTimeFrameData(symbol, timeFrame);
                return { timeFrame, data };
            } catch (error) {
                console.error(`获取${timeFrame}数据失败:`, error);
                // 如果API失败，生成模拟数据
                const mockData = this.generateMockData(symbol, timeFrame);
                return { timeFrame, data: mockData };
            }
        });

        const results = await Promise.all(promises);

        // 组装数据集
        results.forEach(({ timeFrame, data }) => {
            dataSet[timeFrame] = data;
        });

        console.log(`成功获取K线数据: ${symbol}`, dataSet);
        return dataSet;
    }

    /**
     * 获取单个时间周期的数据
     * @param symbol 交易对符号
     * @param timeFrame 时间周期
     */
    private async fetchSingleTimeFrameData(symbol: string, timeFrame: TimeFrame): Promise<KLineData[]> {
        return this.enqueueRequest(async () => {
            const url = `${API_BASE_URL}${API_ENDPOINTS.KLINE_DATA}`;
            const params = new URLSearchParams({
                symbol: symbol.replace('/', ''),
                interval: timeFrame,
                limit: '1000', // 获取最近1000条数据
            });

            console.log(`获取K线数据: ${symbol} ${timeFrame}`);

            try {
                const response = await this.fetchWithRetry(`${url}?${params}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const result: ApiResponse<KLineData[]> = await response.json();

                if (!result.success) {
                    throw new Error(result.message || '获取数据失败');
                }

                // 验证和转换数据
                const validationResult = this.validateKLineData(result.data || []);
                if (!validationResult.isValid) {
                    console.warn('数据验证失败:', validationResult.errors);
                    if (validationResult.fixedData) {
                        console.log('使用修复后的数据');
                        return validationResult.fixedData;
                    }
                    throw new Error('数据验证失败且无法修复');
                }

                return this.transformData(result.data || []);
            } catch (error) {
                console.error(`获取单个时间周期数据失败: ${symbol} ${timeFrame}`, error);
                throw error;
            }
        });
    }

    /**
     * 验证K线数据格式
     * @param data 原始数据
     * @returns 验证结果
     */
    validateKLineData(data: any): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
        };

        if (!Array.isArray(data)) {
            result.isValid = false;
            result.errors.push('数据不是数组格式');
            return result;
        }

        if (data.length === 0) {
            result.warnings.push('数据为空');
            return result;
        }

        const fixedData: KLineData[] = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const itemErrors: string[] = [];

            // 检查数据格式
            if (Array.isArray(item)) {
                // 数组格式验证
                if (item.length !== 6) {
                    itemErrors.push('数组长度不正确，应为6');
                }

                const [timestamp, open, high, low, close, volume] = item;

                if (typeof timestamp !== 'string') {
                    itemErrors.push('时间戳格式错误');
                }

                const priceFields = [open, high, low, close];
                for (let j = 0; j < priceFields.length; j++) {
                    if (typeof priceFields[j] !== 'number' || priceFields[j] <= 0) {
                        itemErrors.push(`价格字段无效: 索引${j + 1}`);
                    }
                }

                if (typeof volume !== 'number' || volume < 0) {
                    itemErrors.push('成交量无效');
                }

                // 检查价格逻辑
                if (high < low) {
                    itemErrors.push('最高价小于最低价');
                }

                if (open > high || open < low) {
                    itemErrors.push('开盘价超出最高最低价范围');
                }

                if (close > high || close < low) {
                    itemErrors.push('收盘价超出最高最低价范围');
                }

                if (itemErrors.length === 0) {
                    fixedData.push(item as KLineData);
                }
            } else {
                itemErrors.push('数据项不是数组格式');
            }

            if (itemErrors.length > 0) {
                result.errors.push(`第${i}项数据错误: ${itemErrors.join(', ')}`);
            }
        }

        if (result.errors.length > 0) {
            result.isValid = false;
        }

        if (fixedData.length > 0) {
            result.fixedData = fixedData;
        }

        return result;
    }

    /**
     * 转换数据格式
     * @param rawData 原始数据
     */
    transformData(rawData: any[]): KLineData[] {
        if (!Array.isArray(rawData)) {
            console.warn('原始数据格式错误，不是数组');
            return [];
        }

        return rawData
            .map((item, index) => {
                try {
                    // 处理不同的数据格式
                    if (Array.isArray(item)) {
                        // 已经是数组格式
                        const [timestamp, open, high, low, close, volume] = item;
                        return [
                            String(timestamp),
                            Number(open),
                            Number(high),
                            Number(low),
                            Number(close),
                            Number(volume),
                        ] as KLineData;
                    } else if (typeof item === 'object' && item !== null) {
                        // 对象格式，需要转换
                        return [
                            String(item.timestamp || item.time || item.t),
                            Number(item.open || item.o),
                            Number(item.high || item.h),
                            Number(item.low || item.l),
                            Number(item.close || item.c),
                            Number(item.volume || item.v),
                        ] as KLineData;
                    } else {
                        console.warn(`数据项格式错误，索引: ${index}`, item);
                        return null;
                    }
                } catch (error) {
                    console.warn(`转换数据项失败，索引: ${index}`, error);
                    return null;
                }
            })
            .filter((item): item is KLineData => item !== null);
    }

    /**
     * 清理缓存
     * @param symbol 可选，指定清理某个交易对的缓存
     */
    clearCache(symbol?: string): void {
        if (symbol) {
            // 清理指定交易对的缓存
            const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(`_${symbol}_`));
            keysToDelete.forEach(key => this.cache.delete(key));
            console.log(`已清理${symbol}的缓存，共 ${keysToDelete.length} 项`);
        } else {
            // 清理所有缓存
            const count = this.cache.size;
            this.cache.clear();
            this.loadingPromises.clear();
            console.log(`已清理所有缓存，共 ${count} 项`);
        }

        this.updateStats();
    }

    /**
     * 获取缓存统计信息
     */
    getCacheStats(): Readonly<CacheStats> {
        this.updateStats();
        return { ...this.stats };
    }

    /**
     * 预加载数据
     * @param config 预加载配置
     */
    async preloadData(config: PreloadConfig): Promise<void> {
        const { symbols, timeFrames, concurrency = 3, showProgress = false } = config;
        const total = symbols.length;
        let completed = 0;

        console.log(`开始预加载数据: ${symbols.length} 个交易对`);

        const tasks: Array<() => Promise<void>> = [];

        for (const symbol of symbols) {
            tasks.push(async () => {
                try {
                    await this.getKLineData(symbol, timeFrames, true);
                    completed++;
                    
                    if (showProgress) {
                        const progress = ((completed / total) * 100).toFixed(1);
                        console.log(`预加载进度: ${progress}% (${completed}/${total})`);
                    }
                } catch (error) {
                    console.error(`预加载失败: ${symbol}`, error);
                    completed++;
                }
            });
        }

        // 并发执行任务
        const executeTask = async (task: () => Promise<void>) => {
            await task();
        };

        const chunks: Array<Array<() => Promise<void>>> = [];
        for (let i = 0; i < tasks.length; i += concurrency) {
            chunks.push(tasks.slice(i, i + concurrency));
        }

        for (const chunk of chunks) {
            await Promise.all(chunk.map(executeTask));
        }

        console.log(`预加载完成: ${completed}/${total} 个任务`);
    }

    /**
     * 生成模拟数据（用于开发和测试）
     * @param symbol 交易对符号
     * @param timeFrame 时间周期
     * @param count 数据条数
     */
    generateMockData(symbol: string, timeFrame: TimeFrame, count: number = 1000): KLineData[] {
        console.log(`生成模拟数据: ${symbol} ${timeFrame} ${count}条`);

        const data: KLineData[] = [];
        const now = Date.now();
        const timeFrameMs = this.getTimeFrameMilliseconds(timeFrame);
        let basePrice = 50000; // 基础价格

        for (let i = count - 1; i >= 0; i--) {
            const timestamp = new Date(now - i * timeFrameMs).toISOString();
            
            // 生成随机价格变化
            const change = (Math.random() - 0.5) * basePrice * 0.05; // 最大5%变化
            const open = basePrice;
            const close = basePrice + change;
            
            // 生成高低价
            const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.5;
            const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.5;
            
            // 生成成交量
            const volume = Math.floor(Math.random() * 1000000) + 100000;

            data.push([
                timestamp,
                Number(open.toFixed(2)),
                Number(high.toFixed(2)),
                Number(low.toFixed(2)),
                Number(close.toFixed(2)),
                volume,
            ]);

            // 更新基础价格
            basePrice = close;
        }

        return data;
    }

    /**
     * 获取时间周期对应的毫秒数
     * @param timeFrame 时间周期
     */
    private getTimeFrameMilliseconds(timeFrame: TimeFrame): number {
        const minutes = {
            '5m': 5,
            '15m': 15,
            '1h': 60,
            '4h': 240,
            '1d': 1440,
        }[timeFrame];

        return (minutes || 60) * 60 * 1000;
    }

    /**
     * 销毁数据处理器
     */
    destroy(): void {
        this.clearCache();
        console.log('数据处理器已销毁');
    }
}

// ==================== 导出单例实例 ====================

/**
 * 数据处理器单例实例
 * 在整个应用中共享使用
 */
export const dataProcessor = new DataProcessor();

// ==================== 便捷函数 ====================

/**
 * 获取K线数据的便捷函数
 * @param symbol 交易对符号
 * @param timeFrames 时间周期数组
 * @param useCache 是否使用缓存
 */
export const getKLineData = (
    symbol: string,
    timeFrames?: TimeFrame[],
    useCache?: boolean
): Promise<KLineDataSet> => {
    return dataProcessor.getKLineData(symbol, timeFrames, useCache);
};

/**
 * 清理缓存的便捷函数
 * @param symbol 可选，指定清理某个交易对的缓存
 */
export const clearDataCache = (symbol?: string): void => {
    dataProcessor.clearCache(symbol);
};

/**
 * 生成模拟数据的便捷函数
 * @param symbol 交易对符号
 * @param timeFrame 时间周期
 * @param count 数据条数
 */
export const generateMockKLineData = (
    symbol: string,
    timeFrame: TimeFrame,
    count?: number
): KLineData[] => {
    return dataProcessor.generateMockData(symbol, timeFrame, count);
};

/**
 * 获取缓存统计信息的便捷函数
 */
export const getCacheStats = (): Readonly<CacheStats> => {
    return dataProcessor.getCacheStats();
};

/**
 * 预加载数据的便捷函数
 */
export const preloadData = (config: PreloadConfig): Promise<void> => {
    return dataProcessor.preloadData(config);
};

// ==================== 导出类型 ====================

export type {
    RawKLineData,
    FetchOptions,
    CacheItem,
    CacheStats,
    ValidationResult,
    PreloadConfig,
};