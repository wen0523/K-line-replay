import * as echarts from 'echarts';

import type { KLineData } from '@/types';

// Theme colors for the chart
export const CHART_THEME = {
  upColor: '#26a69a',       // Green for up candles
  upBorderColor: '#26a69a',
  downColor: '#ef5350',     // Red for down candles
  downBorderColor: '#ef5350',
  crosshairColor: '#758696',
  gridLineColor: '#131722',
  tooltipBg: 'rgba(19, 23, 34, 0.85)',
  tooltipBorder: '#363c4e',
  tooltipTextColor: '#d1d4dc',
  volumeColor: '#3a3e5e',
  backgroundColor: '#131722'
};

export const useChartConfig = () => {
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
        padding: [8, 12],
        extraCssText: 'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25); border-radius: 4px;',
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
              <div style="font-family: Inter, system-ui, sans-serif; line-height: 1.5;">
                <div style="font-weight: 600; margin-bottom: 4px;">${date}</div>
                <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px;">
                  <span style="color: #a3a6af;">Open:</span><span>${open.toFixed(2)}</span>
                  <span style="color: #a3a6af;">High:</span><span>${high.toFixed(2)}</span>
                  <span style="color: #a3a6af;">Low:</span><span>${low.toFixed(2)}</span>
                  <span style="color: #a3a6af;">Close:</span><span>${close.toFixed(2)}</span>
                  <span style="color: #a3a6af;">Change:</span><span style="color:${changeColor}">${priceChangePercent > 0 ? '+' : ''}${priceChangePercent}%</span>
                  <span style="color: #a3a6af;">Amplitude:</span><span>${amplitude}%</span>
                  <span style="color: #a3a6af;">Volume:</span><span>${volume.toLocaleString()}</span>
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
          borderColor: 'rgba(58, 62, 94, 0.3)',
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
              color: '#363c4e'
            }
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#758696',
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
              color: 'rgba(58, 62, 94, 0.3)',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#758696',
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
          borderColor: '#3a3e5e',
          fillerColor: 'rgba(58, 62, 94, 0.15)',
          handleStyle: {
            color: '#758696',
            borderColor: '#758696'
          },
          textStyle: {
            color: '#758696'
          },
          start: 50,
          end: 100
        }
      ],

      animation: true,
      animationDuration: 300,
      animationEasing: 'linear',

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