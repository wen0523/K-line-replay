"use client";

import React, { useEffect, useRef, useState, } from 'react';
import * as echarts from 'echarts';
import { useSearchParams } from "react-router-dom";
import { useData } from '../../hooks/use_data';
import { updateData, updateTime } from '../../lib/utils';
import IntervalLoop from '@/src/lib/IntervalLoop';

//svg
import SpeedIcon from '../svg/speed';
import { StartIcon, StopIcon } from '../svg/switch';

// 定义K线图数据类型 - 每项包含: [日期, 开盘价, 最高价, 最低价, 收盘价, 成交量, 涨跌标志]
type CandlestickDataItem = [string, number, number, number, number, number];
type CandlestickDataItems = {
  '1d'?: CandlestickDataItem[],
  '4h'?: CandlestickDataItem[],
  '1h'?: CandlestickDataItem[],
  '15m'?: CandlestickDataItem[],
  '5m'?: CandlestickDataItem[],
}

const CandlestickChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 初始状态设为true更合理

  const [allData, setAllData] = useState<CandlestickDataItems>({});
  const [data, setData] = useState<CandlestickDataItem[]>([]);
  const [isrePlay, setIsReplay] = useState(false);
  const replayDatasRef = useRef<CandlestickDataItems>({});
  const countRef = useRef(0);
  const closeRef = useRef(0);
  const isLoadData = useRef(false);

  const { getData } = useData();

  const [switched, setSwitched] = useState(false); // 控制定时器的开关
  const [loop, setLoop] = useState<IntervalLoop>(new IntervalLoop()); // 创建一个定时器实例

  const [searchParams, setSearchParams] = useSearchParams();

  const currency = searchParams.get("currency") || "BTC/USDT";
  const timeRange = searchParams.get("timeRange") || "1d";
  const [history, setHistory] = useState([currency, timeRange]);

  const replay = (replayTime: number) => {
    if (!isrePlay) { // 如果不是回放状态，则开始回放
      // 初始化回溯数据
      replayDatasRef.current = {
        '1d': allData['1d']?.slice(0, replayTime),
        '4h': allData['4h']?.slice(0, replayTime * 6),
        '1h': allData['1h']?.slice(0, replayTime * 24),
        '15m': allData['15m']?.slice(0, replayTime * 96),
        '5m': allData['5m']?.slice(0, replayTime * 288),
      }
      refresh(replayDatasRef.current[timeRange as keyof CandlestickDataItems] || [])
      countRef.current = replayTime * 288;
      closeRef.current = allData['5m']?.[countRef.current - 1]?.[4] || 0;
      setIsReplay(true);
    }
  }

  const right = () => {
    if (isrePlay && !isLoadData.current) {
      isLoadData.current = true;
      if (!replayDatasRef.current || Object.keys(replayDatasRef.current).length === 0) {
        console.warn("replayDatasRef.current is empty, skipping right function");
        isLoadData.current = false;
        if (switched) {
          loop.stop();
        }
        return; // 如果 replayDatasRef.current 为空，则直接返回
      }
      if (allData['5m'] && countRef.current >= allData['5m']?.length) {
        console.warn("countRef.current exceeds data length, skipping right function");
        if (switched) {
          loop.stop();
        }
        return; // 如果 countRef.current 超过数据长度，则直接返回
      }

      const m5Data = allData['5m']?.[countRef.current] as CandlestickDataItem;

      const m15Length = replayDatasRef.current['15m']?.length || 0;
      const m15Data = replayDatasRef.current['15m']?.[m15Length - 1] as CandlestickDataItem;

      const h1Length = replayDatasRef.current['1h']?.length || 0;
      const h1Data = replayDatasRef.current['1h']?.[h1Length - 1] as CandlestickDataItem;

      const h4Length = replayDatasRef.current['4h']?.length || 0;
      const h4Data = replayDatasRef.current['4h']?.[h4Length - 1] as CandlestickDataItem;

      const d1Length = replayDatasRef.current['1d']?.length || 0;
      const d1Data = replayDatasRef.current['1d']?.[d1Length - 1] as CandlestickDataItem;

      //5m数据
      replayDatasRef.current['5m']?.push(m5Data);

      // 1d数据
      if (d1Length != 0 && d1Length * 288 === countRef.current) {
        replayDatasRef.current['1d']?.push(updateTime([...m5Data], 'd'));
      } else if (d1Length != 0 && replayDatasRef.current['1d']) {
        replayDatasRef.current['1d'][d1Length - 1] = updateData([...d1Data], [...m5Data]);
      }

      // 4h数据
      if (h4Length != 0 && h4Length * 48 === countRef.current) {
        replayDatasRef.current['4h']?.push(updateTime([...m5Data], 'h'));
      } else if (h4Length != 0 && replayDatasRef.current['4h']) {
        replayDatasRef.current['4h'][h4Length - 1] = updateData([...h4Data], [...m5Data]);
      }

      // 1h数据
      if (h1Length != 0 && h1Length * 12 === countRef.current) {
        replayDatasRef.current['1h']?.push(updateTime([...m5Data], 'h'));
      } else if (h1Length != 0 && replayDatasRef.current['1h']) {
        replayDatasRef.current['1h'][h1Length - 1] = updateData([...h1Data], [...m5Data]);
      }

      // 15m数据
      if (m15Length != 0 && m15Length * 3 === countRef.current) {
        replayDatasRef.current['15m']?.push(m5Data);
      } else if (m15Length != 0 && replayDatasRef.current['15m']) {
        replayDatasRef.current['15m'][m15Length - 1] = updateData([...m15Data], [...m5Data]);
      }
      closeRef.current = m5Data[4];
      countRef.current++;

      if (Object.keys(replayDatasRef.current).length != 0) {
        console.log(timeRange)
        refresh(replayDatasRef.current[timeRange as keyof CandlestickDataItems] || [])
      }

      isLoadData.current = false;
    }
  }

  // Resize
  const handleResize = () => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  };

  // 初始化图表的函数，使用useCallback避免重复创建
  const initChart = async (initData: CandlestickDataItem[] | undefined) => {
    if (!chartRef.current) return;

    try {

      // 如果已经有实例，先销毁它
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 初始化ECharts实例
      chartInstance.current = echarts.init(chartRef.current);

      // 设置颜色方案
      const upColor = '#00da3c';        // 上涨蜡烛颜色（绿色）
      const upBorderColor = '#008f28';  // 上涨蜡烛边框颜色
      const downColor = '#ec0000';      // 下跌蜡烛颜色（红色）
      const downBorderColor = '#8a0000'; // 下跌蜡烛边框颜色

      if (!initData || !Array.isArray(initData) || initData.length === 0) {
        throw new Error('没有获取到数据');
      }

      const dataCount = initData.length;

      // 配置ECharts选项
      const option: echarts.EChartsOption = {
        // 数据集配置
        dataset: {
          source: initData // 直接使用API返回的数据
        },

        // 提示框配置 - 当鼠标悬停在数据点上时显示的信息
        tooltip: {
          trigger: 'axis',
          triggerOn: 'mousemove|click', // 减少触发频率
          backgroundColor: 'rgba(245, 240, 240, 0.7)',
          borderColor: '#333',
          borderWidth: 1,
          textStyle: {
            color: 'black',
            fontFamily: 'Arial, sans-serif',
            fontSize: 12
          },
          padding: 10,
          axisPointer: {
            type: 'cross',  // 改为'cross'类型，显示十字准线
            lineStyle: {    // 可以设置线条样式
              color: '#555',
              width: 1,
              type: 'dashed'  // 使用虚线
            },
          },
          formatter: (params) => {
            if (Array.isArray(params)) {
              const data = params[0].data as CandlestickDataItem;
              const [date, open, high, low, close, volume] = data;

              // 计算涨跌幅
              const priceChangePercent = Number(((close - open) / open * 100).toFixed(2));
              const changeColor = close >= open ? '#00da3c' : '#ec0000';

              return `
              <div>
                <strong>${date}</strong><br/>
                开盘价: ${open}<br/>
                最高价: ${high}<br/>
                最低价: ${low}<br/>
                收盘价: ${close}<br/>
                <span style="color:${changeColor}">涨跌: ${priceChangePercent > 0 ? '+' : ''}${priceChangePercent}%</span><br/>
                振幅: ${Math.abs(Number((((high - low) / low * 100).toFixed(2))))}%<br/>
                成交量: ${volume}<br/>
              </div>
            `;
            } else {
              return `
              <div>
                <strong>数据获取失败</strong><br/>
              </div>
              `
            }
          }
        },

        // 网格配置 - 定义图表的布局
        grid: [
          {
            left: '5%',      // 主图表区域
            right: '3%',
            bottom: 100
          },
        ],

        // X轴配置 - K线图
        xAxis: [
          {
            type: 'category',   // 类目轴，适用于离散数据
            boundaryGap: false, // 两边留白策略
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',     // 起始值为数据最小值
            max: 'dataMax'      // 结束值为数据最大值
          },
        ],

        // Y轴配置 - 同样有两个y轴
        yAxis: [
          {
            scale: true,        // 不强制从零开始，根据数据自动调整
            splitArea: {
              show: true        // 显示分隔区域
            }
          },
        ],

        // 区域缩放组件配置
        dataZoom: [
          {
            type: 'inside',     // 内置型数据区域缩放组件（鼠标滚轮缩放）
            xAxisIndex: [0],    // 控制x轴
            start: 0,          // 数据窗口范围的起始百分比
            end: 20            // 数据窗口范围的结束百分比
          },
          {
            show: true,
            xAxisIndex: [0],
            type: 'slider',     // 滑动条型数据区域缩放组件
            bottom: 10,
            start: 0,
            end: 20
          }
        ],
        animationDuration: 300, // 默认1000ms，设为300ms
        animationEasing: 'linear', // 使用线性动画

        // 系列配置 - 定义图表类型和数据映射
        series: [
          {
            type: 'candlestick',  // K线图类型
            animationDurationUpdate: 150, // 数据更新动画时间
            itemStyle: {
              color: upColor,      // 上涨时的填充色
              color0: downColor,   // 下跌时的填充色
              borderColor: upBorderColor,    // 上涨时的边框色
              borderColor0: downBorderColor  // 下跌时的边框色
            },
            encode: {
              x: 0,                // x轴映射data中的第1个值（日期）
              y: [1, 4, 3, 2]      // y轴映射data中的[开盘价, 收盘价, 最低价, 最高价]
            }
          },
        ]
      };

      // 设置配置项并渲染图表
      chartInstance.current.setOption(option);

    } catch (e) {
      console.error('初始化图表失败:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取数据
  const fetchData = async (coin: string, init = false) => {
    const response = await getData(coin);
    setAllData(response);
    closeRef.current = response['5m']?.[response['5m']?.length - 1]?.[4] || 0;
    if (init) {
      // init
      return response[timeRange]
    } else {
      setData(response[timeRange] || []);
      setIsLoading(false);
    }
  }

  // 防止在数据返回之前图表先初始化
  const init = async () => {
    const initData = await fetchData(currency, true);
    initChart(initData);
  };


  const refresh = (theData: CandlestickDataItem[]) => {
    if (chartInstance.current) {
      // 刷新图表数据
      chartInstance.current.setOption({
        dataset: {
          source: theData
        },
      });
    }
  };

  useEffect(() => {

  }, [isrePlay, switched])

  // 监听data数据变化，以便更新data数据并更新图表
  useEffect(() => {
    refresh(data)
  }, [data])

  // 监听allData数据变化，以便更新allData数据
  useEffect(() => {
  }, [allData])

  // 组件挂载时获取数据并初始化图表
  useEffect(() => {
    setSearchParams({
      currency: "BTC/USDT", timeRange: "1d"
    });

    setIsLoading(true);

    init();

    // 添加窗口大小变化的监听器
    window.addEventListener('resize', handleResize);

    // 组件卸载时清理事件监听器和图表实例
    return () => {
      console.log('清理事件监听器和图表实例');
      loop.stop();
      // 清理大数组引用
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

  useEffect(() => {
    if (history[0] !== currency) {
      loop.stop();
      setSwitched(false);
      setIsReplay(false);
      replayDatasRef.current = {};
      countRef.current = 0;
      closeRef.current = 0;
      setIsLoading(true);

      fetchData(currency);
      setHistory([currency, timeRange]);
    } else if (history[1] !== timeRange) {
      if (!isrePlay) {
        setData(allData?.[timeRange as keyof CandlestickDataItems] || []);
      } else {
        if (switched) {
          loop.stop();
          setSwitched(false);
          refresh(replayDatasRef.current[timeRange as keyof CandlestickDataItems] || [])
          loop.start(right, 500);
          setSwitched(true);
        }

        refresh(replayDatasRef.current[timeRange as keyof CandlestickDataItems] || [])
      }
      setHistory([currency, timeRange]);
    }
  }, [currency, timeRange])

  return (
    <div className="relative w-full rounded-[6px] h-full bg-white">
      <div
        ref={chartRef}
        className="w-full h-full"
        aria-label="K线图"
      >
        {/* {isLoading && (<div className=''></div>)} */}
      </div>

      {/* 叠加在图表上的控制面板 */}
      {!isLoading &&
        <div className="absolute top-2 right-[10%] flex flex-row items-center justify-between">
          <div>
            <span>数据日期:{allData['1d']?.[0]?.[0]}~{allData['1d']?.[allData['1d']?.length - 1]?.[0]}</span>
            <button
              className="px-3 py-1.5 bg-white text-[#0056b3] border border-[#0056b3] rounded"
              onClick={() => {
                replay(200)
              }}
            >
              {isrePlay ? 'K线回放' : 'K线模式'}
            </button>
          </div>

          {isrePlay ?
            <div className="flex items-center">
              <button
                className="ml-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-300 rounded-[6px]"
                onClick={
                  () => {
                    if (isrePlay) {
                      if (switched) {
                        console.log('停止');
                        loop.stop();
                      } else {
                        console.log('开始');
                        loop.start(right, 500);
                      }
                      setSwitched(!switched);
                    }
                  }
                }
              >
                {switched ? <StopIcon /> : <StartIcon />}
              </button>
              {switched ? < div className="ml-2 px-3 py-1.5"></div> :
                <button
                  disabled={switched}
                  className="ml-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-300 rounded-[6px]"
                  onClick={right}
                >
                  <SpeedIcon />
                </button>
              }
            </div>
            : <></>
          }
        </div>}

    </div>
  );
};

export default CandlestickChart;