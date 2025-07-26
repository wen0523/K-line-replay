/**
 * 回放控制器组件
 * 专门负责K线数据回放的逻辑控制
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { KLineData, KLineDataSet, TimeFrame, ReplayStatus } from '@/types';
import { useReplayStore, usePriceStore } from '@/store/priceStore';
import { updateData, updateTime, DataUpdateResult } from '@/lib/utils';
import IntervalLoop from '@/lib/IntervalLoop';
import { REPLAY_SPEEDS, TIME_FRAME_MINUTES } from '@/constants';

// SVG图标组件
import SpeedIcon from '../svg/speed';
import { StartIcon, StopIcon } from '../svg/switch';

// ==================== 组件接口定义 ====================

/**
 * 回放控制器属性接口
 */
interface ReplayControllerProps {
  /** 完整的K线数据集 */
  allData: KLineDataSet;
  /** 当前时间周期 */
  timeFrame: TimeFrame;
  /** 数据更新回调 */
  onDataUpdate: (data: KLineData[]) => void;
  /** 回放状态变化回调 */
  onReplayStatusChange?: (status: ReplayStatus) => void;
}

// ==================== 回放控制器组件 ====================

const ReplayController: React.FC<ReplayControllerProps> = ({
  allData,
  timeFrame,
  onDataUpdate,
  onReplayStatusChange,
}) => {
  // ==================== 状态管理 ====================

  // Zustand状态
  const {
    replay,
    config,
    status,
    setReplay,
    setReplayConfig,
    setReplayStatus,
    startReplay,
    pauseReplay,
    stopReplay,
    resetReplay,
    setReplaySpeed,
  } = useReplayStore();

  const { setPrice, setPriceUp, setPriceChange } = usePriceStore();

  // 本地状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 引用
  const replayDataRef = useRef<KLineDataSet>({});
  const countRef = useRef(0);
  const isProcessingRef = useRef(false);
  const intervalLoopRef = useRef<IntervalLoop>(new IntervalLoop());

  // ==================== 回放核心逻辑 ====================

  /**
   * 初始化回放数据
   * 根据指定的回放时间点，截取对应的数据
   */
  const initializeReplayData = useCallback((replayTime: number) => {
    if (!allData || Object.keys(allData).length === 0) {
      console.warn('没有可用的数据进行回放');
      return false;
    }

    try {
      // 根据不同时间周期计算数据长度
      replayDataRef.current = {
        '1d': allData['1d']?.slice(0, replayTime),
        '4h': allData['4h']?.slice(0, replayTime * 6),
        '1h': allData['1h']?.slice(0, replayTime * 24),
        '15m': allData['15m']?.slice(0, replayTime * 96),
        '5m': allData['5m']?.slice(0, replayTime * 288),
      };

      // 设置初始计数器
      countRef.current = replayTime * 288;

      // 更新回放配置
      setReplayConfig({
        currentIndex: countRef.current,
        totalLength: allData['5m']?.length || 0,
      });

      // 初始化价格数据
      updateInitialPrice();

      return true;
    } catch (error) {
      console.error('初始化回放数据失败:', error);
      return false;
    }
  }, [allData, setReplayConfig]);

  /**
   * 更新初始价格信息
   */
  const updateInitialPrice = useCallback(() => {
    const priceData = replayDataRef.current['5m'];
    const priceData1d = replayDataRef.current['1d'];

    if (priceData && priceData1d && priceData.length > 0 && priceData1d.length > 0) {
      const currentData = priceData[priceData.length - 1];
      const dailyData = priceData1d[priceData1d.length - 1];

      // 计算当前价格（开盘价和收盘价的平均值）
      const currentPrice = Number(((currentData[1] + currentData[4]) / 2).toFixed(2));
      
      // 计算日涨跌幅
      const priceChange = Number(((dailyData[4] - dailyData[1]) / dailyData[1] * 100).toFixed(2));
      
      // 判断涨跌
      const isPriceUp = currentData[4] >= currentData[1];

      // 更新价格状态
      setPrice(currentPrice);
      setPriceUp(isPriceUp);
      setPriceChange(priceChange);
    }
  }, [setPrice, setPriceUp, setPriceChange]);

  /**
   * 开始回放
   */
  const handleStartReplay = useCallback((replayTime: number = 100) => {
    if (status === ReplayStatus.PLAYING) return;

    setIsLoading(true);

    try {
      // 初始化回放数据
      const success = initializeReplayData(replayTime);
      if (!success) {
        setIsLoading(false);
        return;
      }

      // 更新当前时间周期的数据显示
      const currentData = replayDataRef.current[timeFrame] || [];
      onDataUpdate(currentData);

      // 启动回放
      startReplay();
      setReplayStatus(ReplayStatus.PLAYING);

      // 通知状态变化
      if (onReplayStatusChange) {
        onReplayStatusChange(ReplayStatus.PLAYING);
      }

      console.log('回放已开始');
    } catch (error) {
      console.error('启动回放失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, initializeReplayData, timeFrame, onDataUpdate, startReplay, setReplayStatus, onReplayStatusChange]);

  /**
   * 暂停回放
   */
  const handlePauseReplay = useCallback(() => {
    if (status !== ReplayStatus.PLAYING) return;

    pauseReplay();
    setReplayStatus(ReplayStatus.PAUSED);
    intervalLoopRef.current.stop();

    if (onReplayStatusChange) {
      onReplayStatusChange(ReplayStatus.PAUSED);
    }

    console.log('回放已暂停');
  }, [status, pauseReplay, setReplayStatus, onReplayStatusChange]);

  /**
   * 停止回放
   */
  const handleStopReplay = useCallback(() => {
    stopReplay();
    setReplayStatus(ReplayStatus.STOPPED);
    intervalLoopRef.current.stop();
    
    // 重置数据
    replayDataRef.current = {};
    countRef.current = 0;
    isProcessingRef.current = false;

    if (onReplayStatusChange) {
      onReplayStatusChange(ReplayStatus.STOPPED);
    }

    console.log('回放已停止');
  }, [stopReplay, setReplayStatus, onReplayStatusChange]);

  /**
   * 切换回放状态
   */
  const toggleReplay = useCallback(() => {
    switch (status) {
      case ReplayStatus.STOPPED:
        handleStartReplay();
        break;
      case ReplayStatus.PLAYING:
        handlePauseReplay();
        break;
      case ReplayStatus.PAUSED:
        startReplay();
        setReplayStatus(ReplayStatus.PLAYING);
        if (onReplayStatusChange) {
          onReplayStatusChange(ReplayStatus.PLAYING);
        }
        break;
    }
  }, [status, handleStartReplay, handlePauseReplay, startReplay, setReplayStatus, onReplayStatusChange]);

  /**
   * 处理下一帧数据
   */
  const processNextFrame = useCallback(() => {
    if (!replay || isProcessingRef.current) return;
    if (!allData['5m'] || countRef.current >= allData['5m'].length) {
      // 回放完成
      setReplayStatus(ReplayStatus.COMPLETED);
      intervalLoopRef.current.stop();
      if (onReplayStatusChange) {
        onReplayStatusChange(ReplayStatus.COMPLETED);
      }
      return;
    }

    isProcessingRef.current = true;

    try {
      // 获取当前5分钟数据
      const currentM5Data = allData['5m'][countRef.current];
      if (!currentM5Data) {
        isProcessingRef.current = false;
        return;
      }

      // 更新价格信息
      const currentPrice = Number(((currentM5Data[1] + currentM5Data[4]) / 2).toFixed(2));
      const isPriceUp = currentM5Data[4] >= currentM5Data[1];
      setPrice(currentPrice);
      setPriceUp(isPriceUp);

      // 更新各时间周期的数据
      updateTimeFrameData(currentM5Data);

      // 更新计数器
      countRef.current++;

      // 更新回放配置
      setReplayConfig({ currentIndex: countRef.current });

      // 更新显示数据
      const currentData = replayDataRef.current[timeFrame] || [];
      onDataUpdate(currentData);

    } catch (error) {
      console.error('处理回放数据失败:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [replay, allData, timeFrame, onDataUpdate, setPrice, setPriceUp, setReplayConfig, setReplayStatus, onReplayStatusChange]);

  /**
   * 更新各时间周期的数据
   */
  const updateTimeFrameData = useCallback((m5Data: KLineData) => {
    if (!replayDataRef.current) return;

    // 添加5分钟数据
    if (!replayDataRef.current['5m']) replayDataRef.current['5m'] = [];
    replayDataRef.current['5m'].push(m5Data);

    // 更新其他时间周期数据
    updateTimeFrameSpecificData('15m', m5Data, 3);
    updateTimeFrameSpecificData('1h', m5Data, 12);
    updateTimeFrameSpecificData('4h', m5Data, 48);
    updateTimeFrameSpecificData('1d', m5Data, 288);
  }, []);

  /**
   * 更新特定时间周期的数据
   */
  const updateTimeFrameSpecificData = useCallback((
    timeFrame: TimeFrame,
    m5Data: KLineData,
    multiplier: number
  ) => {
    if (!replayDataRef.current[timeFrame]) {
      replayDataRef.current[timeFrame] = [];
    }

    const data = replayDataRef.current[timeFrame]!;
    const dataLength = data.length;

    if (dataLength > 0 && countRef.current % multiplier !== 0) {
      // 更新现有数据
      const updateResult = updateData([...data[dataLength - 1]], [...m5Data]);
      data[dataLength - 1] = updateResult.data;
    } else {
      // 添加新数据
      const newData = updateTime([...m5Data], timeFrame === '1d' ? 'd' : 'h');
      data.push(newData);
    }

    // 更新日涨跌幅
    if (timeFrame === '1d' && data.length > 0) {
      const dailyData = data[data.length - 1];
      const priceChange = Number(((dailyData[4] - dailyData[1]) / dailyData[1] * 100).toFixed(2));
      setPriceChange(priceChange);
    }
  }, [setPriceChange]);

  // ==================== 副作用处理 ====================

  /**
   * 监听回放状态，控制定时器
   */
  useEffect(() => {
    if (status === ReplayStatus.PLAYING && replay) {
      const interval = 1000 / config.speed;
      intervalLoopRef.current.start(processNextFrame, { interval });
    } else {
      intervalLoopRef.current.stop();
    }

    return () => {
      intervalLoopRef.current.stop();
    };
  }, [status, replay, config.speed, processNextFrame]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      intervalLoopRef.current.stop();
    };
  }, []);

  // ==================== 渲染 ====================

  return (
    <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* 回放控制按钮 */}
      <button
        onClick={toggleReplay}
        disabled={isLoading}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white transition-colors"
        title={status === ReplayStatus.PLAYING ? '暂停回放' : '开始回放'}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : status === ReplayStatus.PLAYING ? (
          <StopIcon />
        ) : (
          <StartIcon />
        )}
      </button>

      {/* 回放速度控制 */}
      <div className="flex items-center space-x-2">
        <SpeedIcon />
        <select
          value={config.speed}
          onChange={(e) => setReplaySpeed(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
        >
          {REPLAY_SPEEDS.map(speed => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>

      {/* 回放进度 */}
      {replay && (
        <div className="flex-1 flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">进度:</span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${config.totalLength ? (config.currentIndex / config.totalLength) * 100 : 0}%`
              }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {config.currentIndex} / {config.totalLength}
          </span>
        </div>
      )}

      {/* 回放状态指示 */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === ReplayStatus.PLAYING
              ? 'bg-green-500'
              : status === ReplayStatus.PAUSED
              ? 'bg-yellow-500'
              : 'bg-gray-400'
          }`}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {status === ReplayStatus.PLAYING
            ? '播放中'
            : status === ReplayStatus.PAUSED
            ? '已暂停'
            : status === ReplayStatus.COMPLETED
            ? '已完成'
            : '已停止'}
        </span>
      </div>

      {/* 停止按钮 */}
      {replay && (
        <button
          onClick={handleStopReplay}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
          title="停止回放"
        >
          停止
        </button>
      )}
    </div>
  );
};

export default ReplayController;