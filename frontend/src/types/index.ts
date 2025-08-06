import { KLineData } from "klinecharts"

// K线数据类型：[时间戳, 开盘价, 最高价, 最低价, 收盘价, 成交量]
export type KLineDataItem = {
    timestamp: number,
    open: number,
    high: number,
    low: number,
    close: number,
    volume?: number,
}

// K线数据  要改成更全面的(*_*)
export type CandlestickDataItems = {
  '1d'?: KLineData[],
  '4h'?: KLineData[],
  '1h'?: KLineData[],
  '15m'?: KLineData[],
  '5m'?: KLineData[],
  [key: string]: KLineData[] | undefined,
}