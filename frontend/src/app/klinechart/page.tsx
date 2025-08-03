'use client'

import { useState, useEffect } from 'react'
import { init, dispose, KLineData, Chart, registerLocale } from 'klinecharts'
import { Button } from '@heroui/react'

export default () => {
  const [chart, setChart] = useState<Chart | null>(null)
  const [change, setChange] = useState<boolean>(false)
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
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
    chart.setSymbol({ ticker: 'TestSymbol', pricePrecision: 1, volumePrecision: 0 })
    chart.setPeriod({ span: 1, type: 'day' })
    chart.createIndicator('MA', false, { id: 'candle_pane' })
    chart.createIndicator('VOL')

    chart.setDataLoader({
      getBars: ({ callback }: { callback: (data: KLineData[]) => void }) => {
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
    return () => {
      dispose('chart')
    }
  }, [])

  const ChangeDatas = () => {
    if (change) {
      chart?.setDataLoader({
        getBars: ({ callback }: { callback: (data: KLineData[]) => void }) => {
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
        getBars: ({ callback }: { callback: (data: KLineData[]) => void }) => {
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
          chart?.setPeriod({ span: 1, type: 'week' })
        }}>Week</Button>
        <Button onClick={() => {
          chart?.setPeriod({ span: 1, type: 'month' })
        }}>Month</Button>
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
            id: 'first',
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
            id: 'horizontalRayLine'+Math.random(),
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
      </div>
      <div id="chart" className='w-screen h-[600px]' />
    </div>
  )

}
