import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { useThemeStore } from '@/store/themeStore';
import type { KLineData } from '@/types';
import { useChartConfig } from '@/hooks/useChartConfig';

export const useChartInstance = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const theme = useThemeStore((state) => state.theme);
  const { getChartOption } = useChartConfig();

  // 使用数据和配置初始化图表
  const initChart = async (data: KLineData[], options: echarts.EChartsOption) => {
    if (!chartRef.current) return;

    try {
      // 如果存在之前的图表实例，先销毁它
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 使用当前主题初始化 ECharts 实例
      chartInstance.current = echarts.init(chartRef.current, theme);

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data received');
      }

      // 设置配置并渲染图表
      chartInstance.current.setOption(options);

    } catch (e) {
      console.error('Failed to initialize chart:', e);
    }
  };

  // 使用新数据刷新图表
  const refreshChart = async (data: KLineData[]) => {
    if (chartInstance.current && data.length > 0) {
      await chartInstance.current.setOption({
        dataset: {
          source: data
        },
      });
    }
  };

  // 处理窗口大小调整
  const handleResize = () => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  };

  // 清理图表实例
  const cleanup = () => {
    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
  };

  const getCurrentChartData = (chart: echarts.ECharts): KLineData[] => {
    const option = chart?.getOption();
    if (!option) return [];

    // 如果是用 dataset 设置的数据
    const dataset = option.dataset as any;
    return (dataset?.[0]?.source as KLineData[]) ?? [];
  };


  // 处理主题变化
  useEffect(() => {
    if (chartInstance.current) {
      const currentData = getCurrentChartData(chartInstance.current);
      const option = getChartOption(currentData);
      chartInstance.current.setOption(option, true);
    }
  }, [theme]);

  // 设置窗口大小调整监听器
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    chartRef,
    chartInstance,
    initChart,
    refreshChart,
    handleResize,
    cleanup
  };
};