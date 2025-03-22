"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useData } from '@/hooks/use_data';

// 定义K线图数据类型
type CandlestickDataItem = [string, number, number, number, number, number, number];

const CandlestickChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const { getData } = useData()

  useEffect(() => {
    try{
    setIsLoading(true)
    getData()
    // 初始化图表
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      const upColor = '#ec0000';
      const upBorderColor = '#8A0000';
      const downColor = '#00da3c';
      const downBorderColor = '#008F28';
      const data = getData();
      const dataCount = data.length();
      
      const option: echarts.EChartsOption = {
        dataset: {
          source: data
        },
        title: {
          text: 'Data Amount: ' + echarts.format.addCommas(dataCount)
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: false
            }
          }
        },
        grid: [
          {
            left: '10%',
            right: '10%',
            bottom: 200
          },
          {
            left: '10%',
            right: '10%',
            height: 80,
            bottom: 80
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          },
          {
            type: 'category',
            gridIndex: 1,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          }
        ],
        yAxis: [
          {
            scale: true,
            splitArea: {
              show: true
            }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 10,
            end: 100
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            bottom: 10,
            start: 10,
            end: 100
          }
        ],
        visualMap: {
          show: false,
          seriesIndex: 1,
          dimension: 6,
          pieces: [
            {
              value: 1,
              color: upColor
            },
            {
              value: -1,
              color: downColor
            }
          ]
        },
        series: [
          {
            type: 'candlestick',
            itemStyle: {
              color: upColor,
              color0: downColor,
              borderColor: upBorderColor,
              borderColor0: downBorderColor
            },
            encode: {
              x: 0,
              y: [1, 4, 3, 2]
            }
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              color: '#7fbe9e'
            },
            large: true,
            encode: {
              x: 0,
              y: 5
            }
          }
        ]
      };

      chartInstance.current.setOption(option);
    }

    // 窗口大小改变时，重置图表大小

    window.addEventListener('resize', handleResize);
  }catch(e){
    console.log(e)
  }finally{
    setIsLoading(false)
  }

    // 组件卸载时清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  // 生成K线数据
  function generateOHLC(count: number): CandlestickDataItem[] {
    let data: CandlestickDataItem[] = [];
    let xValue = +new Date(2011, 0, 1);
    let minute = 60 * 1000;
    let baseValue = Math.random() * 12000;
    let boxVals = new Array(4);
    let dayRange = 12;
    
    for (let i = 0; i < count; i++) {
      baseValue = baseValue + Math.random() * 20 - 10;
      for (let j = 0; j < 4; j++) {
        boxVals[j] = (Math.random() - 0.5) * dayRange + baseValue;
      }
      boxVals.sort();
      let openIdx = Math.round(Math.random() * 3);
      let closeIdx = Math.round(Math.random() * 2);
      if (closeIdx === openIdx) {
        closeIdx++;
      }
      let volume = boxVals[3] * (1000 + Math.random() * 500);

      data[i] = [
        echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', (xValue += minute)),
        +boxVals[openIdx].toFixed(2),
        +boxVals[3].toFixed(2),
        +boxVals[0].toFixed(2),
        +boxVals[closeIdx].toFixed(2),
        +volume.toFixed(0),
        getSign(data, i, +boxVals[openIdx], +boxVals[closeIdx], 4) // sign
      ];
    }
    return data;
  }

  function getSign(
    data: CandlestickDataItem[], 
    dataIndex: number, 
    openVal: number, 
    closeVal: number, 
    closeDimIdx: number
  ): number {
    let sign: number;
    
    if (openVal > closeVal) {
      sign = -1;
    } else if (openVal < closeVal) {
      sign = 1;
    } else {
      sign =
        dataIndex > 0
          ? Number(data[dataIndex - 1][closeDimIdx]) <= closeVal
            ? 1
            : -1
          : 1;
    }
    
    return sign;
  }

  // 窗口大小改变时，重置图表大小
  const handleResize = () => {
    chartInstance.current?.resize();
  };

  return isLoading ? 
  (<p className='text-3xl'>正在加载数据.....</p>)
  : (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: '600px' 
      }}
    />
  );
};

export default CandlestickChart;