/**
 * 应用常量配置文件
 * 集中管理整个应用中使用的常量值
 */

import { ChartTheme, CryptoCurrency, TimeFrame } from '@/types';

// ==================== 时间周期相关常量 ====================

/**
 * 支持的时间周期列表
 */
export const TIME_FRAMES: TimeFrame[] = ['1d', '4h', '1h', '15m', '5m'];

/**
 * 时间周期显示名称映射
 */
export const TIME_FRAME_LABELS: Record<TimeFrame, string> = {
  '1d': '1天',
  '4h': '4小时',
  '1h': '1小时',
  '15m': '15分钟',
  '5m': '5分钟'
};

/**
 * 时间周期对应的分钟数
 */
export const TIME_FRAME_MINUTES: Record<TimeFrame, number> = {
  '1d': 1440,
  '4h': 240,
  '1h': 60,
  '15m': 15,
  '5m': 5
};

// ==================== 图表主题常量 ====================

/**
 * 默认图表主题配置
 */
export const DEFAULT_CHART_THEME: ChartTheme = {
  upColor: '#26a69a',           // 上涨蜡烛颜色（绿色）
  upBorderColor: '#26a69a',     // 上涨蜡烛边框颜色
  downColor: '#ef5350',         // 下跌蜡烛颜色（红色）
  downBorderColor: '#ef5350',   // 下跌蜡烛边框颜色
  crosshairColor: '#758696',    // 十字线颜色
  gridLineColor: '#131722',     // 网格线颜色
  tooltipBg: 'rgba(19, 23, 34, 0.85)',  // 工具提示背景色
  tooltipBorder: '#363c4e',     // 工具提示边框色
  tooltipTextColor: '#d1d4dc',  // 工具提示文字颜色
  volumeColor: '#3a3e5e',       // 成交量颜色
};

/**
 * 暗色主题配置
 */
export const DARK_CHART_THEME: ChartTheme = {
  ...DEFAULT_CHART_THEME,
  gridLineColor: '#2a2e39',
  tooltipBg: 'rgba(42, 46, 57, 0.9)',
  tooltipBorder: '#4a4e5e',
};

/**
 * 亮色主题配置
 */
export const LIGHT_CHART_THEME: ChartTheme = {
  ...DEFAULT_CHART_THEME,
  gridLineColor: '#e1e5e9',
  tooltipBg: 'rgba(255, 255, 255, 0.9)',
  tooltipBorder: '#d1d5db',
  tooltipTextColor: '#374151',
};

/**
 * 图表主题常量映射
 */
export const CHART_THEMES = {
  DEFAULT: 'light' as const,
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
} as const;

// ==================== 回放相关常量 ====================

/**
 * 回放速度选项
 */
export const REPLAY_SPEEDS = [0.5, 1, 2, 5, 10, 20] as const;

/**
 * 默认回放速度
 */
export const DEFAULT_REPLAY_SPEED = 1;

/**
 * 回放速度标签映射
 */
export const REPLAY_SPEED_LABELS: Record<number, string> = {
  0.5: '0.5x',
  1: '1x',
  2: '2x',
  5: '5x',
  10: '10x',
  20: '20x'
};

// ==================== 加密货币数据常量 ====================

/**
 * 支持的加密货币列表
 * 注意：在实际应用中，这些数据应该从API获取
 */
export const CRYPTO_CURRENCIES: CryptoCurrency[] = [
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    symbol: 'BTCUSDT', 
    isPopular: true 
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    symbol: 'ETHUSDT', 
    isPopular: true 
  },
  { 
    id: 'bnb', 
    name: 'Binance Coin', 
    symbol: 'BNBUSDT', 
    isPopular: true 
  },
  { 
    id: 'xrp', 
    name: 'Ripple', 
    symbol: 'XRPUSDT', 
    isPopular: false 
  },
  { 
    id: 'ada', 
    name: 'Cardano', 
    symbol: 'ADAUSDT', 
    isPopular: false 
  },
  { 
    id: 'sol', 
    name: 'Solana', 
    symbol: 'SOLUSDT', 
    isPopular: true 
  },
  { 
    id: 'dot', 
    name: 'Polkadot', 
    symbol: 'DOTUSDT', 
    isPopular: false 
  },
  { 
    id: 'doge', 
    name: 'Dogecoin', 
    symbol: 'DOGEUSDT', 
    isPopular: false 
  },
  { 
    id: 'avax', 
    name: 'Avalanche', 
    symbol: 'AVAXUSDT', 
    isPopular: false 
  },
  { 
    id: 'matic', 
    name: 'Polygon', 
    symbol: 'MATICUSDT', 
    isPopular: false 
  }
];

/**
 * 默认选中的加密货币
 */
export const DEFAULT_CRYPTO = CRYPTO_CURRENCIES[0]; // Bitcoin

// ==================== UI相关常量 ====================

/**
 * 图表容器默认高度
 */
export const CHART_DEFAULT_HEIGHT = 600;

/**
 * 图表容器默认宽度
 */
export const CHART_DEFAULT_WIDTH = 800;

/**
 * 侧边栏宽度
 */
export const SIDEBAR_WIDTH = 320;

/**
 * 头部高度
 */
export const HEADER_HEIGHT = 40;

// ==================== API相关常量 ====================

/**
 * API基础URL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * API端点路径
 */
export const API_ENDPOINTS = {
  KLINE_DATA: '/api/kline',
  SYMBOLS: '/api/symbols',
  ORDERS: '/api/orders',
} as const;

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 10000;

// ==================== 本地存储键名常量 ====================

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  THEME: 'app_theme',
  SELECTED_SYMBOL: 'selected_symbol',
  SELECTED_TIMEFRAME: 'selected_timeframe',
  CHART_CONFIG: 'chart_config',
  USER_PREFERENCES: 'user_preferences',
} as const;

// ==================== 错误消息常量 ====================

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  DATA_LOAD_ERROR: '数据加载失败，请稍后重试',
  INVALID_SYMBOL: '无效的交易对符号',
  INVALID_TIMEFRAME: '无效的时间周期',
  REPLAY_ERROR: '回放功能出现错误',
  ORDER_CREATE_ERROR: '创建订单失败',
  ORDER_CANCEL_ERROR: '取消订单失败',
} as const;

// ==================== 成功消息常量 ====================

/**
 * 成功消息常量
 */
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: '订单创建成功',
  ORDER_CANCELLED: '订单取消成功',
  DATA_LOADED: '数据加载完成',
  SETTINGS_SAVED: '设置保存成功',
} as const;