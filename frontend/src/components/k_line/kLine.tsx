/**
 * K线图表主组件
 * 整合图表渲染、回放控制和数据处理功能
 * 重构后的版本，职责更加清晰，代码更易维护
 */

"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { KLineData, KLineDataSet, TimeFrame, ChartTheme } from '@/types';
import { useSymbolStore } from '@/store/symbolStore';
import { useTimeStore } from '@/store/timeStore';
import { useThemeStore } from '@/store/themeStore';
import { useReplayStore } from '@/store/priceStore';
import { dataProcessor } from '@/lib/DataProcessor';
import { DEFAULT_CHART_THEME, LIGHT_CHART_THEME, DARK_CHART_THEME } from '@/constants';

// 导入子组件
import ChartRenderer, { ChartRendererRef } from '../chart/ChartRenderer';
import ReplayController from '../chart/ReplayController';

// ==================== 主组件 ====================

/**
 * K线图表组件
 * 负责协调各个子组件，管理数据流和状态同步
 */
const KLineChart: React.FC = () => {
  // ==================== 状态管理 ====================

  // Zustand状态
  const symbol = useSymbolStore((state) => state.symbol);
  const timeFrame = useTimeStore((state) => state.time) as TimeFrame;
  const theme = useThemeStore((state) => state.theme);
  const { replay } = useReplayStore();

  // 本地状态
  const [allData, setAllData] = useState<KLineDataSet>({});
  const [currentData, setCurrentData] = useState<KLineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 引用
  const chartRef = useRef<ChartRendererRef>(null);
  const previousSymbol = useRef<string>('');
  const previousTimeFrame = useRef<TimeFrame>('1d');

  // ==================== 数据加载逻辑 ====================

  /**
   * 加载K线数据
   * 当交易对符号改变时触发
   */
  const loadKLineData = useCallback(async (symbolToLoad: string) => {
    if (!symbolToLoad) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`开始加载K线数据: ${symbolToLoad}`);
      
      // 从数据处理器获取数据
      const data = await dataProcessor.getKLineData(
        symbolToLoad,
        ['1d', '4h', '1h', '15m', '5m'],
        true // 使用缓存
      );

      // 验证数据
      if (!data || Object.keys(data).length === 0) {
        throw new Error('未获取到有效数据');
      }

      // 更新状态
      setAllData(data);
      
      // 设置当前显示的数据
      const currentTimeFrameData = data[timeFrame] || [];
      setCurrentData(currentTimeFrameData);

      console.log(`K线数据加载完成: ${symbolToLoad}`, {
        timeFrames: Object.keys(data),
        currentTimeFrame: timeFrame,
        dataLength: currentTimeFrameData.length
      });

    } catch (error) {
      console.error('加载K线数据失败:', error);
      
      // 设置错误状态
      const errorMessage = error instanceof Error ? error.message : '加载数据失败';
      setError(errorMessage);

      // 生成模拟数据作为后备方案
      console.log('使用模拟数据作为后备方案');
      const mockData = generateMockDataSet(symbolToLoad);
      setAllData(mockData);
      setCurrentData(mockData[timeFrame] || []);
      
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame]);

  /**
   * 生成模拟数据集
   * 用于开发和测试，或作为API失败时的后备方案
   */
  const generateMockDataSet = useCallback((symbolToLoad: string): KLineDataSet => {
    console.log(`生成模拟数据集: ${symbolToLoad}`);
    
    return {
      '1d': dataProcessor.generateMockData(symbolToLoad, '1d', 365),
      '4h': dataProcessor.generateMockData(symbolToLoad, '4h', 365 * 6),
      '1h': dataProcessor.generateMockData(symbolToLoad, '1h', 365 * 24),
      '15m': dataProcessor.generateMockData(symbolToLoad, '15m', 365 * 96),
      '5m': dataProcessor.generateMockData(symbolToLoad, '5m', 365 * 288),
    };
  }, []);

  /**
   * 处理时间周期变化
   * 当用户切换时间周期时更新显示数据
   */
  const handleTimeFrameChange = useCallback(() => {
    if (!allData || Object.keys(allData).length === 0) return;

    const newData = allData[timeFrame] || [];
    setCurrentData(newData);

    console.log(`时间周期已切换: ${timeFrame}`, {
      dataLength: newData.length
    });
  }, [allData, timeFrame]);

  /**
   * 处理回放数据更新
   * 当回放控制器更新数据时调用
   */
  const handleReplayDataUpdate = useCallback((data: KLineData[]) => {
    setCurrentData(data);
    console.log('回放数据已更新', { dataLength: data.length });
  }, []);

  // ==================== 主题处理 ====================

  /**
   * 获取当前图表主题
   */
  const getChartTheme = useCallback((): ChartTheme => {
    switch (theme) {
      case 'dark':
        return DARK_CHART_THEME;
      case 'light':
        return LIGHT_CHART_THEME;
      default:
        return DEFAULT_CHART_THEME;
    }
  }, [theme]);

  // ==================== 副作用处理 ====================

  /**
   * 监听交易对符号变化
   */
  useEffect(() => {
    if (symbol && symbol !== previousSymbol.current) {
      previousSymbol.current = symbol;
      loadKLineData(symbol);
    }
  }, [symbol, loadKLineData]);

  /**
   * 监听时间周期变化
   */
  useEffect(() => {
    if (timeFrame !== previousTimeFrame.current) {
      previousTimeFrame.current = timeFrame;
      handleTimeFrameChange();
    }
  }, [timeFrame, handleTimeFrameChange]);

  /**
   * 组件初始化
   */
  useEffect(() => {
    // 如果有默认交易对，立即加载数据
    if (symbol) {
      loadKLineData(symbol);
    }
  }, []); // 只在组件挂载时执行一次

  // ==================== 错误处理 ====================

  /**
   * 重试加载数据
   */
  const handleRetry = useCallback(() => {
    if (symbol) {
      // 清理缓存后重新加载
      dataProcessor.clearCache(symbol);
      loadKLineData(symbol);
    }
  }, [symbol, loadKLineData]);

  // ==================== 渲染 ====================

  // 错误状态渲染
  if (error && !isLoading && currentData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center p-8">
          <div className="text-red-500 text-lg mb-2">⚠️ 数据加载失败</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            重试加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* 图表区域 */}
      <div className="flex-1 relative">
        <ChartRenderer
          ref={chartRef}
          data={currentData}
          theme={getChartTheme()}
          loading={isLoading}
          onChartReady={(chart) => {
            console.log('图表已准备就绪', chart);
          }}
        />
        
        {/* 数据为空时的提示 */}
        {!isLoading && currentData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 bg-opacity-90">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                📊 暂无数据
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-sm">
                请选择其他交易对或时间周期
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 回放控制区域 */}
      {replay && Object.keys(allData).length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ReplayController
            allData={allData}
            timeFrame={timeFrame}
            onDataUpdate={handleReplayDataUpdate}
            onReplayStatusChange={(status) => {
              console.log('回放状态变化:', status);
            }}
          />
        </div>
      )}

      {/* 调试信息（仅在开发环境显示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>交易对: {symbol}</div>
          <div>时间周期: {timeFrame}</div>
          <div>数据长度: {currentData.length}</div>
          <div>回放模式: {replay ? '开启' : '关闭'}</div>
          <div>主题: {theme}</div>
        </div>
      )}
    </div>
  );
};

export default KLineChart;