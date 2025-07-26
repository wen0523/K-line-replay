/**
 * 资产状态管理
 * 管理用户的资产余额和相关操作
 */

import { create } from 'zustand';

// ==================== 类型定义 ====================

/**
 * 资产状态接口
 */
interface AssetsState {
    /** 当前资产余额 */
    assets: number;
    /** 设置资产余额 */
    setAssets: (amount: number) => void;
    /** 增加资产 */
    addAssets: (amount: number) => void;
    /** 减少资产 */
    subtractAssets: (amount: number) => void;
    /** 重置资产为默认值 */
    resetAssets: () => void;
    /** 验证资产金额 */
    isValidAmount: (amount: number) => boolean;
    /** 检查是否有足够资产 */
    hasSufficientAssets: (amount: number) => boolean;
    /** 格式化资产显示 */
    formatAssets: (amount?: number) => string;
}

// ==================== 常量定义 ====================

/** 默认资产金额 */
const DEFAULT_ASSETS = 100;

/** 最小资产金额 */
const MIN_ASSETS = 0;

/** 最大资产金额 */
const MAX_ASSETS = 999999999;

// ==================== 工具函数 ====================

/**
 * 验证资产金额是否有效
 */
const validateAmount = (amount: number): boolean => {
    return typeof amount === 'number' && 
           !isNaN(amount) && 
           isFinite(amount) && 
           amount >= MIN_ASSETS && 
           amount <= MAX_ASSETS;
};

/**
 * 格式化资产金额显示
 */
const formatAmount = (amount: number): string => {
    if (!validateAmount(amount)) {
        return '0.00';
    }
    
    // 保留两位小数
    return amount.toFixed(2);
};

/**
 * 安全地执行数学运算
 */
const safeAdd = (a: number, b: number): number => {
    const result = a + b;
    return Math.min(Math.max(result, MIN_ASSETS), MAX_ASSETS);
};

const safeSubtract = (a: number, b: number): number => {
    const result = a - b;
    return Math.min(Math.max(result, MIN_ASSETS), MAX_ASSETS);
};

// ==================== 资产状态Store ====================

/**
 * 资产状态管理Store
 */
export const useAssetsStore = create<AssetsState>((set, get) => ({
    // 初始状态
    assets: DEFAULT_ASSETS,

    // 设置资产余额
    setAssets: (amount: number) => {
        // 验证金额
        if (!validateAmount(amount)) {
            console.warn('无效的资产金额:', amount);
            return;
        }

        set({ assets: amount });
        console.log('资产已更新:', formatAmount(amount));
    },

    // 增加资产
    addAssets: (amount: number) => {
        if (!validateAmount(amount) || amount <= 0) {
            console.warn('无效的增加金额:', amount);
            return;
        }

        const currentAssets = get().assets;
        const newAssets = safeAdd(currentAssets, amount);
        
        set({ assets: newAssets });
        console.log('资产已增加:', formatAmount(amount), '当前余额:', formatAmount(newAssets));
    },

    // 减少资产
    subtractAssets: (amount: number) => {
        if (!validateAmount(amount) || amount <= 0) {
            console.warn('无效的减少金额:', amount);
            return;
        }

        const currentAssets = get().assets;
        
        // 检查是否有足够资产
        if (currentAssets < amount) {
            console.warn('资产不足，无法减少:', amount, '当前余额:', formatAmount(currentAssets));
            return;
        }

        const newAssets = safeSubtract(currentAssets, amount);
        
        set({ assets: newAssets });
        console.log('资产已减少:', formatAmount(amount), '当前余额:', formatAmount(newAssets));
    },

    // 重置资产为默认值
    resetAssets: () => {
        set({ assets: DEFAULT_ASSETS });
        console.log('资产已重置为默认值:', formatAmount(DEFAULT_ASSETS));
    },

    // 验证资产金额
    isValidAmount: (amount: number) => {
        return validateAmount(amount);
    },

    // 检查是否有足够资产
    hasSufficientAssets: (amount: number) => {
        if (!validateAmount(amount)) {
            return false;
        }
        
        const currentAssets = get().assets;
        return currentAssets >= amount;
    },

    // 格式化资产显示
    formatAssets: (amount?: number) => {
        const targetAmount = amount !== undefined ? amount : get().assets;
        return formatAmount(targetAmount);
    },
}));

// ==================== 导出常量 ====================

export { DEFAULT_ASSETS, MIN_ASSETS, MAX_ASSETS };