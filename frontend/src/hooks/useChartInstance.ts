import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { useThemeStore } from '@/store/themeStore';
import type { KLineData } from '@/types';

export const useChartInstance = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const theme = useThemeStore((state) => state.theme);

  // Initialize chart with data and options
  const initChart = async (data: KLineData[], options: echarts.EChartsOption) => {
    if (!chartRef.current) return;

    try {
      // Dispose previous chart instance if exists
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // Initialize ECharts instance with current theme
      chartInstance.current = echarts.init(chartRef.current, theme);

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data received');
      }

      // Set options and render chart
      chartInstance.current.setOption(options);

    } catch (e) {
      console.error('Failed to initialize chart:', e);
    }
  };

  // Update chart theme without full reinitialization
  const updateTheme = async (newTheme: 'light' | 'dark') => {
    if (!chartInstance.current || !chartRef.current) return;

    try {
      // Get current options
      const currentOptions = chartInstance.current.getOption();
      
      // Dispose and recreate with new theme
      chartInstance.current.dispose();
      chartInstance.current = echarts.init(chartRef.current, newTheme);
      
      // Restore options with smooth transition
      chartInstance.current.setOption(currentOptions, {
        notMerge: true,
        lazyUpdate: false,
        silent: false
      });
    } catch (e) {
      console.error('Failed to update chart theme:', e);
    }
  };

  // Refresh chart with new data
  const refreshChart = async (data: KLineData[]) => {
    if (chartInstance.current && data.length > 0) {
      await chartInstance.current.setOption({
        dataset: {
          source: data
        },
      });
    }
  };

  // Handle window resize
  const handleResize = () => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  };

  // Cleanup chart instance
  const cleanup = () => {
    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
  };

  // Handle theme changes
  useEffect(() => {
    if (chartInstance.current) {
      updateTheme(theme);
    }
  }, [theme]);

  // Setup resize listener
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
    updateTheme,
    refreshChart,
    handleResize,
    cleanup
  };
};