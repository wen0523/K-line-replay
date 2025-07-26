// 基础类型定义

// K线数据类型：[时间戳, 开盘价, 最高价, 最低价, 收盘价, 成交量]
export type KLineData = [string, number, number, number, number, number];

export interface ReplayConfig {
  speed: number;
  isPlaying: boolean;
  currentIndex: number;
}

export interface PriceData {
  price: number;
  change: number;
  changePercent: number;
}