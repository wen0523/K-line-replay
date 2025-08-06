'use client'

import { useState, useRef, useEffect } from 'react'
import { init, dispose, KLineData, Chart, registerLocale } from 'klinecharts'
import { Button } from '@heroui/react'
import getData from '@/api/getData'

import { updateData } from '@/lib/utils'
import { CandlestickDataItems } from '@/types/index'
import { useAssetsStore } from '@/store/assetsStore'

export default () => {
  const [chart, setChart] = useState<Chart | null>(null)
  const [change, setChange] = useState<boolean>(false)
  const [selected, setSelected] = useState<string>('')
  const allDataRef = useRef<CandlestickDataItems>({});
  const allReplayDataRef = useRef<CandlestickDataItems>({});
  const replayRef = useRef(false);
  const replayCountRef = useRef(0);
  const countRef = useRef(0);// 记录5m(目前最小的)数据量
  const parameterRef = useRef({
    symbol: '',
    type: '',
    span: 0,
  })
  const assets = useAssetsStore((state) => state.assets);
  const setAssets = useAssetsStore((state) => state.setAssets);


 const timeUnitMap: { [key: string]: string } = {
  second: 's',
  minute: 'm',
  hour: 'h',
  day: 'd',
  week: 'w',
  month: 'M',
  year: 'y',
}


  const initChart = async () => {
    // 繁体中文
    registerLocale('zh-TW', {
      time: '時間：',
      open: '開：',
      high: '高：',
      low: '低：',
      close: '收：',
      volume: '量：',
      change: '漲跌：',
      turnover: '成交額：',
      second: '秒',
      minute: '分鐘',
      hour: '小時',
      day: '天',
      week: '週',
      month: '月',
      year: '年'
    })

    // 简体中文
    registerLocale('zh-CN', {
      time: '时间：',
      open: '开：',
      high: '高：',
      low: '低：',
      close: '收：',
      volume: '量：',
      change: '涨跌：',
      turnover: '成交额：',
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天',
      week: '周',
      month: '月',
      year: '年'
    })

    // 英文
    registerLocale('en-US', {
      time: 'Time: ',
      open: 'Open: ',
      high: 'High: ',
      low: 'Low: ',
      close: 'Close: ',
      volume: 'Volume: ',
      change: 'Change: ',
      turnover: 'Turnover: ',
      second: 'Second',
      minute: 'Minute',
      hour: 'Hour',
      day: 'Day',
      week: 'Week',
      month: 'Month',
      year: 'Year'
    })
    const chart = init('chart')
    if (!chart) {
      return
    }
    setChart(chart)
    chart.setSymbol({ ticker: 'BTCUSDT', pricePrecision: 1, volumePrecision: 0 })
    chart.setPeriod({ span: 1, type: 'day' })
    // chart.createIndicator('MA', false, { id: 'candle_pane' })
    // chart.createIndicator('VOL')

    chart.setDataLoader({
      getBars: async ({ type, timestamp, symbol, period, callback }) => {
        const parameter = parameterRef.current
        // console.log('type', type)
        // console.log('timestamp', timestamp)
        const assets = useAssetsStore.getState().assets;

        console.log(assets)

        if (parameter.symbol !== symbol.ticker) {// 交易对改变获取数据
          console.log('交易对改变获取数据')
          const response = await getData('BTCUSDT')
          allDataRef.current = response
          const key = period.span + timeUnitMap[period.type]
          callback(response[key] || [])
          parameterRef.current = {
            symbol: symbol.ticker,
            type: period.type,
            span: period.span,
          }
          // 初始化其他信息(*_*)

        } else if ((parameter.type !== period.type && !replayRef.current) || (parameter.span !== period.span && !replayRef.current)) {// 周期变化
          // 周期发生变化，但是 replay 没有开启
          console.log('周期变化')
          const allData = allDataRef.current
          const key = period.span + timeUnitMap[period.type]

          callback(allData[key] || [])
          parameterRef.current = {
            symbol: symbol.ticker,
            type: period.type,
            span: period.span,
          }
        } else {// replay
          if (replayRef.current) {// replay 开启
            if (parameter.type !== period.type || parameter.span !== period.span) {// 周期变化
              // 周期发生变化， replay 开启，只进行回溯数据的切换
              const allReplayData = allReplayDataRef.current
              const key = period.span + timeUnitMap[period.type]

              callback(allReplayData[key] || [])
              parameterRef.current = {
                symbol: symbol.ticker,
                type: period.type,
                span: period.span,
              }
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

              const key = period.span + timeUnitMap[period.type]
              callback(allReplayData[key]?.slice(0, count) || [])
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

            const key = period.span + timeUnitMap[period.type]
            allReplayDataRef.current = allReplayData
            replayRef.current = true;

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
    }
  }, [])

  const ChangeDatas = () => {
    if (change) {
      chart?.setDataLoader({
        getBars: ({ type, timestamp, symbol, period, callback }) => {
          callback([
            { timestamp: 1517846400000, open: 7424.6, high: 7511.3, low: 6032.3, close: 7310.1, volume: 224461 },
            { timestamp: 1517932800000, open: 7310.1, high: 8499.9, low: 6810, close: 8165.4, volume: 148807 },
            { timestamp: 1518019200000, open: 8166.7, high: 8700.8, low: 7400, close: 8245.1, volume: 24467 },
            { timestamp: 1518105600000, open: 8244, high: 8494, low: 7760, close: 8364, volume: 29834 },
            { timestamp: 1518192000000, open: 8363.6, high: 9036.7, low: 8269.8, close: 8311.9, volume: 28203 },
            { timestamp: 1518278400000, open: 8301, high: 8569.4, low: 7820.2, close: 8426, volume: 59854 },
            { timestamp: 1518364800000, open: 8426, high: 8838, low: 8024, close: 8640, volume: 54457 },
            { timestamp: 1518451200000, open: 8640, high: 8976.8, low: 8360, close: 8500, volume: 51156 },
            { timestamp: 1518537600000, open: 8504.9, high: 9307.3, low: 8474.3, close: 9307.3, volume: 49118 },
            { timestamp: 1518624000000, open: 9307.3, high: 9897, low: 9182.2, close: 9774, volume: 48092 }
          ])
        }
      })
      setChange(false)
    } else {
      chart?.setDataLoader({
        getBars: ({ type, timestamp, symbol, period, callback }) => {
          callback([
            { timestamp: 1609459200000, open: 45250.5, high: 46800.2, low: 44100.8, close: 46320.1, volume: 185432 },
            { timestamp: 1609545600000, open: 46320.1, high: 47950.3, low: 45800.5, close: 47650.8, volume: 203567 },
            { timestamp: 1609632000000, open: 47650.8, high: 48200.4, low: 46900.2, close: 47100.6, volume: 167890 },
            { timestamp: 1609718400000, open: 47100.6, high: 48500.9, low: 46500.3, close: 48200.7, volume: 198234 },
            { timestamp: 1609804800000, open: 48200.7, high: 49800.1, low: 47800.4, close: 49500.2, volume: 234567 },
            { timestamp: 1609891200000, open: 49500.2, high: 50200.8, low: 48900.1, close: 49800.5, volume: 189345 },
            { timestamp: 1609977600000, open: 49800.5, high: 51000.3, low: 49200.7, close: 50650.9, volume: 212678 },
            { timestamp: 1610064000000, open: 50650.9, high: 52100.4, low: 50100.2, close: 51800.6, volume: 245123 },
            { timestamp: 1610150400000, open: 51800.6, high: 53200.7, low: 51300.8, close: 52900.3, volume: 267890 },
            { timestamp: 1610236800000, open: 52900.3, high: 54500.1, low: 52400.5, close: 54200.8, volume: 298456 }
          ])
        }
      })
      setChange(true)
    }
  }

  return (
    <div className='flex flex-col'>
      <div className="flex gap-2 p-4 flex-wrap">
        {/* 时间周期按钮 */}
        <Button onClick={() => {
          chart?.setPeriod({ span: 1, type: 'hour' })
        }}>1Hour</Button>
        <Button onClick={() => {
          chart?.setPeriod({ span: 1, type: 'day' })
        }}>1Day</Button>
        <Button onClick={() => {
          chart?.setPeriod({ span: 5, type: 'minute' })
        }}>5min</Button>
        <Button onClick={ChangeDatas}>Change Data</Button>

        {/* 语言切换按钮 */}
        <Button onClick={() => {
          chart?.setLocale('zh-CN')
        }}>简体中文</Button>
        <Button onClick={() => {
          chart?.setLocale('zh-TW')
        }}>繁體中文</Button>
        <Button onClick={() => {
          chart?.setLocale('en-US')
        }}>English</Button>

        <Button onClick={() => {
          chart?.createOverlay({
            id: 'first' + Math.random(),
            name: 'segment',
            paneId: 'candle_pane',
            // points: [
            //   { timestamp: startData.timestamp, value: startData.high },
            //   { timestamp: endData.timestamp, value: endData.low }
            // ]
            onSelected: (e) => {
              setSelected(e.overlay.id)
              console.log(e.overlay.id)
            },
            onDeselected: (e) => {
              setSelected('')
              console.log(e.overlay.id)
            }
          })
        }}>
          Line
        </Button>
        <Button onClick={() => {
          chart?.createOverlay({
            id: 'horizontalRayLine' + Math.random(),
            name: 'horizontalRayLine',
            paneId: 'candle_pane',
            onSelected: (e) => {
              setSelected(e.overlay.id)
              console.log(e.overlay.id)
            },
            onDeselected: (e) => {
              setSelected('')
              console.log(e.overlay.id)
            }
            // points: [
            //   { timestamp: 1609459200000, value: 46320.1 },
            //   { timestamp: 1609545600000, value: 46320.1 }
            // ]
          })
        }}>
          horizontalRayLine
        </Button>
        <Button onClick={() => {
          if (selected) {
            chart?.removeOverlay({ id: selected })
            setSelected('')
          }
        }}>Remove</Button>
        <Button onClick={() => {
          setAssets(Number((Math.random()*100).toFixed(2)))


          chart?.resetData()
        }}>
          ResetData
        </Button>
        <Button onClick={() => {
          chart?.resetData()
        }}>
          startReplay
        </Button>
        <Button onClick={() => replayCountRef.current = 100}>
          100day
        </Button>
      </div>
      <div id="chart" className='w-screen h-[600px]' />
    </div>
  )

}
