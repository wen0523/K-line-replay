import { useState, useRef } from 'react';
import { updateData, updateTime } from '../lib/utils';
import IntervalLoop from '@/lib/IntervalLoop';
import type { KLineData } from '@/types';

import { usePriceStore, useReplayStore, usePriceChangeStore, usePriceUpStore } from '@/store/priceStore';

export type CandlestickDataItems = {
  '1d'?: KLineData[],
  '4h'?: KLineData[],
  '1h'?: KLineData[],
  '15m'?: KLineData[],
  '5m'?: KLineData[],
}

export const useReplayLogic = () => {
  const setPrice = usePriceStore((state) => state.setPrice);
  const setReplay = useReplayStore((state) => state.setReplay);
  const setPriceChange = usePriceChangeStore((state) => state.setPriceChange);
  const setPriceUp = usePriceUpStore((state) => state.setPriceUp);

  const [isReplay, setIsReplay] = useState(false);
  const [switched, setSwitched] = useState(false);
  const [loop, setLoop] = useState<IntervalLoop>(new IntervalLoop());
  
  const replayDatasRef = useRef<CandlestickDataItems>({});
  const countRef = useRef(0);
  const isLoadData = useRef(false);

  // 初始化回放模式
  const startReplay = (onRefresh: (data: KLineData[]) => void, currentTimeframe: string, allData: CandlestickDataItems, replayTime: number) => {
    if (!isReplay) {
      // 初始化回放数据
      replayDatasRef.current = {
        '1d': allData['1d']?.slice(0, replayTime),
        '4h': allData['4h']?.slice(0, replayTime * 6),
        '1h': allData['1h']?.slice(0, replayTime * 24),
        '15m': allData['15m']?.slice(0, replayTime * 96),
        '5m': allData['5m']?.slice(0, replayTime * 288),
      };
      
      const currentData = replayDatasRef.current[currentTimeframe as keyof CandlestickDataItems] || [];
      onRefresh(currentData);
      
      // 设置初始价格
      const priceData = replayDatasRef.current['5m'];
      const priceData1d = replayDatasRef.current['1d'];

      if (priceData && priceData1d) {
        const data = priceData[priceData.length - 1];
        const data1d = priceData1d[priceData1d.length - 1];

        const price = Number(((data[1] + data[4]) / 2).toFixed(2));
        const priceChange = Number(((data1d[4] - data1d[1]) / data1d[1] * 100).toFixed(2));

        setPrice(price);
        setPriceUp(data[4] >= data[1] ? true : false);
        setPriceChange(priceChange);
      }
      
      setReplay(true);
      countRef.current = replayTime * 288;
      setIsReplay(true);
    }
  };

  // 退出回放模式
  const exitReplay = (allData: CandlestickDataItems, onRefresh: (data: KLineData[]) => void, currentTimeframe: string) => {
    setIsReplay(false);
    if (switched) {
      loop.stop();
      setSwitched(false);
    }
    setPrice(-1);
    setPriceUp(true);
    setPriceChange(0);
    setReplay(false);
    
    const currentData = allData[currentTimeframe as keyof CandlestickDataItems] || [];
    onRefresh(currentData);
  };

  // 在回放中向前移动一步
  const moveForward = (allData: CandlestickDataItems, onRefresh: (data: KLineData[]) => void, currentTimeframe: string) => {
    if (isReplay && !isLoadData.current) {
      isLoadData.current = true;

      // 数据存在性安全检查
      if (!replayDatasRef.current || Object.keys(replayDatasRef.current).length === 0) {
        console.warn("replayDatasRef.current is empty, skipping right function");
        isLoadData.current = false;
        if (switched) {
          loop.stop();
        }
        return;
      }
    
      if (allData['5m'] && countRef.current >= allData['5m']?.length) {
        console.warn("countRef.current exceeds data length, skipping right function");
        if (switched) {
          loop.stop();
        }
        return;
      }

      const m5Data = allData['5m']?.[countRef.current] as KLineData;

      setPrice(Number(((m5Data[1] + m5Data[4]) / 2).toFixed(2)));
      setPriceUp(m5Data[4] >= m5Data[1] ? true : false);

      const m15Length = replayDatasRef.current['15m']?.length || 0;
      const m15Data = replayDatasRef.current['15m']?.[m15Length - 1] as KLineData;

      const h1Length = replayDatasRef.current['1h']?.length || 0;
      const h1Data = replayDatasRef.current['1h']?.[h1Length - 1] as KLineData;

      const h4Length = replayDatasRef.current['4h']?.length || 0;
      const h4Data = replayDatasRef.current['4h']?.[h4Length - 1] as KLineData;

      const d1Length = replayDatasRef.current['1d']?.length || 0;
      const d1Data = replayDatasRef.current['1d']?.[d1Length - 1] as KLineData;

      // 5分钟数据
      replayDatasRef.current['5m']?.push(m5Data);

      // 更新所有时间周期的数据
      // 1日数据
      if (d1Length != 0 && d1Length * 288 === countRef.current) {
        replayDatasRef.current['1d']?.push(updateTime([...m5Data], 'd'));
      } else if (d1Length != 0 && replayDatasRef.current['1d']) {
        replayDatasRef.current['1d'][d1Length - 1] = updateData([...d1Data], [...m5Data]);
      }

      const data = replayDatasRef.current['1d'];
      if (data) {
        const data1d = data[data.length - 1];
        const priceChange = Number(((data1d[4] - data1d[1]) / data1d[1] * 100).toFixed(2));
        setPriceChange(priceChange);
      }

      // 4小时数据
      if (h4Length != 0 && h4Length * 48 === countRef.current) {
        replayDatasRef.current['4h']?.push(updateTime([...m5Data], 'h'));
      } else if (h4Length != 0 && replayDatasRef.current['4h']) {
        replayDatasRef.current['4h'][h4Length - 1] = updateData([...h4Data], [...m5Data]);
      }

      // 1小时数据
      if (h1Length != 0 && h1Length * 12 === countRef.current) {
        replayDatasRef.current['1h']?.push(updateTime([...m5Data], 'h'));
      } else if (h1Length != 0 && replayDatasRef.current['1h']) {
        replayDatasRef.current['1h'][h1Length - 1] = updateData([...h1Data], [...m5Data]);
      }

      // 15分钟数据
      if (m15Length != 0 && m15Length * 3 === countRef.current) {
        replayDatasRef.current['15m']?.push(m5Data);
      } else if (m15Length != 0 && replayDatasRef.current['15m']) {
        replayDatasRef.current['15m'][m15Length - 1] = updateData([...m15Data], [...m5Data]);
      }

      countRef.current++;

      if (Object.keys(replayDatasRef.current).length != 0) {
        const currentData = replayDatasRef.current[currentTimeframe as keyof CandlestickDataItems] || [];
        onRefresh(currentData);
      }

      isLoadData.current = false;
    }
  };

  // 切换自动回放
  const toggleAutoReplay = (allData: CandlestickDataItems, onRefresh: (data: KLineData[]) => void, currentTimeframe: string) => {
    if (isReplay) {
      if (switched) {
        console.log('Stopping replay');
        loop.stop();
      } else {
        console.log('Starting replay');
        loop.start(() => moveForward(allData, onRefresh, currentTimeframe), 500);
      }
      setSwitched(!switched);
    }
  };

  // 处理回放期间的时间周期变化
  const handleTimeframeChange = (allData: CandlestickDataItems, newTimeframe: string, onRefresh: (data: KLineData[]) => void) => {
    if (isReplay) {
      if (switched) {
        loop.stop();
        setSwitched(false);
        const currentData = replayDatasRef.current[newTimeframe as keyof CandlestickDataItems] || [];
        onRefresh(currentData);
        loop.start(() => moveForward(allData, onRefresh, newTimeframe), 500);
        setSwitched(true);
        console.log('Switched to', newTimeframe);
      } else {
        const currentData = replayDatasRef.current[newTimeframe as keyof CandlestickDataItems] || [];
        onRefresh(currentData);
      }
    }
  };

  // 清理回放资源
  const cleanup = () => {
    loop.stop();
    replayDatasRef.current = {};
    countRef.current = 0;
    setIsReplay(false);
    setSwitched(false);
  };

  return {
    isReplay,
    switched,
    replayDatasRef,
    startReplay,
    exitReplay,
    moveForward,
    toggleAutoReplay,
    handleTimeframeChange,
    cleanup
  };
};