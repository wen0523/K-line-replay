"use client";

import React, { useEffect, useState } from 'react';
import { useSymbolStore } from '@/store/symbolStore';
import { useTimeStore } from '@/store/timeStore';
import { usePriceStore, useReplayStore, usePriceChangeStore, usePriceUpStore } from '@/store/priceStore';

// 自定义钩子
import { useChartConfig } from '@/hooks/useChartConfig';
import { useChartData } from '@/hooks/useChartData';
import { useReplayLogic } from '@/hooks/useReplayLogic';
import { useChartInstance } from '@/hooks/useChartInstance';

// SVG 图标
import SpeedIcon from '../svg/speed';
import { StartIcon, StopIcon } from '../svg/switch';

const CandlestickChart: React.FC = () => {
  const symbol = useSymbolStore((state) => state.symbol);
  const time = useTimeStore((state) => state.time);
  const setPrice = usePriceStore((state) => state.setPrice);
  const setPriceUp = usePriceUpStore((state) => state.setPriceUp);
  const setPriceChange = usePriceChangeStore((state) => state.setPriceChange);
  const setReplay = useReplayStore((state) => state.setReplay);

  const [history, setHistory] = useState(['BTC/USDT', '1d']);

  // 自定义钩子
  const { getChartOption } = useChartConfig();
  const { allData, data, isLoading, fetchData, updateTimeframeData, resetData } = useChartData();
  const { 
    isReplay, 
    switched, 
    startReplay, 
    exitReplay, 
    moveForward, 
    toggleAutoReplay, 
    handleTimeframeChange,
    cleanup: cleanupReplay 
  } = useReplayLogic();
  const { chartRef, initChart, refreshChart, cleanup: cleanupChart, handleResize } = useChartInstance();

  // 使用数据初始化图表
  const init = async () => {
    const initData = await fetchData(symbol, time);
    if (initData && initData.length > 0) {
      const options = getChartOption(initData);
      await initChart(initData, options);
    }
  };

  // 处理回放按钮点击
  const handleReplayToggle = () => {
    if (!isReplay) {
      console.log('Entering replay mode');
      startReplay(refreshChart, time, allData, 500);
    } else {
      console.log('Exiting replay mode');
      exitReplay(allData, refreshChart, time);
    }
  };

  // 处理自动回放切换
  const handleAutoReplayToggle = () => {
    toggleAutoReplay(allData, refreshChart, time);
  };

  // 处理手动前进一步
  const handleStepForward = () => {
    moveForward(allData, refreshChart, time);
  };

  // 监听数据变化并更新图表
  useEffect(() => {
    refreshChart(data);
  }, [data]);

  // 设置和清理
  useEffect(() => {
    init();

    // 组件卸载时清理
    return () => {
      console.log('Cleaning up chart resources');
      cleanupReplay();
      cleanupChart();
      resetData();
    };
  }, []);

  useEffect(() => {
    handleResize();
  }, [isReplay]);

  // 处理交易对和时间周期变化
  useEffect(() => {
    if (history[0] !== symbol) {
      // 交易对变化，重置所有状态
      cleanupReplay();
      setReplay(false);
      setPrice(-1);
      setPriceUp(true);
      setPriceChange(0);

      fetchData(symbol, time);
      setHistory([symbol, time]);
    } else if (history[1] !== time) {
      // 仅时间周期变化
      if (!isReplay) {
        updateTimeframeData(time);
      } else {
        handleTimeframeChange(allData, time, refreshChart);
      }
      setHistory([symbol, time]);
    }
  }, [symbol, time]);

  // 生成加载状态的骨架屏
  const renderSkeleton = () => (
    <div className="animate-pulse h-full w-full flex flex-col">
      {/* 图表区域骨架屏 */}
      <div className="flex-1 bg-gray-800 w-full">
        <div className="h-full w-full flex flex-col">
          {/* 价格指示器 */}
          <div className="flex justify-between px-6 py-4">
            <div className="w-20 h-6 bg-gray-700 rounded"></div>
            <div className="w-24 h-6 bg-gray-700 rounded"></div>
            <div className="w-20 h-6 bg-gray-700 rounded"></div>
          </div>

          {/* 图表网格线 */}
          <div className="flex-1 px-6 py-4 grid grid-rows-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-0.5 bg-gray-700 rounded"></div>
            ))}
          </div>

          {/* 时间指示器 */}
          <div className="flex justify-between px-6 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-14 h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部滑块骨架屏 */}
      <div className="h-12 bg-gray-800 w-full px-6 py-2">
        <div className="w-full h-full bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="relative rounded-lg h-full bg-[#131722] shadow-lg overflow-hidden">
      {isLoading && renderSkeleton()}
      
      {/* 图表容器 */}
      <div
        ref={chartRef}
        className="w-full h-full"
        aria-label="K-line Chart"
      />

      {/* 控制面板 */}
      {!isLoading && (
        <div className="absolute top-3 right-3 flex flex-row items-center gap-3 z-10">
          <div className="bg-[#1e222d] py-2 px-3 rounded-md shadow-sm text-sm">
            <span className="text-gray-300">
              {allData['1d']?.[0]?.[0]} - {allData['1d']?.[allData['1d']?.length - 1]?.[0]}
            </span>
          </div>

          <button
            className={`px-3 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${isReplay
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-[#2962ff] text-white hover:bg-blue-700'
              }`}
            onClick={handleReplayToggle}
          >
            {isReplay ? 'Exit Replay' : 'Start Replay'}
          </button>

          {isReplay && (
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-md shadow-sm transition-colors ${switched
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                onClick={handleAutoReplayToggle}
              >
                {switched ? <StopIcon /> : <StartIcon />}
              </button>

              {!switched && (
                <button
                  disabled={switched}
                  className="p-2 bg-[#2962ff] text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                  onClick={handleStepForward}
                  title="Move one step forward"
                >
                  <SpeedIcon />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;