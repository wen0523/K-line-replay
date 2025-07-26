import { useCallback, useEffect, useState } from 'react';
import { KLineData, ReplayConfig } from '@/types';
import { updateData, updateTime } from '@/lib/utils';
import { usePriceStore, useReplayStore, usePriceUpStore, usePriceChangeStore } from '@/store/priceStore';

export const useReplay = (data: KLineData[], timeFrame: string = 'm') => {
  const [config, setConfig] = useState<ReplayConfig>({
    speed: 1,
    isPlaying: false,
    currentIndex: 0,
  });

  const { setPrice } = usePriceStore();
  const { replay, setReplay } = useReplayStore();
  const { setPriceUp } = usePriceUpStore();
  const { setPriceChange } = usePriceChangeStore();

  const [processedData, setProcessedData] = useState<KLineData[]>([]);

  // 开始/暂停回放
  const toggleReplay = useCallback(() => {
    setConfig(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    setReplay(!replay);
  }, [replay, setReplay]);

  // 设置回放速度
  const setSpeed = useCallback((speed: number) => {
    setConfig(prev => ({ ...prev, speed }));
  }, []);

  // 重置回放
  const resetReplay = useCallback(() => {
    setConfig(prev => ({ ...prev, currentIndex: 0, isPlaying: false }));
    setReplay(false);
    setProcessedData([]);
  }, [setReplay]);

  // 跳转到指定位置
  const seekTo = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    setConfig(prev => ({ ...prev, currentIndex: clampedIndex }));
  }, [data.length]);

  // 处理数据更新
  useEffect(() => {
    if (!config.isPlaying || config.currentIndex >= data.length) {
      return;
    }

    const interval = setInterval(() => {
      setConfig(prev => {
        const nextIndex = prev.currentIndex + 1;
        
        if (nextIndex >= data.length) {
          setReplay(false);
          return { ...prev, isPlaying: false };
        }

        const currentData = data[nextIndex];
        const updatedData = updateTime([...currentData], timeFrame);
        
        // 更新价格相关状态
        const currentPrice = updatedData[4]; // 收盘价
        const previousPrice = nextIndex > 0 ? data[nextIndex - 1][4] : currentPrice;
        const priceChange = currentPrice - previousPrice;
        
        setPrice(currentPrice);
        setPriceChange(priceChange);
        setPriceUp(priceChange >= 0);

        // 更新处理后的数据
        setProcessedData(prev => {
          const newData = [...prev];
          if (newData.length > 0) {
            const lastData = newData[newData.length - 1];
            const mergedData = updateData([...lastData], updatedData);
            newData[newData.length - 1] = mergedData;
          } else {
            newData.push(updatedData);
          }
          return newData;
        });

        return { ...prev, currentIndex: nextIndex };
      });
    }, 1000 / config.speed);

    return () => clearInterval(interval);
  }, [config.isPlaying, config.speed, config.currentIndex, data, timeFrame, setPrice, setPriceChange, setPriceUp, setReplay]);

  return {
    config,
    processedData,
    toggleReplay,
    setSpeed,
    resetReplay,
    seekTo,
    progress: data.length > 0 ? (config.currentIndex / data.length) * 100 : 0,
    isComplete: config.currentIndex >= data.length,
  };
};