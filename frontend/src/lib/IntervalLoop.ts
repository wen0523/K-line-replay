/**
 * 定时循环执行器
 * 提供可控制的定时任务执行功能
 */

// ==================== 类型定义 ====================

/**
 * 循环执行的回调函数类型
 */
type LoopCallback = () => void | Promise<void>;

/**
 * 循环状态枚举
 */
enum LoopStatus {
    /** 停止状态 */
    STOPPED = 'stopped',
    /** 运行状态 */
    RUNNING = 'running',
    /** 暂停状态 */
    PAUSED = 'paused',
    /** 错误状态 */
    ERROR = 'error'
}

/**
 * 循环配置选项
 */
interface LoopOptions {
    /** 执行间隔（毫秒） */
    interval: number;
    /** 是否立即执行第一次 */
    immediate?: boolean;
    /** 最大执行次数（0表示无限制） */
    maxExecutions?: number;
    /** 错误重试次数 */
    retryCount?: number;
    /** 错误重试延迟（毫秒） */
    retryDelay?: number;
    /** 是否在错误时停止循环 */
    stopOnError?: boolean;
}

/**
 * 循环统计信息
 */
interface LoopStats {
    /** 总执行次数 */
    totalExecutions: number;
    /** 成功执行次数 */
    successExecutions: number;
    /** 失败执行次数 */
    failedExecutions: number;
    /** 开始时间 */
    startTime: number | null;
    /** 最后执行时间 */
    lastExecutionTime: number | null;
    /** 当前状态 */
    status: LoopStatus;
}

// ==================== 常量定义 ====================

/** 默认配置选项 */
const DEFAULT_OPTIONS: Required<LoopOptions> = {
    interval: 1000,
    immediate: false,
    maxExecutions: 0,
    retryCount: 3,
    retryDelay: 1000,
    stopOnError: false,
};

/** 最小执行间隔（毫秒） */
const MIN_INTERVAL = 10;

/** 最大执行间隔（毫秒） */
const MAX_INTERVAL = 24 * 60 * 60 * 1000; // 24小时

// ==================== 定时循环执行器类 ====================

/**
 * 定时循环执行器
 * 提供可控制的定时任务执行功能，支持启动、停止、暂停、恢复等操作
 */
export default class IntervalLoop {
    private intervalId: NodeJS.Timeout | null = null;
    private callback: LoopCallback | null = null;
    private options: Required<LoopOptions> = DEFAULT_OPTIONS;
    private stats: LoopStats;
    private retryTimeoutId: NodeJS.Timeout | null = null;

    constructor() {
        this.stats = this.initializeStats();
    }

    // ==================== 私有方法 ====================

    /**
     * 初始化统计信息
     */
    private initializeStats(): LoopStats {
        return {
            totalExecutions: 0,
            successExecutions: 0,
            failedExecutions: 0,
            startTime: null,
            lastExecutionTime: null,
            status: LoopStatus.STOPPED,
        };
    }

    /**
     * 验证执行间隔
     */
    private validateInterval(interval: number): number {
        if (typeof interval !== 'number' || isNaN(interval)) {
            console.warn('无效的执行间隔，使用默认值:', DEFAULT_OPTIONS.interval);
            return DEFAULT_OPTIONS.interval;
        }

        if (interval < MIN_INTERVAL) {
            console.warn(`执行间隔过小，调整为最小值: ${MIN_INTERVAL}ms`);
            return MIN_INTERVAL;
        }

        if (interval > MAX_INTERVAL) {
            console.warn(`执行间隔过大，调整为最大值: ${MAX_INTERVAL}ms`);
            return MAX_INTERVAL;
        }

        return interval;
    }

    /**
     * 执行回调函数
     */
    private async executeCallback(): Promise<void> {
        if (!this.callback || this.stats.status !== LoopStatus.RUNNING) {
            return;
        }

        // 检查最大执行次数限制
        if (this.options.maxExecutions > 0 && 
            this.stats.totalExecutions >= this.options.maxExecutions) {
            console.log('已达到最大执行次数，停止循环');
            this.stop();
            return;
        }

        this.stats.totalExecutions++;
        this.stats.lastExecutionTime = Date.now();

        try {
            await this.callback();
            this.stats.successExecutions++;
            console.log(`循环执行成功，第 ${this.stats.totalExecutions} 次`);
        } catch (error) {
            this.stats.failedExecutions++;
            console.error(`循环执行失败，第 ${this.stats.totalExecutions} 次:`, error);

            // 处理错误重试或停止
            if (this.options.stopOnError) {
                this.stats.status = LoopStatus.ERROR;
                this.stop();
            } else if (this.options.retryCount > 0) {
                await this.handleRetry(error);
            }
        }
    }

    /**
     * 处理错误重试
     */
    private async handleRetry(error: any): Promise<void> {
        let retryAttempts = 0;

        while (retryAttempts < this.options.retryCount && 
               this.stats.status === LoopStatus.RUNNING) {
            retryAttempts++;
            console.log(`尝试重试，第 ${retryAttempts}/${this.options.retryCount} 次`);

            // 等待重试延迟
            await new Promise(resolve => {
                this.retryTimeoutId = setTimeout(resolve, this.options.retryDelay);
            });

            try {
                if (this.callback) {
                    await this.callback();
                    this.stats.successExecutions++;
                    console.log(`重试成功，第 ${retryAttempts} 次`);
                    return; // 重试成功，退出重试循环
                }
            } catch (retryError) {
                console.error(`重试失败，第 ${retryAttempts} 次:`, retryError);
            }
        }

        console.error('所有重试都失败了');
    }

    /**
     * 清理定时器
     */
    private clearTimers(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
            this.retryTimeoutId = null;
        }
    }

    // ==================== 公共方法 ====================

    /**
     * 启动循环执行
     * @param callback 要执行的回调函数
     * @param options 循环配置选项
     */
    start(callback: LoopCallback, options: Partial<LoopOptions> = {}): void {
        if (this.stats.status === LoopStatus.RUNNING) {
            console.warn('循环已在运行中');
            return;
        }

        // 验证回调函数
        if (typeof callback !== 'function') {
            throw new Error('回调函数必须是一个函数');
        }

        // 合并配置选项
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
            interval: this.validateInterval(options.interval || DEFAULT_OPTIONS.interval),
        };

        this.callback = callback;
        this.stats = this.initializeStats();
        this.stats.status = LoopStatus.RUNNING;
        this.stats.startTime = Date.now();

        // 立即执行第一次（如果配置了）
        if (this.options.immediate) {
            this.executeCallback();
        }

        // 启动定时器
        this.intervalId = setInterval(() => {
            this.executeCallback();
        }, this.options.interval);

        console.log(`循环已启动，间隔: ${this.options.interval}ms`);
    }

    /**
     * 停止循环执行
     */
    stop(): void {
        if (this.stats.status === LoopStatus.STOPPED) {
            console.warn('循环已停止');
            return;
        }

        this.clearTimers();
        this.stats.status = LoopStatus.STOPPED;
        this.callback = null;

        console.log('循环已停止');
        this.logStats();
    }

    /**
     * 暂停循环执行
     */
    pause(): void {
        if (this.stats.status !== LoopStatus.RUNNING) {
            console.warn('只能暂停正在运行的循环');
            return;
        }

        this.clearTimers();
        this.stats.status = LoopStatus.PAUSED;

        console.log('循环已暂停');
    }

    /**
     * 恢复循环执行
     */
    resume(): void {
        if (this.stats.status !== LoopStatus.PAUSED) {
            console.warn('只能恢复已暂停的循环');
            return;
        }

        if (!this.callback) {
            console.error('无法恢复循环：回调函数丢失');
            return;
        }

        this.stats.status = LoopStatus.RUNNING;

        // 重新启动定时器
        this.intervalId = setInterval(() => {
            this.executeCallback();
        }, this.options.interval);

        console.log('循环已恢复');
    }

    /**
     * 切换循环状态（运行/停止）
     * @param callback 要执行的回调函数
     * @param options 循环配置选项
     */
    toggle(callback: LoopCallback, options: Partial<LoopOptions> = {}): void {
        if (this.stats.status === LoopStatus.RUNNING) {
            this.stop();
        } else {
            this.start(callback, options);
        }
    }

    /**
     * 更新执行间隔
     * @param newInterval 新的执行间隔（毫秒）
     */
    updateInterval(newInterval: number): void {
        const validatedInterval = this.validateInterval(newInterval);
        
        if (validatedInterval === this.options.interval) {
            console.log('执行间隔未发生变化');
            return;
        }

        this.options.interval = validatedInterval;

        // 如果正在运行，重新启动定时器
        if (this.stats.status === LoopStatus.RUNNING && this.callback) {
            this.clearTimers();
            this.intervalId = setInterval(() => {
                this.executeCallback();
            }, this.options.interval);

            console.log(`执行间隔已更新为: ${this.options.interval}ms`);
        }
    }

    /**
     * 立即执行一次回调（不影响定时循环）
     */
    executeOnce(): void {
        if (!this.callback) {
            console.warn('没有设置回调函数');
            return;
        }

        console.log('立即执行一次回调');
        this.executeCallback();
    }

    /**
     * 获取当前状态
     */
    getStatus(): LoopStatus {
        return this.stats.status;
    }

    /**
     * 获取统计信息
     */
    getStats(): Readonly<LoopStats> {
        return { ...this.stats };
    }

    /**
     * 检查是否正在运行
     */
    isRunning(): boolean {
        return this.stats.status === LoopStatus.RUNNING;
    }

    /**
     * 检查是否已暂停
     */
    isPaused(): boolean {
        return this.stats.status === LoopStatus.PAUSED;
    }

    /**
     * 检查是否已停止
     */
    isStopped(): boolean {
        return this.stats.status === LoopStatus.STOPPED;
    }

    /**
     * 重置统计信息
     */
    resetStats(): void {
        if (this.stats.status === LoopStatus.RUNNING) {
            console.warn('无法在运行时重置统计信息');
            return;
        }

        this.stats = this.initializeStats();
        console.log('统计信息已重置');
    }

    /**
     * 打印统计信息
     */
    logStats(): void {
        const duration = this.stats.startTime ? 
            Date.now() - this.stats.startTime : 0;
        
        console.log('循环执行统计信息:', {
            状态: this.stats.status,
            总执行次数: this.stats.totalExecutions,
            成功次数: this.stats.successExecutions,
            失败次数: this.stats.failedExecutions,
            成功率: this.stats.totalExecutions > 0 ? 
                `${((this.stats.successExecutions / this.stats.totalExecutions) * 100).toFixed(2)}%` : '0%',
            运行时长: `${(duration / 1000).toFixed(2)}秒`,
            执行间隔: `${this.options.interval}ms`,
        });
    }

    /**
     * 销毁循环执行器
     */
    destroy(): void {
        this.stop();
        this.resetStats();
        console.log('循环执行器已销毁');
    }
}

// ==================== 导出类型 ====================

export type { LoopCallback, LoopOptions, LoopStats };
export { LoopStatus };