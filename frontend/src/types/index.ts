/**
 * 基础类型定义文件
 * 定义了整个应用中使用的核心数据类型
 */

// ==================== K线相关类型 ====================

/**
 * K线数据类型
 * 数组格式：[时间戳, 开盘价, 最高价, 最低价, 收盘价, 成交量]
 */
export type KLineData = [string, number, number, number, number, number];

/**
 * 不同时间周期的K线数据集合
 */
export interface KLineDataSet {
  '1d'?: KLineData[];
  '4h'?: KLineData[];
  '1h'?: KLineData[];
  '15m'?: KLineData[];
  '5m'?: KLineData[];
}

/**
 * 支持的时间周期类型
 */
export type TimeFrame = '1d' | '4h' | '1h' | '15m' | '5m';

// ==================== 回放相关类型 ====================

/**
 * 回放配置接口
 */
export interface ReplayConfig {
  /** 回放速度倍数 */
  speed: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前播放索引 */
  currentIndex: number;
  /** 总数据长度 */
  totalLength?: number;
}

/**
 * 回放状态枚举
 */
export enum ReplayStatus {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

// ==================== 价格相关类型 ====================

/**
 * 价格数据接口
 */
export interface PriceData {
  /** 当前价格 */
  price: number;
  /** 价格变化量 */
  change: number;
  /** 价格变化百分比 */
  changePercent: number;
  /** 价格是否上涨 */
  isUp: boolean;
}

/**
 * 实时价格更新数据
 */
export interface PriceUpdate {
  /** 交易对符号 */
  symbol: string;
  /** 价格数据 */
  priceData: PriceData;
  /** 更新时间戳 */
  timestamp: number;
}

// ==================== 交易相关类型 ====================

/**
 * 订单类型枚举
 */
export enum OrderType {
  BUY = 'buy',
  SELL = 'sell'
}

/**
 * 持仓类型枚举
 */
export enum PositionType {
  LONG = 'long',
  SHORT = 'short'
}

/**
 * 仓位模式枚举
 */
export enum MarginMode {
  ISOLATED = '逐仓',
  CROSS = '全仓'
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  LIQUIDATED = 'liquidated'
}

/**
 * 订单接口
 */
export interface Order {
  /** 订单ID */
  id: string;
  /** 交易对符号 */
  symbol: string;
  /** 持仓类型（做多/做空） */
  type: 'long' | 'short';
  /** 订单金额 */
  amount: number;
  /** 开仓价格 */
  price: number;
  /** 杠杆倍数 */
  leverage: number;
  /** 仓位模式 */
  positionType: '逐仓' | '全仓';
  /** 止损价格（可选） */
  stopLoss?: number;
  /** 止盈价格（可选） */
  takeProfit?: number;
  /** 强制平仓价格（可选） */
  liquidationPrice?: number;
  /** 订单状态 */
  status: 'pending' | 'active' | 'filled' | 'cancelled' | 'liquidated';
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 平仓时间（可选） */
  closedAt?: string;
  /** 实现盈亏（可选） */
  pnl?: number;
}

// ==================== 加密货币相关类型 ====================

/**
 * 加密货币信息接口
 */
export interface CryptoCurrency {
  /** 唯一标识符 */
  id: string;
  /** 货币名称 */
  name: string;
  /** 交易符号 */
  symbol: string;
  /** 图标URL（可选） */
  iconUrl?: string;
  /** 是否为热门货币 */
  isPopular?: boolean;
}

// ==================== 图表相关类型 ====================

/**
 * 图表主题配置
 */
export interface ChartTheme {
  /** 上涨颜色 */
  upColor: string;
  /** 上涨边框颜色 */
  upBorderColor: string;
  /** 下跌颜色 */
  downColor: string;
  /** 下跌边框颜色 */
  downBorderColor: string;
  /** 十字线颜色 */
  crosshairColor: string;
  /** 网格线颜色 */
  gridLineColor: string;
  /** 工具提示背景色 */
  tooltipBg: string;
  /** 工具提示边框色 */
  tooltipBorder: string;
  /** 工具提示文字颜色 */
  tooltipTextColor: string;
  /** 成交量颜色 */
  volumeColor: string;
}

/**
 * 图表配置接口
 */
export interface ChartConfig {
  /** 图表主题 */
  theme: ChartTheme;
  /** 是否显示成交量 */
  showVolume: boolean;
  /** 是否显示网格 */
  showGrid: boolean;
  /** 是否显示十字线 */
  showCrosshair: boolean;
}

// ==================== API相关类型 ====================

/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  message?: string;
  /** 错误代码 */
  code?: number;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  /** 页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** 分页信息 */
  pagination: {
    /** 当前页 */
    page: number;
    /** 每页数量 */
    pageSize: number;
    /** 总数量 */
    total: number;
    /** 总页数 */
    totalPages: number;
  };
}