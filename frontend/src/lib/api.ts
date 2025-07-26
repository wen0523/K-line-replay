/**
 * API 客户端配置
 * 提供统一的HTTP请求接口和拦截器配置
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 扩展axios类型定义，添加自定义属性
declare module 'axios' {
    interface AxiosRequestConfig {
        metadata?: {
            requestId?: string;
        };
    }
    
    interface InternalAxiosRequestConfig {
        metadata?: {
            requestId?: string;
        };
    }
}

// ==================== 类型定义 ====================

/**
 * API响应数据结构
 */
interface ApiResponse<T = any> {
    /** 请求是否成功 */
    success: boolean;
    /** 响应数据 */
    data?: T;
    /** 错误消息 */
    message?: string;
    /** 错误代码 */
    code?: string | number;
    /** 时间戳 */
    timestamp?: string;
}

/**
 * 请求配置选项
 */
interface RequestOptions extends AxiosRequestConfig {
    /** 是否显示加载状态 */
    showLoading?: boolean;
    /** 是否显示错误提示 */
    showError?: boolean;
    /** 重试次数 */
    retryCount?: number;
    /** 重试延迟（毫秒） */
    retryDelay?: number;
}

// ==================== 常量定义 ====================

/** 默认API基础URL */
const DEFAULT_BASE_URL = 'http://localhost:8000';

/** 请求超时时间（毫秒） */
const REQUEST_TIMEOUT = 30000;

/** 默认重试次数 */
const DEFAULT_RETRY_COUNT = 3;

/** 默认重试延迟（毫秒） */
const DEFAULT_RETRY_DELAY = 1000;

/** HTTP状态码映射 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '禁止访问',
    404: '请求的资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    429: '请求过于频繁',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
};

// ==================== 工具函数 ====================

/**
 * 获取错误消息
 * @param error 错误对象
 * @returns 错误消息字符串
 */
const getErrorMessage = (error: AxiosError): string => {
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;
        
        // 优先使用服务器返回的错误消息
        if (data?.message) {
            return data.message;
        }
        
        // 使用预定义的状态码消息
        if (HTTP_STATUS_MESSAGES[status]) {
            return HTTP_STATUS_MESSAGES[status];
        }
        
        return `HTTP错误 ${status}`;
    } else if (error.request) {
        return '网络连接失败，请检查网络设置';
    } else {
        return error.message || '未知错误';
    }
};

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 */
const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 获取认证令牌
 * @returns 认证令牌或null
 */
const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
};

/**
 * 设置认证令牌
 * @param token 认证令牌
 * @param persistent 是否持久化存储
 */
const setAuthToken = (token: string, persistent: boolean = true): void => {
    if (typeof window !== 'undefined') {
        if (persistent) {
            localStorage.setItem('auth_token', token);
        } else {
            sessionStorage.setItem('auth_token', token);
        }
    }
};

/**
 * 清除认证令牌
 */
const clearAuthToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
    }
};

// ==================== API客户端类 ====================

/**
 * API客户端类
 * 提供统一的HTTP请求接口
 */
class ApiClient {
    public instance: AxiosInstance;
    private requestQueue: Map<string, AbortController> = new Map();

    constructor() {
        this.instance = this.createInstance();
        this.setupInterceptors();
    }

    /**
     * 创建axios实例
     */
    private createInstance(): AxiosInstance {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL;
        
        return axios.create({
            baseURL,
            timeout: REQUEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // 允许跨域携带Cookie
        });
    }

    /**
     * 设置请求和响应拦截器
     */
    private setupInterceptors(): void {
        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                // 添加认证令牌
                const token = getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // 添加请求ID用于取消重复请求
                const requestId = this.generateRequestId(config);
                config.metadata = { requestId };

                // 取消相同的待处理请求
                if (this.requestQueue.has(requestId)) {
                    this.requestQueue.get(requestId)?.abort();
                }

                // 创建新的取消控制器
                const controller = new AbortController();
                config.signal = controller.signal;
                this.requestQueue.set(requestId, controller);

                console.log(`发起请求: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('请求拦截器错误:', error);
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                // 清理请求队列
                const requestId = response.config.metadata?.requestId;
                if (requestId) {
                    this.requestQueue.delete(requestId);
                }

                console.log(`请求成功: ${response.config.method?.toUpperCase()} ${response.config.url}`);
                return response;
            },
            async (error: AxiosError) => {
                // 清理请求队列
                const requestId = error.config?.metadata?.requestId;
                if (requestId) {
                    this.requestQueue.delete(requestId);
                }

                // 处理401未授权错误
                if (error.response?.status === 401) {
                    clearAuthToken();
                    // 可以在这里触发登录页面跳转
                    console.warn('认证失效，请重新登录');
                }

                // 处理网络错误重试
                const config = error.config as RequestOptions;
                if (this.shouldRetry(error, config)) {
                    return this.retryRequest(config);
                }

                const errorMessage = getErrorMessage(error);
                console.error('请求失败:', errorMessage);
                
                return Promise.reject(error);
            }
        );
    }

    /**
     * 生成请求ID
     * @param config 请求配置
     * @returns 请求ID
     */
    private generateRequestId(config: AxiosRequestConfig): string {
        const { method, url, params, data } = config;
        return `${method}_${url}_${JSON.stringify(params)}_${JSON.stringify(data)}`;
    }

    /**
     * 判断是否应该重试
     * @param error 错误对象
     * @param config 请求配置
     * @returns 是否应该重试
     */
    private shouldRetry(error: AxiosError, config?: RequestOptions): boolean {
        if (!config || (config.retryCount ?? DEFAULT_RETRY_COUNT) === 0) {
            return false;
        }

        // 只对网络错误和5xx错误进行重试
        const isNetworkError = !error.response;
        const isServerError = !!(error.response && error.response.status >= 500);
        
        return isNetworkError || isServerError;
    }

    /**
     * 重试请求
     * @param config 请求配置
     * @returns Promise
     */
    private async retryRequest(config: RequestOptions): Promise<AxiosResponse> {
        const retryCount = (config.retryCount || DEFAULT_RETRY_COUNT) - 1;
        const retryDelay = config.retryDelay || DEFAULT_RETRY_DELAY;

        console.log(`请求重试，剩余次数: ${retryCount}`);
        
        await delay(retryDelay);
        
        // 从config中提取标准axios属性，移除自定义属性
        const { showLoading, showError, retryCount: _, retryDelay: __, ...axiosConfig } = config;
        
        return this.instance({
            ...axiosConfig,
        });
    }

    /**
     * GET请求
     */
    async get<T = any>(url: string, config?: RequestOptions): Promise<ApiResponse<T>> {
        const response = await this.instance.get(url, config);
        return response.data;
    }

    /**
     * POST请求
     */
    async post<T = any>(url: string, data?: any, config?: RequestOptions): Promise<ApiResponse<T>> {
        const response = await this.instance.post(url, data, config);
        return response.data;
    }

    /**
     * PUT请求
     */
    async put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<ApiResponse<T>> {
        const response = await this.instance.put(url, data, config);
        return response.data;
    }

    /**
     * DELETE请求
     */
    async delete<T = any>(url: string, config?: RequestOptions): Promise<ApiResponse<T>> {
        const response = await this.instance.delete(url, config);
        return response.data;
    }

    /**
     * 取消所有待处理的请求
     */
    cancelAllRequests(): void {
        this.requestQueue.forEach((controller) => {
            controller.abort();
        });
        this.requestQueue.clear();
        console.log('已取消所有待处理的请求');
    }

    /**
     * 取消指定的请求
     * @param requestId 请求ID
     */
    cancelRequest(requestId: string): void {
        const controller = this.requestQueue.get(requestId);
        if (controller) {
            controller.abort();
            this.requestQueue.delete(requestId);
            console.log(`已取消请求: ${requestId}`);
        }
    }
}

// ==================== 导出实例和工具函数 ====================

/** API客户端实例 */
const apiClient = new ApiClient();

/** 默认导出axios实例（向后兼容） */
export default apiClient.instance;

/** 导出API客户端实例 */
export { apiClient };

/** 导出认证相关工具函数 */
export { getAuthToken, setAuthToken, clearAuthToken };

/** 导出类型定义 */
export type { ApiResponse, RequestOptions };