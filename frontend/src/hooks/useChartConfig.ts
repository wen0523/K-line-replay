import * as echarts from 'echarts';
import { useThemeStore } from '@/store/themeStore';

import type { KLineData } from '@/types';

// Light theme colors
export const LIGHT_CHART_THEME = {
  upColor: '#16a34a',       // Green for up candles
  upBorderColor: '#16a34a',
  downColor: '#dc2626',     // Red for down candles
  downBorderColor: '#dc2626',
  crosshairColor: '#6b7280',
  gridLineColor: '#e5e7eb',
  tooltipBg: 'rgba(255, 255, 255, 0.95)',
  tooltipBorder: '#d1d5db',
  tooltipTextColor: '#374151',
  volumeColor: '#9ca3af',
  backgroundColor: '#ffffff',
  axisLabelColor: '#6b7280',
  splitLineColor: '#f3f4f6'
};

// Dark theme colors
export const DARK_CHART_THEME = {
  upColor: '#26a69a',       // Green for up candles
  upBorderColor: '#26a69a',
  downColor: '#ef5350',     // Red for down candles
  downBorderColor: '#ef5350',
  crosshairColor: '#758696',
  gridLineColor: '#131722',
  tooltipBg: 'rgba(19, 23, 34, 0.95)',
  tooltipBorder: '#363c4e',
  tooltipTextColor: '#d1d4dc',
  volumeColor: '#3a3e5e',
  backgroundColor: '#131722',
  axisLabelColor: '#758696',
  splitLineColor: 'rgba(58, 62, 94, 0.3)'
};

export const useChartConfig = () => {
  const theme = useThemeStore((state) => state.theme);
  const CHART_THEME = theme === 'dark' ? DARK_CHART_THEME : LIGHT_CHART_THEME;

  const getChartOption = (data: KLineData[]): echarts.EChartsOption => {
    return {
      backgroundColor: CHART_THEME.backgroundColor,

      // Dataset configuration
      dataset: {
        source: data
      },

      // Tooltip configuration
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove|click',
        backgroundColor: CHART_THEME.tooltipBg,
        borderColor: CHART_THEME.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: CHART_THEME.tooltipTextColor,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: 12
        },
        padding: [12, 16],
        extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 8px; backdrop-filter: blur(10px);',
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: CHART_THEME.crosshairColor,
            width: 1,
            type: 'dashed'
          },
        },
        formatter: (params) => {
          if (Array.isArray(params)) {
            const data = params[0].data as KLineData;
            const [date, open, high, low, close, volume] = data;

            // Calculate price change percentage
            const priceChangePercent = Number(((close - open) / open * 100).toFixed(2));
            const changeColor = close >= open ? CHART_THEME.upColor : CHART_THEME.downColor;
            const amplitude = Math.abs(Number((((high - low) / low * 100).toFixed(2))));

            return `
              <div style="font-family: Inter, system-ui, sans-serif; line-height: 1.6;">
                <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${date}</div>
                <div style="display: grid; grid-template-columns: auto auto; gap: 6px 16px; font-size: 12px;">
                  <span style="color: ${CHART_THEME.tooltipTextColor}; opacity: 0.7;">Open:</span><span style="font-weight: 500;">${open.toFixed(2)}</span>
                  <span style="color: ${CHART_THEME.tooltipTextColor}; opacity: 0.7;">High:</span><span style="font-weight: 500;">${high.toFixed(2)}</span>
                  <span style="color: ${CHART_THEME.tooltipTextColor}; opacity: 0.7;">Low:</span><span style="font-weight: 500;">${low.toFixed(2)}</span>
                  <span style="color: ${CHART_THEME.tooltipTextColor}; opacity: 0.7;">Close:</span><span style="font-weight: 500;">${close.toFixed(2)}</span>
                  <span style="color: ${CHART_THEME.tooltipTextColor}; opacity: 0.7;">Change:</span><span style="color:${changeColor}; font-weight: 600;">${priceChangePercent > 0 ? '+' : ''}${priceChangePercent}%</span>
                  <span style="color: ${CHART_THEME.tooltipTextColor}; opacity: 0.7;">Amplitude:</span><span style="font-weight: 500;">${amplitude}%</span>
                  <span style="color: ${CHART_THEME.tooltipTextColor}; opacity: 0.7;">Volume:</span><span style="font-weight: 500;">${volume.toLocaleString()}</span>
                </div>
              </div>
            `;
          } else {
            return `<div>Data not available</div>`;
          }
        }
      },

      // Grid configuration
      grid: [
        {
          left: '2%',
          right: '6%',
          top: '8%',
          bottom: 100,
          borderColor: CHART_THEME.splitLineColor,
          show: true
        },
      ],

      // X-axis configuration
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: CHART_THEME.splitLineColor
            }
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: CHART_THEME.axisLabelColor,
            fontSize: 11,
          },
          axisPointer: {
            label: {
              show: false
            }
          },
          min: 'dataMin',
          max: 'dataMax'
        },
      ],

      // Y-axis configuration
      yAxis: [
        {
          scale: true,
          position: 'right',
          splitLine: {
            show: true,
            lineStyle: {
              color: CHART_THEME.splitLineColor,
              type: 'dashed'
            }
          },
          axisLabel: {
            color: CHART_THEME.axisLabelColor,
            fontSize: 11,
            formatter: (value: number) => {
              return value.toFixed(2);
            }
          },
          axisLine: {
            show: false
          }
        },
      ],

      // Zoom control configuration
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 50,
          end: 100,
          minValueSpan: 10
        },
        {
          show: true,
          xAxisIndex: [0],
          type: 'slider',
          bottom: 10,
          height: 40,
          borderColor: CHART_THEME.splitLineColor,
          fillerColor: theme === 'dark' ? 'rgba(58, 62, 94, 0.15)' : 'rgba(156, 163, 175, 0.15)',
          handleStyle: {
            color: CHART_THEME.axisLabelColor,
            borderColor: CHART_THEME.axisLabelColor
          },
          textStyle: {
            color: CHART_THEME.axisLabelColor
          },
          start: 50,
          end: 100
        }
      ],

      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut',

      // Series configuration
      series: [
        {
          name: 'Candlestick',
          type: 'candlestick',
          animationDurationUpdate: 150,
          itemStyle: {
            color: CHART_THEME.upColor,
            color0: CHART_THEME.downColor,
            borderColor: CHART_THEME.upBorderColor,
            borderColor0: CHART_THEME.downBorderColor,
            borderWidth: 1
          },
          encode: {
            x: 0,
            y: [1, 4, 3, 2]
          }
        },
      ]
    };
  };

  return {
    getChartOption,
    CHART_THEME
  };
};