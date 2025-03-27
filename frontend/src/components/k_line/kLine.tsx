"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { useData } from '../../hooks/use_data';

// 定义K线图数据类型 - 每项包含: [日期, 开盘价, 最高价, 最低价, 收盘价, 成交量, 涨跌标志]
type CandlestickDataItem = [string, number, number, number, number, number];

const CandlestickChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 初始状态设为true更合理
  // const [data, setData] = useState<CandlestickDataItem[]>([]);

  const { getData } = useData();

  // Resize
  const handleResize = () => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  };

  // 初始化图表的函数，使用useCallback避免重复创建
  const initChart = async () => {
    if (!chartRef.current) return;

    try {
      setIsLoading(true);

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

      // 获取数据
      const data = await getData();

      if (!data || data.length === 0) {
        throw new Error('没有获取到数据');
      }

      const dataCount = data.length;

      // 配置ECharts选项
      const option: echarts.EChartsOption = {
        // 数据集配置
        dataset: {
          source: data // 直接使用API返回的数据
        },

        // 标题配置
        title: {
          text: '数据总量: ' + echarts.format.addCommas(dataCount)
        },

        // 提示框配置 - 当鼠标悬停在数据点上时显示的信息
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50,50,50,0.7)',
          borderColor: '#333',
          borderWidth: 1,
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          padding: 10,
          axisPointer: {
            type: 'line'
          },
          formatter: (params) => {
            if (Array.isArray(params)) {
              const data = params[0].data as CandlestickDataItem;
              const [date, open, high, low, close, volume] = data;
              return `
              <div>
                <strong>${date}</strong><br/>
                开盘价: ${open}<br/>
                最高价: ${high}<br/>
                最低价: ${low}<br/>
                收盘价: ${close}<br/>
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
            right: '1%',
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
            start: 10,          // 数据窗口范围的起始百分比
            end: 100            // 数据窗口范围的结束百分比
          },
          {
            show: true,
            xAxisIndex: [0],
            type: 'slider',     // 滑动条型数据区域缩放组件
            bottom: 10,
            start: 10,
            end: 100
          }
        ],

        // 系列配置 - 定义图表类型和数据映射
        series: [
          {
            type: 'candlestick',  // K线图类型
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

  useEffect(() => {
    // 初始化图表
    initChart();
    console.log('initChart')

    // 添加窗口大小变化的监听器
    window.addEventListener('resize', handleResize);

    // 组件卸载时清理事件监听器和图表实例
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      className="w-full h-[600px]"
      aria-label="K线图"
    >
    </div>
  );
};

export default CandlestickChart;