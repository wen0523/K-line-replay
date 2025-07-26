/**
 * 图表渲染器组件
 * 专门负责ECharts图表的初始化、配置和渲染
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as echarts from 'echarts';
import { KLineData, ChartTheme } from '@/types';
import { DEFAULT_CHART_THEME, CHART_DEFAULT_HEIGHT } from '@/constants';

// ==================== 组件接口定义 ====================

/**
 * 图表渲染器属性接口
 */
interface ChartRendererProps {
  /** K线数据 */
  data: KLineData[];
  /** 图表主题配置 */
  theme?: ChartTheme;
  /** 图表高度 */
  height?: number;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 图表更新回调 */
  onChartReady?: (chart: echarts.ECharts) => void;
}

/**
 * 图表渲染器引用接口
 */
export interface ChartRendererRef {
  /** 获取图表实例 */
  getChart: () => echarts.ECharts | null;
  /** 更新图表数据 */
  updateData: (data: KLineData[]) => void;
  /** 调整图表大小 */
  resize: () => void;
  /** 销毁图表 */
  dispose: () => void;
}

// ==================== 图表配置生成函数 ====================

/**
 * 生成ECharts配置选项
 */
const generateChartOption = (data: KLineData[], theme: ChartTheme): echarts.EChartsOption => {
  // 处理数据格式 - ECharts candlestick需要 [open, close, low, high] 格式
  const processedData = data.map(item => [
    Number(item[1]), // 开盘价
    Number(item[4]), // 收盘价
    Number(item[3]), // 最低价
    Number(item[2]), // 最高价
  ]);

  return {
    // 图表标题配置
    title: {
      text: '',
      left: 'center',
      textStyle: {
        color: theme.tooltipTextColor,
        fontSize: 16,
      },
    },

    // 工具提示配置
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: theme.crosshairColor,
          width: 1,
          opacity: 0.8,
        },
      },
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: theme.tooltipTextColor,
        fontSize: 12,
      },
      formatter: (params: any) => {
        const seriesData = params[0];
        if (!seriesData || !seriesData.data) return '';
        
        // 从原始数据中获取信息，使用dataIndex来定位
        const dataIndex = seriesData.dataIndex;
        if (dataIndex >= 0 && dataIndex < data.length) {
          const originalData = data[dataIndex];
          const [time, open, high, low, close, volume] = originalData;
          
          // 确保数值类型转换
          const openPrice = Number(open);
          const closePrice = Number(close);
          const highPrice = Number(high);
          const lowPrice = Number(low);
          const volumeAmount = Number(volume);
          
          const change = closePrice - openPrice;
          const changePercent = ((change / openPrice) * 100).toFixed(2);
          
          return `
            <div style="padding: 8px;">
              <div style="margin-bottom: 4px; font-weight: bold;">${time}</div>
              <div>开盘: ${openPrice.toFixed(2)}</div>
              <div>收盘: ${closePrice.toFixed(2)}</div>
              <div>最高: ${highPrice.toFixed(2)}</div>
              <div>最低: ${lowPrice.toFixed(2)}</div>
              <div>涨跌: <span style="color: ${change >= 0 ? theme.upColor : theme.downColor}">${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent}%)</span></div>
              <div>成交量: ${volumeAmount.toLocaleString()}</div>
            </div>
          `;
        }
        
        return '';
      },
    },

    // 图例配置
    legend: {
      data: ['K线'],
      textStyle: {
        color: theme.tooltipTextColor,
      },
    },

    // 网格配置
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      borderColor: theme.gridLineColor,
    },

    // X轴配置
    xAxis: {
      type: 'category',
      data: data.map(item => item[0]),
      axisLine: {
        lineStyle: {
          color: theme.gridLineColor,
        },
      },
      axisLabel: {
        color: theme.tooltipTextColor,
        fontSize: 10,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: theme.gridLineColor,
          opacity: 0.3,
        },
      },
    },

    // Y轴配置
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: {
        lineStyle: {
          color: theme.gridLineColor,
        },
      },
      axisLabel: {
        color: theme.tooltipTextColor,
        fontSize: 10,
        formatter: (value: number) => value.toFixed(2),
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: theme.gridLineColor,
          opacity: 0.3,
        },
      },
    },

    // 数据缩放配置
    dataZoom: [
      {
        type: 'inside',
        start: 80,
        end: 100,
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 80,
        end: 100,
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        fillerColor: 'rgba(167, 183, 204, 0.4)',
        handleStyle: {
          color: theme.crosshairColor,
        },
        textStyle: {
          color: theme.tooltipTextColor,
        },
      },
    ],

    // 系列配置
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: processedData,
        itemStyle: {
          color: theme.upColor,
          color0: theme.downColor,
          borderColor: theme.upBorderColor,
          borderColor0: theme.downBorderColor,
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 2,
          },
        },
      },
    ],

    // 动画配置
    animation: true,
    animationDuration: 300,
    animationEasing: 'cubicOut',
  };
};

// ==================== 图表渲染器组件 ====================

/**
 * 图表渲染器组件
 * 使用forwardRef以支持父组件直接操作图表实例
 */
const ChartRenderer = forwardRef<ChartRendererRef, ChartRendererProps>(
  ({ data, theme = DEFAULT_CHART_THEME, height = CHART_DEFAULT_HEIGHT, loading = false, onChartReady }, ref) => {
    // 图表容器引用
    const chartRef = useRef<HTMLDivElement>(null);
    // 图表实例引用
    const chartInstance = useRef<echarts.ECharts | null>(null);

    // ==================== 图表操作方法 ====================

    /**
     * 初始化图表
     */
    const initChart = () => {
      if (!chartRef.current) return;

      try {
        // 销毁已存在的图表实例
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }

        // 创建新的图表实例
        chartInstance.current = echarts.init(chartRef.current);
        
        // 设置图表配置
        const option = generateChartOption(data, theme);
        chartInstance.current.setOption(option);

        // 添加窗口大小变化监听
        const handleResize = () => {
          if (chartInstance.current) {
            chartInstance.current.resize();
          }
        };
        window.addEventListener('resize', handleResize);

        // 通知父组件图表已准备就绪
        if (onChartReady) {
          onChartReady(chartInstance.current);
        }

        // 返回清理函数
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('图表初始化失败:', error);
      }
    };

    /**
     * 更新图表数据
     */
    const updateData = (newData: KLineData[]) => {
      if (!chartInstance.current) return;

      try {
        const option = generateChartOption(newData, theme);
        chartInstance.current.setOption(option, false, true);
      } catch (error) {
        console.error('图表数据更新失败:', error);
      }
    };

    /**
     * 调整图表大小
     */
    const resize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    /**
     * 销毁图表
     */
    const dispose = () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };

    // ==================== 暴露给父组件的方法 ====================

    useImperativeHandle(ref, () => ({
      getChart: () => chartInstance.current,
      updateData,
      resize,
      dispose,
    }));

    // ==================== 生命周期处理 ====================

    // 初始化图表
    useEffect(() => {
      const cleanup = initChart();
      return cleanup;
    }, []);

    // 数据变化时更新图表
    useEffect(() => {
      if (data.length > 0) {
        updateData(data);
      }
    }, [data, theme]);

    // 组件卸载时销毁图表
    useEffect(() => {
      return () => {
        dispose();
      };
    }, []);

    // ==================== 渲染 ====================

    return (
      <div className="relative w-full">
        {/* 图表容器 */}
        <div
          ref={chartRef}
          style={{ height: `${height}px` }}
          className="w-full"
        />
        
        {/* 加载状态覆盖层 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white text-sm">加载中...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ChartRenderer.displayName = 'ChartRenderer';

export default ChartRenderer;