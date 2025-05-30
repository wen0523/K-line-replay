"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useData } from '../../hooks/use_data';
import { updateData, updateTime } from '../../lib/utils';
import IntervalLoop from '@/src/lib/IntervalLoop';

import { useSymbolStore } from '@/src/store/symbolStore';
import { useTimeStore } from '@/src/store/timeStore';
import { usePriceStore, useReplayStore, usePriceChangeStore, usePriceUpStore } from '@/src/store/priceStore';

// SVG Icons
import SpeedIcon from '../svg/speed';
import { StartIcon, StopIcon } from '../svg/switch';

// Define K-line chart data types
type CandlestickDataItem = [string, number, number, number, number, number];
type CandlestickDataItems = {
  '1d'?: CandlestickDataItem[],
  '4h'?: CandlestickDataItem[],
  '1h'?: CandlestickDataItem[],
  '15m'?: CandlestickDataItem[],
  '5m'?: CandlestickDataItem[],
}

const CandlestickChart: React.FC = () => {
  const symbol = useSymbolStore((state) => state.symbol);
  const time = useTimeStore((state) => state.time);
  const setPrice = usePriceStore((state) => state.setPrice);
  const setReplay = useReplayStore((state) => state.setReplay);
  const setPriceChange = usePriceChangeStore((state) => state.setPriceChange);
  const setPriceUp = usePriceUpStore((state) => state.setPriceUp);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [allData, setAllData] = useState<CandlestickDataItems>({});
  const [data, setData] = useState<CandlestickDataItem[]>([]);
  const [isReplay, setIsReplay] = useState(false);
  const replayDatasRef = useRef<CandlestickDataItems>({});
  const countRef = useRef(0);
  const isLoadData = useRef(false);

  const { getData } = useData();

  const [switched, setSwitched] = useState(false);
  const [loop, setLoop] = useState<IntervalLoop>(new IntervalLoop());

  const [history, setHistory] = useState(['BTC/USDT', '1d']);

  // Theme colors for the chart
  const THEME = {
    upColor: '#26a69a',       // Green for up candles
    upBorderColor: '#26a69a',
    downColor: '#ef5350',     // Red for down candles
    downBorderColor: '#ef5350',
    crosshairColor: '#758696',
    gridLineColor: '#131722',
    tooltipBg: 'rgba(19, 23, 34, 0.85)',
    tooltipBorder: '#363c4e',
    tooltipTextColor: '#d1d4dc',
    volumeColor: '#3a3e5e',
  };

  const replay = (replayTime: number) => {
    if (!isReplay) {
      // Initialize replay data
      replayDatasRef.current = {
        '1d': allData['1d']?.slice(0, replayTime),
        '4h': allData['4h']?.slice(0, replayTime * 6),
        '1h': allData['1h']?.slice(0, replayTime * 24),
        '15m': allData['15m']?.slice(0, replayTime * 96),
        '5m': allData['5m']?.slice(0, replayTime * 288),
      }
      refresh(replayDatasRef.current[time as keyof CandlestickDataItems] || [])
      // Set initial price
      const priceData = replayDatasRef.current['5m']
      const priceData1d = replayDatasRef.current['1d']

      if (priceData && priceData1d) {
        const data = priceData[priceData.length - 1]
        const data1d = priceData1d[priceData1d.length - 1]

        const price = Number(((data[1] + data[4]) / 2).toFixed(2));
        const priceChange = Number(((data1d[4] - data1d[1]) / data1d[1] * 100).toFixed(2));

        setPrice(price)
        setPriceUp(data[4] >= data[1] ? true : false)
        setPriceChange(priceChange)
      }
      setReplay(true);
      countRef.current = replayTime * 288;
      setIsReplay(true);
    }
  }

  const right = () => {
    if (isReplay && !isLoadData.current) {
      isLoadData.current = true;

      // Safety checks for data existence
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

      const m5Data = allData['5m']?.[countRef.current] as CandlestickDataItem;

      setPrice(Number(((m5Data[1] + m5Data[4]) / 2).toFixed(2)));
      setPriceUp(m5Data[4] >= m5Data[1] ? true : false)

      const m15Length = replayDatasRef.current['15m']?.length || 0;
      const m15Data = replayDatasRef.current['15m']?.[m15Length - 1] as CandlestickDataItem;

      const h1Length = replayDatasRef.current['1h']?.length || 0;
      const h1Data = replayDatasRef.current['1h']?.[h1Length - 1] as CandlestickDataItem;

      const h4Length = replayDatasRef.current['4h']?.length || 0;
      const h4Data = replayDatasRef.current['4h']?.[h4Length - 1] as CandlestickDataItem;

      const d1Length = replayDatasRef.current['1d']?.length || 0;
      const d1Data = replayDatasRef.current['1d']?.[d1Length - 1] as CandlestickDataItem;

      // 5m data
      replayDatasRef.current['5m']?.push(m5Data);

      // Update data for all timeframes
      // 1d data
      if (d1Length != 0 && d1Length * 288 === countRef.current) {
        replayDatasRef.current['1d']?.push(updateTime([...m5Data], 'd'));
      } else if (d1Length != 0 && replayDatasRef.current['1d']) {
        replayDatasRef.current['1d'][d1Length - 1] = updateData([...d1Data], [...m5Data]);
      }

      const data = replayDatasRef.current['1d']
      if (data) {
        const data1d = data[data.length - 1]
        const priceChange = Number(((data1d[4] - data1d[1]) / data1d[1] * 100).toFixed(2));
        setPriceChange(priceChange)
      }

      // 4h data
      if (h4Length != 0 && h4Length * 48 === countRef.current) {
        replayDatasRef.current['4h']?.push(updateTime([...m5Data], 'h'));
      } else if (h4Length != 0 && replayDatasRef.current['4h']) {
        replayDatasRef.current['4h'][h4Length - 1] = updateData([...h4Data], [...m5Data]);
      }

      // 1h data
      if (h1Length != 0 && h1Length * 12 === countRef.current) {
        replayDatasRef.current['1h']?.push(updateTime([...m5Data], 'h'));
      } else if (h1Length != 0 && replayDatasRef.current['1h']) {
        replayDatasRef.current['1h'][h1Length - 1] = updateData([...h1Data], [...m5Data]);
      }

      // 15m data
      if (m15Length != 0 && m15Length * 3 === countRef.current) {
        replayDatasRef.current['15m']?.push(m5Data);
      } else if (m15Length != 0 && replayDatasRef.current['15m']) {
        replayDatasRef.current['15m'][m15Length - 1] = updateData([...m15Data], [...m5Data]);
      }

      countRef.current++;

      if (Object.keys(replayDatasRef.current).length != 0) {
        refresh(replayDatasRef.current[time as keyof CandlestickDataItems] || [])
      }

      isLoadData.current = false;
    }
  }

  // Handle window resize
  const handleResize = () => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  };

  // Initialize chart with data
  const initChart = async (initData: CandlestickDataItem[] | undefined) => {
    if (!chartRef.current) return;

    try {
      // Dispose previous chart instance if exists
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // Initialize ECharts instance
      chartInstance.current = echarts.init(chartRef.current, 'dark');

      if (!initData || !Array.isArray(initData) || initData.length === 0) {
        throw new Error('No data received');
      }

      // Configure ECharts options
      const option: echarts.EChartsOption = {
        backgroundColor: '#131722', // TradingView dark theme background

        // Dataset configuration
        dataset: {
          source: initData
        },

        // Tooltip configuration
        tooltip: {
          trigger: 'axis',
          triggerOn: 'mousemove|click',
          backgroundColor: THEME.tooltipBg,
          borderColor: THEME.tooltipBorder,
          borderWidth: 1,
          textStyle: {
            color: THEME.tooltipTextColor,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: 12
          },
          padding: [8, 12],
          extraCssText: 'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25); border-radius: 4px;',
          axisPointer: {
            type: 'cross',
            lineStyle: {
              color: THEME.crosshairColor,
              width: 1,
              type: 'dashed'
            },
          },
          formatter: (params) => {
            if (Array.isArray(params)) {
              const data = params[0].data as CandlestickDataItem;
              const [date, open, high, low, close, volume] = data;

              // Calculate price change percentage
              const priceChangePercent = Number(((close - open) / open * 100).toFixed(2));
              const changeColor = close >= open ? THEME.upColor : THEME.downColor;
              const amplitude = Math.abs(Number((((high - low) / low * 100).toFixed(2))));

              return `
              <div style="font-family: Inter, system-ui, sans-serif; line-height: 1.5;">
                <div style="font-weight: 600; margin-bottom: 4px;">${date}</div>
                <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px;">
                  <span style="color: #a3a6af;">Open:</span><span>${open.toFixed(2)}</span>
                  <span style="color: #a3a6af;">High:</span><span>${high.toFixed(2)}</span>
                  <span style="color: #a3a6af;">Low:</span><span>${low.toFixed(2)}</span>
                  <span style="color: #a3a6af;">Close:</span><span>${close.toFixed(2)}</span>
                  <span style="color: #a3a6af;">Change:</span><span style="color:${changeColor}">${priceChangePercent > 0 ? '+' : ''}${priceChangePercent}%</span>
                  <span style="color: #a3a6af;">Amplitude:</span><span>${amplitude}%</span>
                  <span style="color: #a3a6af;">Volume:</span><span>${volume.toLocaleString()}</span>
                </div>
              </div>
            `;
            } else {
              return `<div>Data not available</div>`;
            }
          }
        },

        // Grid configuration
        grid: [
          {
            left: '2%',
            right: '6%',
            top: '8%',
            bottom: 100,
            borderColor: 'rgba(58, 62, 94, 0.3)',
            show: true
          },
        ],

        // X-axis configuration
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: {
              onZero: false,
              lineStyle: {
                color: '#363c4e'
              }
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              color: '#758696',
              fontSize: 11,
              // formatter: (value: string) => {
              //   // Format date for better readability
              //   const date = new Date(value);
              //   return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              // }
            },
            axisPointer: {
              label: {
                show: false
              }
            },
            min: 'dataMin',
            max: 'dataMax'
          },
        ],

        // Y-axis configuration
        yAxis: [
          {
            scale: true,
            position: 'right',
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(58, 62, 94, 0.3)',
                type: 'dashed'
              }
            },
            axisLabel: {
              color: '#758696',
              fontSize: 11,
              formatter: (value: number) => {
                return value.toFixed(2);
              }
            },
            axisLine: {
              show: false
            }
          },
        ],

        // Zoom control configuration
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 50,
            end: 100,
            minValueSpan: 10
          },
          {
            show: true,
            xAxisIndex: [0],
            type: 'slider',
            bottom: 10,
            height: 40,
            borderColor: '#3a3e5e',
            fillerColor: 'rgba(58, 62, 94, 0.15)',
            handleStyle: {
              color: '#758696',
              borderColor: '#758696'
            },
            // labelFormatter: (value: number, valueStr: string) => {
            //   const date = new Date(valueStr);
            //   // 格式化日期，添加时分显示
            //   return new Intl.DateTimeFormat('zh-CN', {
            //     year: 'numeric',
            //     month: '2-digit',
            //     day: '2-digit',
            //     hour: '2-digit',
            //     minute: '2-digit'
            //   }).format(date);
            // },
            textStyle: {
              color: '#758696'
            },
            start: 50,
            end: 100
          }
        ],

        animation: true,
        animationDuration: 300,
        animationEasing: 'linear',

        // Series configuration
        series: [
          {
            name: 'Candlestick',
            type: 'candlestick',
            animationDurationUpdate: 150,
            itemStyle: {
              color: THEME.upColor,
              color0: THEME.downColor,
              borderColor: THEME.upBorderColor,
              borderColor0: THEME.downBorderColor,
              borderWidth: 1
            },
            encode: {
              x: 0,
              y: [1, 4, 3, 2]
            }
          },
        ]
      };

      // Set options and render chart
      chartInstance.current.setOption(option);

    } catch (e) {
      console.error('Failed to initialize chart:', e);
    } finally {
      setIsLoading(false);
    }
  };



  // Fetch data from API
  const fetchData = async (coin: string, init = false) => {
    try {
      const response = await getData(coin);
      setAllData(response);

      if (init) {
        return response[time];
      } else {
        setData(response[time] || []);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
      return [];
    }
  }

  // Initialize chart with data
  const init = async () => {
    const initData = await fetchData(symbol, true);
    initChart(initData);
  };

  // Refresh chart with new data
  const refresh = (theData: CandlestickDataItem[]) => {
    if (chartInstance.current && theData.length > 0) {
      chartInstance.current.setOption({
        dataset: {
          source: theData
        },
      });
    }
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  }, [isReplay]); // 监听 isReplay 状态

  // Watch for data changes and update chart
  useEffect(() => {
    refresh(data);
  }, [data]);

  // Setup and cleanup
  useEffect(() => {
    setIsLoading(true);
    init();

    // Add window resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up chart resources');
      loop.stop();

      // Clear large array references
      setAllData({});
      setData([]);
      replayDatasRef.current = {};

      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // Handle symbol and time changes
  useEffect(() => {
    if (history[0] !== symbol) {
      // Symbol changed, reset everything
      loop.stop();
      setSwitched(false);
      setIsReplay(false);
      replayDatasRef.current = {};
      countRef.current = 0;
      setIsLoading(true);
      setReplay(false);
      setPrice(-1)
      setPriceUp(true)
      setPriceChange(0)

      fetchData(symbol);
      setHistory([symbol, time]);
    } else if (history[1] !== time) {
      // Only time frame changed
      if (!isReplay) {
        setData(allData?.[time as keyof CandlestickDataItems] || []);
      } else {
        if (switched) {
          loop.stop();
          setSwitched(false);
          refresh(replayDatasRef.current[time as keyof CandlestickDataItems] || []);
          loop.start(right, 500);
          setSwitched(true);
        }

        refresh(replayDatasRef.current[time as keyof CandlestickDataItems] || []);
      }
      setHistory([symbol, time]);
    }
  }, [symbol, time]);

  // Generates skeleton blocks for the loading state
  const renderSkeleton = () => (
    <div className="animate-pulse h-full w-full flex flex-col">
      {/* Chart area skeleton */}
      <div className="flex-1 bg-gray-800 w-full">
        <div className="h-full w-full flex flex-col">
          {/* Price indicators */}
          <div className="flex justify-between px-6 py-4">
            <div className="w-20 h-6 bg-gray-700 rounded"></div>
            <div className="w-24 h-6 bg-gray-700 rounded"></div>
            <div className="w-20 h-6 bg-gray-700 rounded"></div>
          </div>

          {/* Chart grid lines */}
          <div className="flex-1 px-6 py-4 grid grid-rows-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-0.5 bg-gray-700 rounded"></div>
            ))}
          </div>

          {/* Time indicators */}
          <div className="flex justify-between px-6 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-14 h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom slider skeleton */}
      <div className="h-12 bg-gray-800 w-full px-6 py-2">
        <div className="w-full h-full bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="relative rounded-lg h-full bg-[#131722] shadow-lg overflow-hidden">


      {isLoading && (
        renderSkeleton()
      )}
      {/* Chart container */}
      <div
        ref={chartRef}
        className="w-full h-full"
        aria-label="K-line Chart"
      />

      {/* Control panel */}
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
            onClick={() => {
              if (!isReplay) {
                console.log('Entering replay mode');
                replay(500);
              } else {
                console.log('Exiting replay mode');
                setIsReplay(!isReplay);
                if (switched) {
                  loop.stop();
                  setSwitched(false);
                }
                setPrice(-1)
                setPriceUp(true)
                setPriceChange(0)
                setReplay(false)
                refresh(allData[time as keyof CandlestickDataItems] || []);
              }
            }}
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
                onClick={() => {
                  if (isReplay) {
                    if (switched) {
                      console.log('Stopping replay');
                      loop.stop();
                    } else {
                      console.log('Starting replay');
                      loop.start(right, 500);
                    }
                    setSwitched(!switched);
                  }
                }}
              >
                {switched ? <StopIcon /> : <StartIcon />}
              </button>

              {!switched && (
                <button
                  disabled={switched}
                  className="p-2 bg-[#2962ff] text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                  onClick={right}
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