'use client'

import { v4 as uuidv4 } from 'uuid'

import { useSymbolStore } from "@/store/symbolStore"
import { usePriceStore, usePriceUpStore, usePriceChangeStore } from "@/store/priceStore"
import { useOrderStore } from "@/store/orderStore"
import { useAssetsStore } from '@/store/assetsStore'
import { ToastProvider, addToast, Divider, Tabs, Tab, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Slider, Input, Checkbox, CardHeader } from "@heroui/react"
import { useState } from "react"

const CreateOrder = () => {
    const symbol = useSymbolStore(state => state.symbol)
    const price = usePriceStore(state => state.price)
    const priceUp = usePriceUpStore(state => state.priceUp)
    const priceChange = usePriceChangeStore(state => state.priceChange)
    const addOrder = useOrderStore(state => state.addOrder)
    const assets = useAssetsStore(state => state.assets)  // 这只是可用资产，不是总的资产，因为开逐仓时若有浮盈，总的资产会增加，可用资产不会增加
    const setAssets = useAssetsStore(state => state.setAssets)

    const [leverageValue, setLeverageValue] = useState("10.00x")
    const [filterValue, setFilterValue] = useState<'逐仓' | '全仓'>("逐仓")

    const [percentage, setPercentage] = useState<string>('')
    const [stoploss, setStoploss] = useState<string>('')
    const [takeprofit, setTakeprofit] = useState<string>('')
    const [isshow, setIsshow] = useState(false)

    const Order = (side: "买" | "卖") => {

        let amount = 0
        if (percentage.includes('%')) {
            amount = assets * Number(leverageValue.split('.')[0]) * Number(percentage.split('%')[0]) / 100
        } else {
            amount = Number(percentage)
            if (amount > assets * Number(leverageValue.split('.')[0])) {
                addToast({
                    description: "金额超过最大可开金额",
                    color: 'warning',
                })

                return
            }
        }

        if (isshow) {
            if (side === '买') {
                if (stoploss && Number(stoploss) > price) {
                    addToast({
                        description: "买单，止损价格不能高于开仓价格",
                        color: 'warning',
                    })
    
                    return
                }
    
                if (takeprofit && Number(takeprofit) < price) {
                    addToast({
                        description: "买单，止盈价格不能低于开仓价格",
                        color: 'warning',
                    })
    
                    return
                }
            } else {
                if (stoploss && Number(stoploss) <= price) {
                    addToast({
                        description: "卖单，止损价格不能低于开仓价格",
                        color: 'warning',
                    })
    
                    return
                }
    
                if (takeprofit && Number(takeprofit) >= price) {
                    addToast({
                        description: "卖单，止盈价格不能高于开仓价格",
                        color: 'warning',
                    })
    
                    return
                }
            }
        }

        let forcedliquidation = 0
        if (filterValue === '逐仓') {
            if (side === '买') {
                forcedliquidation = price - (1 / Number(leverageValue.split('.')[0])) * price
            } else {
                forcedliquidation = price + (1 / Number(leverageValue.split('.')[0])) * price
            }
            setAssets(assets - amount / Number(leverageValue.split('.')[0])) // 剩余可用资产
        } else {
            forcedliquidation = -1 //暂时无法解决，同时开多单的全仓的时候，会根据实现的盈亏不断变化
            setAssets(assets - amount) // 剩余可用资产,但不符合实际，当有浮盈的时候，可用资产会增加，但是这里没有实现
        }

        const data = new Date()
        const order = {
            'id': uuidv4(), // 订单ID
            'symbol': symbol,   // 交易对
            'price': price,   // 开仓价格
            'lever': leverageValue,   // 杠杆
            'amount': amount,  // 数量
            'side': side,   // 订单类型
            'type': filterValue,   // 仓位类型
            'stoploss': stoploss ? Number(stoploss) : -1,   // 止损
            'takeprofit': takeprofit ? Number(takeprofit) : -1,   // 止盈
            'forcedliquidation': forcedliquidation,   // 强平
            'createdAt': data.toISOString(),   // 开仓时间;
            // 可以根据需要添加更多字段
        }

        addOrder(order)
    }

    return (
        <div className="flex flex-col w-80 h-full rounded-tl-[6px]">
            <ToastProvider placement='top-center' toastOffset={60} />
            {/* Header */}
            <Card className="h-24 p-4 rounded-none rounded-tl-[6px]">
                <div className="flex justify-between items-center">
                    <div className="font-bold text-xl">{symbol}</div>
                    <div className={`text-lg font-medium ${priceUp ? "text-green-500" : "text-red-500"}`}>
                        ${price}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Perpetual</div>
                    <div className={`text-sm ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {priceChange}%  24h
                    </div>
                </div>
            </Card>

            {/* 杠杆选择器 */}
            <div className="h-fit flex justify-between items-center">
                <Dropdown className="min-w-32 w-32 rounded-md">
                    <DropdownTrigger>
                        <Button
                            className="w-1/2 h-9 px-3 text-sm flex border-r border-white dark:border-gray-400 items-center justify-between rounded-none"
                        >
                            {filterValue} <span className="ml-2 text-xs opacity-70">▼</span>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="过滤选项"
                        onAction={(key) => setFilterValue(key as "逐仓" | "全仓")}
                    >
                        <DropdownItem key="逐仓" className="text-center">逐仓</DropdownItem>
                        <DropdownItem key="全仓" className="text-center">全仓</DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <Dropdown className="min-w-32 w-32 rounded-md">
                    <DropdownTrigger>
                        <Button
                            className="border-l border-white dark:border-gray-400 w-1/2 h-9 px-3 text-sm flex items-center justify-between rounded-none"
                        >
                            <span className="font-medium">{leverageValue}</span> <span className="ml-2 text-xs opacity-70">▼</span>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="杠杆选项"
                        onAction={(key) => setLeverageValue(key.toString())}
                    >
                        <DropdownItem key="1.00x" className="text-center">1.00x</DropdownItem>
                        <DropdownItem key="5.00x" className="text-center">5.00x</DropdownItem>
                        <DropdownItem key="10.00x" className="text-center">10.00x</DropdownItem>
                        <DropdownItem key="20.00x" className="text-center">20.00x</DropdownItem>
                        <DropdownItem key="50.00x" className="text-center">50.00x</DropdownItem>
                        <DropdownItem key="100.00x" className="text-center">100.00x</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <Tabs
                aria-label="交易选项"
                className="bg-white dark:bg-gray-800 h-fit w-full border-1 block grid grid-cols-2 gap-4"
                variant="underlined"
            >
                <Tab key="limit" title={<div className="py-2">限价委托</div>} className="h-full p-0">
                    <Card className="h-full rounded-none">
                        <CardBody className="p-4">
                            {/* 价格输入 */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>价格 (USDT)</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="0.00"
                                        defaultValue="103,252.8"
                                    />
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">
                                        对手价
                                    </div>
                                </div>
                            </div>

                            {/* 数量输入 */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>数量 (USDT)</span>
                                </div>
                                <div className="space-y-2">
                                    {/* 滑块 */}
                                    <div className="w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full relative">
                                        <div className="absolute left-0 right-0 flex justify-between">
                                            <div className="h-3 w-3 bg-blue-500 border-2 border-white dark:border-gray-900 rounded-full -mt-1 cursor-pointer hover:scale-110 transition-transform"></div>
                                            <div className="h-3 w-3 bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-900 rounded-full -mt-1 cursor-pointer hover:scale-110 transition-transform"></div>
                                            <div className="h-3 w-3 bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-900 rounded-full -mt-1 cursor-pointer hover:scale-110 transition-transform"></div>
                                            <div className="h-3 w-3 bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-900 rounded-full -mt-1 cursor-pointer hover:scale-110 transition-transform"></div>
                                            <div className="h-3 w-3 bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-900 rounded-full -mt-1 cursor-pointer hover:scale-110 transition-transform"></div>
                                        </div>
                                    </div>

                                    {/* 滑块标签 */}
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                                        <span>0</span>
                                        <span>100%</span>
                                    </div>

                                    {/* 可用金额信息 */}
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-500">可用 96.17 USDT</span>
                                        <span className="text-blue-500">
                                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                        </span>
                                    </div>

                                    {/* 杠杆信息 */}
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                                        <span>可开多 1,889.52 USDT</span>
                                        <span>可开空 1,899.66 USDT</span>
                                    </div>
                                </div>
                            </div>

                            {/* 止盈止损选项 */}
                            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                <div className="flex items-center mb-2">
                                    <input type="checkbox" className="mr-2 w-4 h-4 accent-blue-500" id="stopLossLimit" />
                                    <label htmlFor="stopLossLimit" className="text-sm">止盈/止损</label>
                                    <span className="ml-auto text-xs text-blue-500 cursor-pointer hover:underline">高级</span>
                                </div>

                                {/* 止盈价格 */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>止盈价格 (USDT)</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-500 dark:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                                        disabled
                                    />
                                </div>

                                {/* 止损价格 */}
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>止损价格 (USDT)</span>
                                    </div>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-500 dark:text-gray-400"
                                            disabled
                                        />
                                        <select className="ml-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-xs text-gray-500 dark:text-gray-400">
                                            <option>最新</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 买入卖出按钮 */}
                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-3 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30 dark:shadow-green-900/30">
                                    开多
                                </button>
                                <button className="py-3 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30 dark:shadow-red-900/30">
                                    开空
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="market" title={<div className="py-2">市价委托</div>} className="h-full p-0">
                    <Card className="h-full rounded-none">
                        <CardBody className="p-4">
                            {/* 市价委托内容 - 不需要价格输入 */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>市价 (USDT)</span>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-3 text-gray-700 dark:text-gray-300 text-sm">
                                    以市场最优价格成交
                                </div>
                            </div>

                            {/* 数量输入 */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>数量 (USDT)</span>
                                </div>
                                <div className="space-y-2">
                                    {/* 仓位大小 */}
                                    <Input
                                        value={percentage}
                                        aria-label="仓位大小"
                                        className="w-full"
                                        radius="sm"
                                        onValueChange={(value: string) => {
                                            if (Number(value) || value === '') {
                                                setPercentage(value);
                                            }
                                        }}
                                    />

                                    {/* 滑块 */}
                                    <Slider
                                        aria-label="仓位百分比"
                                        className="max-w-md"
                                        defaultValue={0}
                                        onChange={(value) => {
                                            if (Array.isArray(value)) {
                                                setPercentage('数据错误，请手动输入')
                                            } else {
                                                setPercentage(String(value) + '%')
                                            }
                                        }}
                                        maxValue={100}
                                        minValue={0}
                                        step={1}
                                        size='sm'
                                        color="foreground"
                                    />

                                    {/* 滑块标签 */}
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                                        <span>0</span>
                                        <span>100%</span>
                                    </div>

                                    {/* 可用金额信息 */}
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-500">可用 {(assets).toFixed(2)} USDT</span>
                                        <span className="text-blue-500">
                                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                        </span>
                                    </div>

                                    {/* 杠杆信息 */}
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                                        <span>可开多 {(assets * Number(leverageValue.split('.')[0])).toFixed(2)} USDT</span>
                                        <span>可开空 {(assets * Number(leverageValue.split('.')[0])).toFixed(2)} USDT</span>
                                    </div>
                                </div>
                            </div>
                            <Divider />

                            {/* 止盈止损选项 */}
                            <Card className="mb-4 pb-3 rounded-md bg-transparent"
                                shadow="none"
                            >
                                <CardHeader className="px-0">
                                    <Checkbox
                                        size="sm"
                                        radius="sm"
                                        onValueChange={(value) => setIsshow(value)}
                                    >止盈/止损</Checkbox>
                                </CardHeader>

                                {isshow && <CardBody className="px-0">
                                    {/* 止盈价格 */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span>止盈价格 (USDT)</span>
                                        </div>
                                        <Input
                                            value={takeprofit}
                                            aria-label="止盈价格"
                                            className="w-full"
                                            radius="sm"
                                            onValueChange={(value: string) => {
                                                if (Number(value) || value === '') {
                                                    setTakeprofit(value);
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* 止损价格 */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span>止损价格 (USDT)</span>
                                        </div>
                                        <div className="flex">
                                            <Input
                                                value={stoploss}
                                                aria-label="止损价格"
                                                className="w-full"
                                                radius="sm"
                                                onValueChange={(value: string) => {
                                                    if (Number(value) || value === '') {
                                                        setStoploss(value);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                                }
                            </Card>

                            {/* 买入卖出按钮 */}
                            <div className="grid grid-cols-2 gap-8">
                                <Button
                                    onPress={() => {
                                        Order('买')
                                    }}
                                    color="success" className="py-3 rounded-full font-medium">
                                    开多
                                </Button>
                                <Button
                                    onPress={() => {
                                        Order('卖')
                                    }}
                                    color="danger" className="py-3 rounded-full font-medium">
                                    开空
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    )
}

export default CreateOrder