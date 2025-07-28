'use client'

import { Card, CardBody, Input, Slider, Checkbox, CardHeader, Divider, Button } from "@heroui/react"
import { useAssetsStore } from '@/store/assetsStore'

interface OrderFormProps {
    percentage: string
    setPercentage: (value: string) => void
    stoploss: string
    setStoploss: (value: string) => void
    takeprofit: string
    setTakeprofit: (value: string) => void
    isshow: boolean
    setIsshow: (value: boolean) => void
    onBuyOrder: () => void
    onSellOrder: () => void
    leverageValue: string
    isMarketOrder?: boolean
}

const OrderForm = ({
    percentage,
    setPercentage,
    stoploss,
    setStoploss,
    takeprofit,
    setTakeprofit,
    isshow,
    setIsshow,
    onBuyOrder,
    onSellOrder,
    leverageValue,
    isMarketOrder = false
}: OrderFormProps) => {
    const assets = useAssetsStore(state => state.assets)

    return (
        <Card className="h-full rounded-none">
            <CardBody className="p-4">
                {/* 价格输入 - 仅限价委托显示 */}
                {!isMarketOrder && (
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
                )}

                {/* 市价委托说明 */}
                {isMarketOrder && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span>市价 (USDT)</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-3 text-gray-700 dark:text-gray-300 text-sm">
                            以市场最优价格成交
                        </div>
                    </div>
                )}

                {/* 数量输入 */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span>数量 (USDT)</span>
                    </div>
                    <div className="space-y-2">
                        {/* 仓位大小输入 */}
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

                {isMarketOrder && <Divider />}

                {/* 止盈止损选项 */}
                <Card className="mb-4 pb-3 rounded-md bg-transparent" shadow="none">
                    <CardHeader className="px-0">
                        <Checkbox
                            size="sm"
                            radius="sm"
                            isSelected={isshow}
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
                        onPress={onBuyOrder}
                        color="success" 
                        className="py-3 rounded-full font-medium"
                    >
                        开多
                    </Button>
                    <Button
                        onPress={onSellOrder}
                        color="danger" 
                        className="py-3 rounded-full font-medium"
                    >
                        开空
                    </Button>
                </div>
            </CardBody>
        </Card>
    )
}

export default OrderForm