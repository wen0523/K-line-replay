/**
 * 时间周期状态管理
 * 管理K线图表的时间周期选择
 */

import { create } from 'zustand';

// ==================== 类型定义 ====================

/**
 * 支持的时间周期类型
 */
export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

/**
 * 时间周期状态接口
 */
interface TimeState {
  /** 当前选中的时间周期 */
  time: TimeFrame;
  /** 设置时间周期 */
  setTime: (timeFrame: TimeFrame) => void;
  /** 重置为默认时间周期 */
  resetTime: () => void;
  /** 验证时间周期格式 */
  isValidTimeFrame: (timeFrame: string) => boolean;
  /** 获取时间周期显示名称 */
  getTimeFrameLabel: (timeFrame?: TimeFrame) => string;
}

// ==================== 常量定义 ====================

/** 默认时间周期 */
const DEFAULT_TIME_FRAME: TimeFrame = '1d';

/** 支持的时间周期列表 */
const VALID_TIME_FRAMES: TimeFrame[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];

/** 时间周期显示名称映射 */
const TIME_FRAME_LABELS: Record<TimeFrame, string> = {
  '1m': '1分钟',
  '5m': '5分钟',
  '15m': '15分钟',
  '30m': '30分钟',
  '1h': '1小时',
  '4h': '4小时',
  '1d': '1天',
  '1w': '1周',
  '1M': '1月',
};

// ==================== 工具函数 ====================

/**
 * 验证时间周期格式
 */
const validateTimeFrame = (timeFrame: string): timeFrame is TimeFrame => {
  return VALID_TIME_FRAMES.includes(timeFrame as TimeFrame);
};

/**
 * 获取时间周期的显示标签
 */
const getLabel = (timeFrame: TimeFrame): string => {
  return TIME_FRAME_LABELS[timeFrame] || timeFrame;
};

// ==================== 时间周期状态Store ====================

/**
 * 时间周期状态管理Store
 */
export const useTimeStore = create<TimeState>((set, get) => ({
  // 初始状态
  time: DEFAULT_TIME_FRAME,

  // 设置时间周期
  setTime: (timeFrame: TimeFrame) => {
    // 验证时间周期格式
    if (!validateTimeFrame(timeFrame)) {
      console.warn('无效的时间周期:', timeFrame);
      return;
    }

    set({ time: timeFrame });
    console.log('时间周期已更新:', timeFrame, `(${getLabel(timeFrame)})`);
  },

  // 重置为默认时间周期
  resetTime: () => {
    set({ time: DEFAULT_TIME_FRAME });
    console.log('时间周期已重置为默认值:', DEFAULT_TIME_FRAME);
  },

  // 验证时间周期格式
  isValidTimeFrame: (timeFrame: string) => {
    return validateTimeFrame(timeFrame);
  },

  // 获取时间周期显示名称
  getTimeFrameLabel: (timeFrame?: TimeFrame) => {
    const currentTimeFrame = timeFrame || get().time;
    return getLabel(currentTimeFrame);
  },
}));

// ==================== 导出常量 ====================

export { VALID_TIME_FRAMES, TIME_FRAME_LABELS, DEFAULT_TIME_FRAME };
