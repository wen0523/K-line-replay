/**
 * 价格相关状态管理
 * 统一管理价格、回放状态、价格变化等相关状态
 */

import { create } from 'zustand';
import { PriceData, ReplayConfig, ReplayStatus } from '@/types';
import { DEFAULT_REPLAY_SPEED } from '@/constants';

// ==================== 价格状态接口 ====================

/**
 * 价格状态接口
 */
interface PriceState {
  /** 当前价格 */
  price: number;
  /** 价格变化量 */
  priceChange: number;
  /** 价格是否上涨 */
  priceUp: boolean;
  /** 价格变化百分比 */
  priceChangePercent: number;
  
  // 价格相关操作
  /** 设置当前价格 */
  setPrice: (price: number) => void;
  /** 设置价格变化 */
  setPriceChange: (change: number) => void;
  /** 设置价格涨跌状态 */
  setPriceUp: (isUp: boolean) => void;
  /** 设置价格变化百分比 */
  setPriceChangePercent: (percent: number) => void;
  /** 批量更新价格数据 */
  updatePriceData: (data: Partial<PriceData>) => void;
  /** 重置价格数据 */
  resetPriceData: () => void;
}

// ==================== 回放状态接口 ====================

/**
 * 回放状态接口
 */
interface ReplayState {
  /** 是否启用回放模式 */
  replay: boolean;
  /** 回放配置 */
  config: ReplayConfig;
  /** 回放状态 */
  status: ReplayStatus;
  
  // 回放相关操作
  /** 设置回放模式 */
  setReplay: (enabled: boolean) => void;
  /** 设置回放配置 */
  setReplayConfig: (config: Partial<ReplayConfig>) => void;
  /** 设置回放状态 */
  setReplayStatus: (status: ReplayStatus) => void;
  /** 开始回放 */
  startReplay: () => void;
  /** 暂停回放 */
  pauseReplay: () => void;
  /** 停止回放 */
  stopReplay: () => void;
  /** 重置回放 */
  resetReplay: () => void;
  /** 设置回放速度 */
  setReplaySpeed: (speed: number) => void;
  /** 跳转到指定位置 */
  seekTo: (index: number) => void;
}

// ==================== 价格状态Store ====================

/**
 * 价格状态管理Store
 * 管理当前价格、价格变化、涨跌状态等
 */
export const usePriceStore = create<PriceState>((set, get) => ({
  // 初始状态
  price: -1,
  priceChange: 0,
  priceUp: true,
  priceChangePercent: 0,

  // 设置当前价格
  setPrice: (price: number) => {
    set({ price });
  },

  // 设置价格变化
  setPriceChange: (priceChange: number) => {
    set({ priceChange });
  },

  // 设置价格涨跌状态
  setPriceUp: (priceUp: boolean) => {
    set({ priceUp });
  },

  // 设置价格变化百分比
  setPriceChangePercent: (priceChangePercent: number) => {
    set({ priceChangePercent });
  },

  // 批量更新价格数据
  updatePriceData: (data: Partial<PriceData>) => {
    set((state) => ({
      ...state,
      price: data.price ?? state.price,
      priceChange: data.change ?? state.priceChange,
      priceUp: data.isUp ?? state.priceUp,
      priceChangePercent: data.changePercent ?? state.priceChangePercent,
    }));
  },

  // 重置价格数据
  resetPriceData: () => {
    set({
      price: -1,
      priceChange: 0,
      priceUp: true,
      priceChangePercent: 0,
    });
  },
}));

// ==================== 回放状态Store ====================

/**
 * 回放状态管理Store
 * 管理回放模式、回放配置、回放状态等
 */
export const useReplayStore = create<ReplayState>((set, get) => ({
  // 初始状态
  replay: false,
  config: {
    speed: DEFAULT_REPLAY_SPEED,
    isPlaying: false,
    currentIndex: 0,
    totalLength: 0,
  },
  status: ReplayStatus.STOPPED,

  // 设置回放模式
  setReplay: (replay: boolean) => {
    set({ replay });
    if (!replay) {
      // 关闭回放时重置状态
      set({
        status: ReplayStatus.STOPPED,
        config: {
          ...get().config,
          isPlaying: false,
          currentIndex: 0,
        },
      });
    }
  },

  // 设置回放配置
  setReplayConfig: (newConfig: Partial<ReplayConfig>) => {
    set((state) => ({
      config: { ...state.config, ...newConfig },
    }));
  },

  // 设置回放状态
  setReplayStatus: (status: ReplayStatus) => {
    set({ status });
  },

  // 开始回放
  startReplay: () => {
    set((state) => ({
      replay: true,
      status: ReplayStatus.PLAYING,
      config: { ...state.config, isPlaying: true },
    }));
  },

  // 暂停回放
  pauseReplay: () => {
    set((state) => ({
      status: ReplayStatus.PAUSED,
      config: { ...state.config, isPlaying: false },
    }));
  },

  // 停止回放
  stopReplay: () => {
    set((state) => ({
      replay: false,
      status: ReplayStatus.STOPPED,
      config: {
        ...state.config,
        isPlaying: false,
        currentIndex: 0,
      },
    }));
  },

  // 重置回放
  resetReplay: () => {
    set({
      replay: false,
      status: ReplayStatus.STOPPED,
      config: {
        speed: DEFAULT_REPLAY_SPEED,
        isPlaying: false,
        currentIndex: 0,
        totalLength: 0,
      },
    });
  },

  // 设置回放速度
  setReplaySpeed: (speed: number) => {
    set((state) => ({
      config: { ...state.config, speed },
    }));
  },

  // 跳转到指定位置
  seekTo: (index: number) => {
    set((state) => {
      const clampedIndex = Math.max(0, Math.min(index, (state.config.totalLength || 0) - 1));
      return {
        config: { ...state.config, currentIndex: clampedIndex },
      };
    });
  },
}));

// ==================== 便捷Hooks ====================

/**
 * 获取价格相关状态的便捷Hook
 */
export const usePriceData = () => {
  const { price, priceChange, priceUp, priceChangePercent } = usePriceStore();
  return { price, priceChange, priceUp, priceChangePercent };
};

/**
 * 获取回放相关状态的便捷Hook
 */
export const useReplayData = () => {
  const { replay, config, status } = useReplayStore();
  return { replay, config, status };
};

// ==================== 兼容性导出 ====================
// 为了保持向后兼容，导出原有的单独store

/**
 * @deprecated 请使用 usePriceStore 替代
 */
export const usePriceUpStore = create<{
  priceUp: boolean;
  setPriceUp: (val: boolean) => void;
}>((set) => ({
  priceUp: true,
  setPriceUp: (val) => set({ priceUp: val }),
}));

/**
 * @deprecated 请使用 usePriceStore 替代
 */
export const usePriceChangeStore = create<{
  priceChange: number;
  setPriceChange: (val: number) => void;
}>((set) => ({
  priceChange: 0,
  setPriceChange: (val) => set({ priceChange: val }),
}));
