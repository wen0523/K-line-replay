// src/lib/indicators/config.ts
export const indicatorConfig = {
  MA:    { name: '移动平均线', params: [5, 10, 30, 60] },
  EMA:   { name: '指数平滑移动平均线', params: [6, 12, 20] },
  SMA:   { name: '简单移动平均线', params: [12, 2] },
  BBI:   { name: '多重均线指标', params: [3, 6, 12, 24] },
  VOL:   { name: '成交量均线', params: [5, 10, 20] },
  MACD:  { name: '平滑异同移动平均线', params: [12, 26, 9] },
  BOLL:  { name: '布林带', params: [20, 2] },
  KDJ:   { name: '随机指标', params: [9, 3, 3] },
  RSI:   { name: '相对强弱指数', params: [6, 12, 24] },
  BIAS:  { name: '乖离率', params: [6, 12, 24] },
  BRAR:  { name: '情绪指标（BR/AR）', params: [26] },
  CCI:   { name: '顺势指标', params: [13] },
  DMI:   { name: '趋向指标', params: [14, 6] },
  CR:    { name: '能量指标', params: [26, 10, 20, 40, 60] },
  PSY:   { name: '心理线', params: [12, 6] },
  DMA:   { name: '平均差指标', params: [10, 50, 10] },
  TRIX:  { name: '三重指数平滑平均线', params: [12, 20] },
  OBV:   { name: '能量潮', params: [30] },
  VR:    { name: '成交量比率', params: [24, 30] },
  WR:    { name: '威廉指标', params: [6, 10, 14] },
  MTM:   { name: '动量指标', params: [6, 10] },
  EMV:   { name: '简易波动指标', params: [14, 9] },
  SAR:   { name: '抛物线转向指标', params: [2, 2, 20] },
  AO:    { name: '超级振荡器', params: [5, 34] },
  ROC:   { name: '变动率指标', params: [12, 6] },
  PVT:   { name: '价量趋势', params: [] },
  AVP:   { name: '平均价格线', params: [] }
} as const;

export type IndicatorKey = keyof typeof indicatorConfig;
