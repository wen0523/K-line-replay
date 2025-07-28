import { useState, useRef } from 'react';
import { useData } from './use_data';
import type { KLineData } from '@/types';

export type CandlestickDataItems = {
  '1d'?: KLineData[],
  '4h'?: KLineData[],
  '1h'?: KLineData[],
  '15m'?: KLineData[],
  '5m'?: KLineData[],
}

export const useChartData = () => {
  const [allData, setAllData] = useState<CandlestickDataItems>({});
  const [data, setData] = useState<KLineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getData } = useData();

  // Fetch data from API
  const fetchData = async (coin: string, timeframe?: string) => {
    try {
      setIsLoading(true);
      const response = await getData(coin);
      setAllData(response);

      if (timeframe) {
        const timeframeData = response[timeframe as keyof CandlestickDataItems] || [];
        setData(timeframeData);
        return timeframeData;
      } else {
        setIsLoading(false);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
      return timeframe ? [] : {};
    } finally {
      setIsLoading(false);
    }
  };

  // Update data for specific timeframe
  const updateTimeframeData = (timeframe: string) => {
    const timeframeData = allData[timeframe as keyof CandlestickDataItems] || [];
    setData(timeframeData);
  };

  // Reset all data
  const resetData = () => {
    setAllData({});
    setData([]);
    setIsLoading(false);
  };

  return {
    allData,
    data,
    isLoading,
    setIsLoading,
    fetchData,
    updateTimeframeData,
    resetData,
    setData
  };
};