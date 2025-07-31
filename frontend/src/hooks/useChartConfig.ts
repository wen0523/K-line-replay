import * as echarts from 'echarts';
import { useThemeStore } from '@/store/themeStore';

import type { KLineData } from '@/types';

// 浅色主题颜色配置
export const LIGHT_CHART_THEME = {
  upColor: '#16a34a',       // 上涨蜡烛颜色（绿色）
  upBorderColor: '#16a34a', // 上涨蜡烛边框颜色
  downColor: '#dc2626',     // 下跌蜡烛颜色（红色）
  downBorderColor: '#dc2626', // 下跌蜡烛边框颜色
  crosshairColor: '#6b7280', // 十字准线颜色
  gridLineColor: '#e5e7eb',  // 网格线颜色
  tooltipBg: 'rgba(255, 255, 255, 0.95)', // 提示框背景色
  tooltipBorder: '#d1d5db',  // 提示框边框颜色
  tooltipTextColor: '#374151', // 提示框文字颜色
  volumeColor: '#9ca3af',    // 成交量颜色
  backgroundColor: '#ffffff', // 图表背景色
  axisLabelColor: '#6b7280', // 坐标轴标签颜色
  splitLineColor: '#f3f4f6'  // 分割线颜色
};

// 深色主题颜色配置
export const DARK_CHART_THEME = {
  upColor: '#26a69a',       // 上涨蜡烛颜色（绿色）
  upBorderColor: '#26a69a', // 上涨蜡烛边框颜色
  downColor: '#ef5350',     // 下跌蜡烛颜色（红色）
  downBorderColor: '#ef5350', // 下跌蜡烛边框颜色
  crosshairColor: '#758696', // 十字准线颜色
  gridLineColor: '#131722',  // 网格线颜色
  tooltipBg: 'rgba(19, 23, 34, 0.95)', // 提示框背景色
  tooltipBorder: '#363c4e',  // 提示框边框颜色
  tooltipTextColor: '#d1d4dc', // 提示框文字颜色
  volumeColor: '#3a3e5e',    // 成交量颜色
  backgroundColor: '#131722', // 图表背景色
  axisLabelColor: '#758696', // 坐标轴标签颜色
  splitLineColor: 'rgba(58, 62, 94, 0.3)' // 分割线颜色
};

/**
 * K线图表配置Hook
 * 提供基于主题的图表配置选项
 */
export const useChartConfig = () => {
  // 获取当前主题状态
  const theme = useThemeStore((state) => state.theme);
  // 根据主题选择对应的颜色配置
  const CHART_THEME = theme === 'dark' ? DARK_CHART_THEME : LIGHT_CHART_THEME;

  /**
   * 生成ECharts配置选项
   * @param data K线数据数组
   * @returns ECharts配置对象
   */
  const getChartOption = (data: KLineData[]): echarts.EChartsOption => {
    return {
      // 图表背景色
      backgroundColor: CHART_THEME.backgroundColor,

      // 数据集配置
      dataset: {
        source: data
      },

      // 提示框配置
      tooltip: {
        trigger: 'axis',              // 坐标轴触发
        triggerOn: 'mousemove|click', // 鼠标移动或点击触发
        backgroundColor: CHART_THEME.tooltipBg,
        borderColor: CHART_THEME.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: CHART_THEME.tooltipTextColor,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: 12
        },
        padding: [12, 16],
        // 额外的CSS样式，添加阴影和圆角效果
        extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 8px; backdrop-filter: blur(10px);',
        // 坐标轴指示器配置
        axisPointer: {
          type: 'cross',              // 十字准线
          lineStyle: {
            color: CHART_THEME.crosshairColor,
            width: 1,
            type: 'dashed'            // 虚线样式
          },
        },
        // 自定义提示框内容格式化函数
        formatter: (params) => {
          if (Array.isArray(params)) {
            const data = params[0].data as KLineData;
            const [date, open, high, low, close, volume] = data;

            // 计算价格变化百分比
            const priceChangePercent = Number(((close - open) / open * 100).toFixed(2));
            // 根据涨跌确定颜色
            const changeColor = close >= open ? CHART_THEME.upColor : CHART_THEME.downColor;
            // 计算振幅百分比
            const amplitude = Math.abs(Number((((high - low) / low * 100).toFixed(2))));

            // 返回格式化的HTML内容
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

      // 网格配置 - 定义图表绘制区域
      grid: [
        {
          left: '2%',     // 左边距
          right: '6%',    // 右边距
          top: '8%',      // 上边距
          bottom: 30,    // 下边距（为缩放控件预留空间）
          borderColor: CHART_THEME.splitLineColor,
          show: true      // 显示网格边框
        },
      ],

      // X轴配置 - 时间轴
      xAxis: [
        {
          type: 'category',    // 类目轴类型
          boundaryGap: false,  // 不留白，数据点在刻度线上
          axisLine: {
            onZero: false,     // 不在零刻度线上
            lineStyle: {
              color: CHART_THEME.splitLineColor
            }
          },
          splitLine: {
            show: false        // 不显示分割线
          },
          axisLabel: {
            color: CHART_THEME.axisLabelColor,
            fontSize: 11,
          },
          axisPointer: {
            label: {
              show: false      // 不显示坐标轴指示器标签
            }
          },
          min: 'dataMin',      // 最小值为数据最小值
          max: 'dataMax'       // 最大值为数据最大值
        },
      ],

      // Y轴配置 - 价格轴
      yAxis: [
        {
          scale: true,         // 脱离0值比例，根据数据范围调整
          position: 'right',   // 位置在右侧
          splitLine: {
            show: true,        // 显示分割线
            lineStyle: {
              color: CHART_THEME.splitLineColor,
              type: 'dashed'   // 虚线样式
            }
          },
          axisLabel: {
            color: CHART_THEME.axisLabelColor,
            fontSize: 11,
            formatter: (value: number) => {
              return value.toFixed(2);  // 保留两位小数
            }
          },
          axisLine: {
            show: false        // 不显示坐标轴线
          }
        },
      ],

      // 缩放控制配置
      dataZoom: [
        {
          type: 'inside',      // 内置缩放，通过鼠标滚轮或触摸板
          xAxisIndex: [0],     // 控制第一个x轴
          start: 50,           // 初始显示数据的起始百分比
          end: 100,            // 初始显示数据的结束百分比
          minValueSpan: 10     // 最小显示数据量
        },
        // 缩略图滑块（已注释）
        // {
        //   show: true,
        //   xAxisIndex: [0],
        //   type: 'slider',
        //   bottom: 10,
        //   height: 40,
        //   borderColor: CHART_THEME.splitLineColor,
        //   fillerColor: theme === 'dark' ? 'rgba(58, 62, 94, 0.15)' : 'rgba(156, 163, 175, 0.15)',
        //   handleStyle: {
        //     color: CHART_THEME.axisLabelColor,
        //     borderColor: CHART_THEME.axisLabelColor
        //   },
        //   textStyle: {
        //     color: CHART_THEME.axisLabelColor
        //   },
        //   start: 50,
        //   end: 100
        // }
      ],

      // 动画配置
      animation: true,               // 启用动画
      animationDuration: 300,        // 初始动画时长（毫秒）
      animationEasing: 'cubicOut',   // 动画缓动效果

      // 系列配置 - K线图
      series: [
        {
          name: 'Candlestick',         // 系列名称
          type: 'candlestick',         // 蜡烛图类型
          animationDurationUpdate: 150, // 数据更新动画时长（毫秒）
          itemStyle: {
            color: CHART_THEME.upColor,           // 上涨蜡烛填充色
            color0: CHART_THEME.downColor,        // 下跌蜡烛填充色
            borderColor: CHART_THEME.upBorderColor,   // 上涨蜡烛边框色
            borderColor0: CHART_THEME.downBorderColor, // 下跌蜡烛边框色
            borderWidth: 1                        // 边框宽度
          },
          encode: {
            x: 0,              // x轴对应数据的第0列（日期）
            y: [1, 4, 3, 2]    // y轴对应数据的第1,4,3,2列（开盘价、收盘价、最低价、最高价）
          }
        },
      ]
    };
  };

  // 返回图表配置函数和主题配置
  return {
    getChartOption, // 获取图表配置选项的函数
    CHART_THEME     // 当前主题的颜色配置
  };
};