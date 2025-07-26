/**
 * 交易对符号状态管理
 * 管理当前选中的交易对符号
 */

import { create } from 'zustand';

// ==================== 类型定义 ====================

/**
 * 交易对状态接口
 */
interface SymbolState {
  /** 当前选中的交易对符号 */
  symbol: string;
  /** 设置交易对符号 */
  setSymbol: (symbol: string) => void;
  /** 重置为默认交易对 */
  resetSymbol: () => void;
  /** 验证交易对格式 */
  isValidSymbol: (symbol: string) => boolean;
}

// ==================== 常量定义 ====================

/** 默认交易对 */
const DEFAULT_SYMBOL = 'BTC/USDT';

// ==================== 工具函数 ====================

/**
 * 验证交易对符号格式
 */
const validateSymbol = (symbol: string): boolean => {
  // 基本格式验证：包含斜杠分隔符
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }
  
  // 检查是否包含斜杠
  const parts = symbol.split('/');
  if (parts.length !== 2) {
    return false;
  }
  
  // 检查基础货币和计价货币是否有效
  const [base, quote] = parts;
  return base.length > 0 && quote.length > 0;
};

// ==================== 交易对状态Store ====================

/**
 * 交易对状态管理Store
 */
export const useSymbolStore = create<SymbolState>((set, get) => ({
  // 初始状态
  symbol: DEFAULT_SYMBOL,

  // 设置交易对符号
  setSymbol: (symbol: string) => {
    // 验证符号格式
    if (!validateSymbol(symbol)) {
      console.warn('无效的交易对格式:', symbol);
      return;
    }

    // 标准化符号格式（转为大写）
    const normalizedSymbol = symbol.toUpperCase();
    
    set({ symbol: normalizedSymbol });
    console.log('交易对已更新:', normalizedSymbol);
  },

  // 重置为默认交易对
  resetSymbol: () => {
    set({ symbol: DEFAULT_SYMBOL });
    console.log('交易对已重置为默认值:', DEFAULT_SYMBOL);
  },

  // 验证交易对格式
  isValidSymbol: (symbol: string) => {
    return validateSymbol(symbol);
  },
}));
