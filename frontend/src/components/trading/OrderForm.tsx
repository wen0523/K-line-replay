'use client'

import { Card, CardBody, Input, Slider, Checkbox, CardHeader, Divider, Button } from "@heroui/react"
import { useAssetsStore } from '@/store/assetsStore'

interface OrderFormProps {
    price: number
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
    price,
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
        <Card className="h-full rounded-none shadow-none bg-surface">
            <CardBody className="p-4">
                {/* 价格输入 - 仅限价委托显示 */}
                {!isMarketOrder && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-secondary mb-2">
                            <span>价格 (USDT)</span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-surface-secondary border border-theme rounded-lg px-3 py-2 text-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                                placeholder="0.00"
                                defaultValue={price}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-surface-tertiary text-secondary px-3 py-1 rounded-md text-xs font-medium">
                                对手价
                            </div>
                        </div>
                    </div>
                )}

                {/* 市价委托说明 */}
                {isMarketOrder && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-secondary mb-2">
                            <span>市价 (USDT)</span>
                        </div>
                        <div className="relative">
                            <input
                                disabled
                                type="text"
                                className="w-full bg-surface-secondary border border-theme rounded-lg px-3 py-2 text-primary transition-all duration-200"
                                placeholder="以市场最优价格成交"
                            />
                        </div>
                    </div>
                )}

                {/* 数量输入 */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-secondary mb-2">
                        <span>数量 (USDT)</span>
                    </div>
                    <div className="space-y-3">
                        {/* 仓位大小输入 */}
                        <Input
                            value={percentage}
                            aria-label="仓位大小"
                            className="w-full"
                            classNames={{
                                input: "text-primary",
                                inputWrapper: "rounded-lg bg-surface-secondary border-theme hover:border-primary-500 focus-within:border-primary-500"
                            }}
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
                            color="primary"
                            classNames={{
                                track: "bg-surface-tertiary",
                                filler: "bg-primary-500"
                            }}
                        />

                        {/* 滑块标签 */}
                        <div className="flex justify-between text-xs text-muted">
                            <span>0</span>
                            <span>100%</span>
                        </div>

                        {/* 可用金额信息 */}
                        <div className="flex justify-between text-xs">
                            <span className="text-muted">可用 {(assets).toFixed(2)} USDT</span>
                            <span className="text-primary-500">
                                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-1"></span>
                            </span>
                        </div>

                        {/* 杠杆信息 */}
                        <div className="flex justify-between text-xs text-muted">
                            <span>可开多 {(assets * Number(leverageValue.split('.')[0])).toFixed(2)} USDT</span>
                            <span>可开空 {(assets * Number(leverageValue.split('.')[0])).toFixed(2)} USDT</span>
                        </div>
                    </div>
                </div>

                {/* 止盈止损选项 */}
                <Card className="bg-surface" shadow="none">
                    <CardHeader className="px-0">
                        <Checkbox
                            size="sm"
                            radius="sm"
                            isSelected={isshow}
                            onValueChange={(value) => setIsshow(value)}
                            classNames={{
                                base: "text-primary",
                                wrapper: "border-theme"
                            }}
                        >止盈/止损</Checkbox>
                    </CardHeader>

                    {isshow && <CardBody className="p-0 mb-3">
                        {/* 止盈价格 */}
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-secondary mb-2">
                                <span>止盈价格 (USDT)</span>
                            </div>
                            <Input
                                value={takeprofit}
                                aria-label="止盈价格"
                                className="w-full"
                                classNames={{
                                    input: "text-primary",
                                    inputWrapper: "rounded-lg bg-surface-secondary border-theme hover:border-primary-500 focus-within:border-primary-500"
                                }}
                                onValueChange={(value: string) => {
                                    if (Number(value) || value === '') {
                                        setTakeprofit(value);
                                    }
                                }}
                            />
                        </div>

                        {/* 止损价格 */}
                        <div>
                            <div className="flex justify-between text-xs text-secondary mb-2">
                                <span>止损价格 (USDT)</span>
                            </div>
                            <div className="flex">
                                <Input
                                    value={stoploss}
                                    aria-label="止损价格"
                                    className="w-full"
                                    radius="lg"
                                    classNames={{
                                        input: "text-primary",
                                        inputWrapper: "rounded-lg bg-surface-secondary border-theme hover:border-primary-500 focus-within:border-primary-500"
                                    }}
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
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onPress={onBuyOrder}
                        color="success"
                        className="py-3 rounded-xl font-semibold btn-hover shadow-lg"
                        size="lg"
                    >
                        开多
                    </Button>
                    <Button
                        onPress={onSellOrder}
                        color="danger"
                        className="py-3 rounded-xl font-semibold btn-hover shadow-lg"
                        size="lg"
                    >
                        开空
                    </Button>
                </div>
            </CardBody>
        </Card>
    )
}

export default OrderForm