"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSymbolStore } from '@/store/symbolStore';
import { useTimeStore } from '@/store/timeStore';
import { usePriceStore, usePriceChangeStore, usePriceUpStore } from '@/store/priceStore';
import { useChartInstanceStore } from '@/store/chartInstanceStore';
import { useReplaySwitchStore } from '@/store/switchStore';



// SVG 图标
import SpeedIcon from '../svg/speed';
import { StartIcon, StopIcon } from '../svg/switch';

import { init, dispose, KLineData, Chart, registerLocale } from 'klinecharts'
import { Button } from '@heroui/react'
import getData from '@/api/getData'

import { updateData } from '@/lib/utils'
import type { KLineDataItem, CandlestickDataItems } from '@/types';
import { TimeUnitMap } from '@/lib/timeUnitMap'
import { Language, languages } from '@/i18n';

const CandlestickChart: React.FC = () => {
  const allDataRef = useRef<CandlestickDataItems>({});
  const allReplayDataRef = useRef<CandlestickDataItems>({});
  const replayCountRef = useRef(100);
  const countRef = useRef(0);// 记录5m(目前最小的)数据量
  const parameterRef = useRef({
    symbol: '',
    type: '',
    span: 0,
  })

  const initChart = async () => {
    // 语言配置，是否单独放在一个文件中(*_*)
    for (const lang of Object.keys(languages) as Language[]) {
      registerLocale(lang, languages[lang])
    }
    const chart = init('chart')
    if (!chart) {
      return
    }
    useChartInstanceStore.getState().setChartInstance(chart)

    chart.setSymbol({ ticker: 'BTCUSDT', pricePrecision: 1, volumePrecision: 0 })
    chart.setPeriod({ span: 1, type: 'day' })
    // chart.createIndicator('MA', false, { id: 'candle_pane' })
    // chart.createIndicator('VOL')

    chart.setDataLoader({
      getBars: async ({ type, timestamp, symbol, period, callback }) => {
        const parameter = parameterRef.current
        const replaySwitch = useReplaySwitchStore.getState().startReplaySwitch
        const setReplaySwitch = useReplaySwitchStore.getState().setStartReplaySwitch
        const exitReplaySwitch = useReplaySwitchStore.getState().exitReplaySwitch

        if (parameter.symbol !== symbol.ticker) {// 交易对改变获取数据
          console.log('交易对改变获取数据')
          const response = await getData(symbol.ticker)
          allDataRef.current = response
          const key = period.span + TimeUnitMap[period.type]
          console.log(key)

          callback(response[key] || [])
          parameterRef.current = {
            symbol: symbol.ticker,
            type: period.type,
            span: period.span,
          }
          // 初始化其他信息(*_*)
          if (replaySwitch) {// 后期考虑在回放中切换交易对时，是否需要重置回放（在配置中设置）
            setReplaySwitch(false)
          }

        } else if ((parameter.type !== period.type && !replaySwitch) || (parameter.span !== period.span && !replaySwitch)) {// 周期变化
          // 周期发生变化，但是 replay 没有开启
          console.log('周期变化')
          const allData = allDataRef.current
          const key = period.span + TimeUnitMap[period.type]

          callback(allData[key] || [])
          parameterRef.current = {
            symbol: symbol.ticker,
            type: period.type,
            span: period.span,
          }
        } else {// replay
          if (replaySwitch) {// replay 开启
            if (parameter.type !== period.type || parameter.span !== period.span) {// 周期变化
              // 周期发生变化， replay 开启，只进行回溯数据的切换
              const allReplayData = allReplayDataRef.current
              const key = period.span + TimeUnitMap[period.type]

              callback(allReplayData[key] || [])
              parameterRef.current = {
                symbol: symbol.ticker,
                type: period.type,
                span: period.span,
              }
            } else if (exitReplaySwitch) { // 退出回放(*_*)
              setReplaySwitch(false)
              const allData = allDataRef.current
              const key = period.span + TimeUnitMap[period.type]

              callback(allData[key] || [])
            } else {// 数据更新
              const allReplayData = allReplayDataRef.current
              const allData = allDataRef.current
              const count = countRef.current

              if (count > (allData['5m']?.length || 0)) {// 数据量不足,5m改成自动获取到最小的，加上自动结束(*_*)
                return
              }
              const minData = allData['5m']?.[count]
              const m15Length = allReplayData['15m']?.length || 0;
              const m15Data = allReplayData['15m']?.[m15Length - 1] as KLineData;

              const h1Length = allReplayData['1h']?.length || 0;
              const h1Data = allReplayData['1h']?.[h1Length - 1] as KLineData;

              const h4Length = allReplayData['4h']?.length || 0;
              const h4Data = allReplayData['4h']?.[h4Length - 1] as KLineData;

              const d1Length = allReplayData['1d']?.length || 0;
              const d1Data = allReplayData['1d']?.[d1Length - 1] as KLineData;
              if (minData) {
                allReplayData['5m']?.push(minData)
                // 改成自动的(*_*)
                // 更新所有时间周期的数据
                // 1日数据
                if (d1Length != 0 && d1Length * 288 === countRef.current) {
                  allReplayData['1d']?.push(minData);
                } else if (d1Length != 0 && allReplayData['1d']) {
                  allReplayData['1d'][d1Length - 1] = updateData(d1Data, minData);
                }

                // const data = allReplayData['1d']; 
                // if (data) {
                //   const data1d = data[data.length - 1];
                //   const priceChange = Number(((data1d[4] - data1d[1]) / data1d[1] * 100).toFixed(2));
                //   setPriceChange(priceChange);
                // }

                // 4小时数据
                if (h4Length != 0 && h4Length * 48 === countRef.current) {
                  allReplayData['4h']?.push(minData);
                } else if (h4Length != 0 && allReplayData['4h']) {
                  allReplayData['4h'][h4Length - 1] = updateData(h4Data, minData);
                }

                // 1小时数据
                if (h1Length != 0 && h1Length * 12 === countRef.current) {
                  allReplayData['1h']?.push(minData);
                } else if (h1Length != 0 && allReplayData['1h']) {
                  allReplayData['1h'][h1Length - 1] = updateData(h1Data, minData);
                }

                // 15分钟数据
                if (m15Length != 0 && m15Length * 3 === countRef.current) {
                  allReplayData['15m']?.push(minData);
                } else if (m15Length != 0 && allReplayData['15m']) {
                  allReplayData['15m'][m15Length - 1] = updateData(m15Data, minData);
                }
              }
              countRef.current++
              allReplayDataRef.current = allReplayData

              const key = period.span + TimeUnitMap[period.type]
              callback(allReplayData[key] || [])
            }
          } else {// startReplay, 初始化replay数据
            // 会不会数据内存太大(*_*)
            const allData = allDataRef.current
            const replayCount = replayCountRef.current

            const allReplayData = {} as CandlestickDataItems
            // 改成自动化的(*_*)
            allReplayData['1d'] = allData['1d']?.slice(0, replayCount)
            allReplayData['4h'] = allData['4h']?.slice(0, replayCount * 6)
            allReplayData['1h'] = allData['1h']?.slice(0, replayCount * 24)
            allReplayData['15m'] = allData['15m']?.slice(0, replayCount * 96)
            allReplayData['5m'] = allData['5m']?.slice(0, replayCount * 288)

            countRef.current = replayCount * 288

            const key = period.span + TimeUnitMap[period.type]
            allReplayDataRef.current = allReplayData
            // 回放数据初始化成功，开启回放
            setReplaySwitch(true);

            callback(allReplayData[key] || [])
          }
        }
      }
    })
  }

  useEffect(() => {
    initChart()
    return () => {
      dispose('chart')
      useChartInstanceStore.getState().setChartInstance(null)
    }
  }, [])

  return (
    <div id="chart" className='w-full h-full bg-surface' />
  )
};

export default CandlestickChart;