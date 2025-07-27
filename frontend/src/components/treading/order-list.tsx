import {
    Card,
    Button,
    addToast,
} from "@heroui/react";

import { PlusCircleIcon } from '@heroicons/react/24/outline';

import { useOrderStore } from "@/store/orderStore";
import { usePriceStore } from "@/store/priceStore";
import { useAssetsStore } from "@/store/assetsStore";

import React from "react";

type Order = {
    id?: string;  // 订单ID
    symbol?: string;   // 交易对
    price?: number;   // 价格
    lever?: string;   // 杠杆
    amount?: number;  // 数量
    side?: '买' | '卖';   // 订单类型
    type?: '逐仓' | '全仓';   // 仓位类型
    stoploss?: number;   // 止损
    takeprofit?: number;   // 止盈
    forcedliquidation?: number;   // 强平
    createdAt?: string;
    // 可以根据需要添加更多字段
}

const OrderList = () => {
    const orders = useOrderStore(state => state.orders)
    const removeOrder = useOrderStore(state => state.removeOrder)
    const price = usePriceStore(state => state.price)
    const assets = useAssetsStore(state => state.assets)
    const setAssets = useAssetsStore(state => state.setAssets)

    const PriceDisplay = React.memo(({ price }: { price: number }) => (
        <div>
            <span className="text-[13px]">{price}</span>
        </div>
    ));

    const Toast = (content:string) => {
        addToast({
            description: content,
            color: 'warning',
        })
    }

    const FloatingIncome = React.memo(({ price, order }: { price: number, order: Order }) => {
        const getColor = () => {
            if (order.side === '买') {
                return price >= (order.price ?? 0) ? 'text-green-500' : 'text-red-500';
            } else {
                return price <= (order.price ?? 0) ? 'text-green-500' : 'text-red-500';
            }
        }

        const getIncomePercent = () => {
            if (order.side === '买') {
                return (price - (order.price ?? 0)) / (order.price ?? 0);
            } else {
                if (price >= (order.price ?? 0)) {
                    return -(price - (order.price ?? 0)) / (order.price ?? 0);
                } else {
                    return -(price - (order.price ?? 0)) / (order.price ?? 0);
                }
            }
        }

        // 判断是否到达强平价或止盈止损
        const isReachStopLoss = () => {
            if (order.side === '买') {
                if (order.takeprofit !== -1) {
                    if (price >= (order.takeprofit?? 0)) {
                        Toast(order.symbol?.replace('/', '')+'止盈触发')
                        return 'takeprofit';
                    }
                }
                if (order.stoploss!== -1) {
                    if (price <= (order.stoploss?? 0)) {
                        Toast(order.symbol?.replace('/', '')+'止损触发')                           
                        return 'stoploss';
                    }
                }
                if (order.forcedliquidation!== -1) {
                    if (price <= (order.forcedliquidation?? 0)) {
                        Toast(order.symbol?.replace('/', '')+'强平触发')
                        return 'forcedliquidation';
                    }
                }
            } else {
                if (order.takeprofit!== -1) {
                    if (price <= (order.takeprofit?? 0)) {
                        Toast(order.symbol?.replace('/', '')+'止盈触发')
                        return 'takeprofit';
                    }
                }
                if (order.stoploss!== -1) {
                    if (price >= (order.stoploss?? 0)) {
                        Toast(order.symbol?.replace('/', '')+'止损触发') 
                        return 'stoploss';
                    }
                }
                if (order.forcedliquidation!== -1) {
                    if (price >= (order.forcedliquidation?? 0)) {
                        Toast(order.symbol?.replace('/', '')+'强平触发')
                        return 'forcedliquidation';
                    }
                }
            }
        }

        // 使用useEffect处理副作用
        React.useEffect(() => {
            const isReach = isReachStopLoss();
            if (isReach) {
                if (isReach === 'forcedliquidation') {
                    removeOrder(order.id?? '')

                    return;
                } else {
                    setAssets(assets + ((order.amount?? 1) / Number(order.lever?.split('.')[0])) +(getIncomePercent() * (order.amount?? 1)))
                    removeOrder(order.id?? '')

                    return;
                }
            }
        }, [price, order]); // 依赖项包括所有在effect中使用的外部变量, assets

        return (
            <div className="flex flex-col">
                <span className={`text-[13px] ${getColor()}`}>
                    {(getIncomePercent() * (order.amount ?? 1)).toFixed(2)} USDT
                </span>
                <span className={`text-[13px] ${getColor()}`}>
                    ({(getIncomePercent() * 100 * Number(order.lever?.split('.')[0])).toFixed(2)}%)
                </span>
            </div>
        )
    });

    const TakeProfitandStopLoss = React.memo(({ takeprofit, stoploss }: { takeprofit: number, stoploss: number }) => {
        if (takeprofit === -1 && stoploss === -1) {
            return (
                <div className="flex flex-row">
                    <span className="text-[13px] mr-2">添加</span>
                    <PlusCircleIcon className="size-5" />
                </div>
            )
        } else if (takeprofit !== -1 && stoploss === -1) {
            return (
                <div className="flex flex-col">
                    <span className="text-[13px] text-green-500">{takeprofit}</span>
                    <span className="text-[13px] text-red-500">--</span>
                </div>
            )
        } else if (takeprofit === -1 && stoploss !== -1) {
            return (
                <div className="flex flex-col">
                    <span className="text-[13px] text-green-500">--</span>
                    <span className="text-[13px] text-red-500">{stoploss}</span>
                </div>
            )
        } else {
            <div className="flex flex-col">
                <span className="text-[13px] text-green-500">{takeprofit}</span>
                <span className="text-[13px] text-red-500">{stoploss}</span>
            </div>
        }
    });

    return (
        <>
            <Card className='px-4 pt-2 h-8 text-sm text-gray-400 border-b-1 mt-2 rounded-t-[6px] rounded-b-none grid grid-cols-9 gap-5'>
                <span>交易品种</span>
                <span>持仓量</span>
                <span>标记价格</span>
                <span>开仓均价</span>
                <span>浮动收益</span>
                <span>保证金</span>
                <span>市价全平</span>
                <span>预估强平价</span>
                <span>止损止盈</span>
            </Card>
            <Card id="order-list" className='flex-1 w-full overflow-y-auto rounded-none'>
                {orders.map(order => (
                    <div key={order.id} className="px-4 h-14 flex-none border-b-1 grid grid-cols-9 gap-5 items-center">
                        <div className="flex flex-col">
                            <span className="text-sm mb-1">{order.symbol?.replace('/', '')} 永续</span>
                            <Button isDisabled className="h-4 w-8 rounded-sm" size="sm">{order.lever}</Button>
                        </div>
                        <div>
                            <span className="text-[13px] text-red-400">{order.amount?.toFixed(2)} USDT</span>
                        </div>
                        <PriceDisplay price={price} />
                        <div>
                            <span className="text-[13px]">{order.price?.toFixed(2)}</span>
                        </div>
                        <FloatingIncome price={price} order={order} />
                        <div className="flex flex-col">
                            <span className="text-[13px]">{((order.amount ?? 1) / Number(order.lever?.split('.')[0])).toFixed(2)} USDT</span>
                            <span className="text-[13px]">{order.type}</span>
                        </div>
                        <div>
                            <Button
                                onPress={() => {
                                    const getIncomePercent = () => {
                                        if (order.side === '买') {
                                            return (price - (order.price ?? 0)) / (order.price ?? 0);
                                        } else {
                                            if (price >= (order.price ?? 0)) {
                                                return -(price - (order.price ?? 0)) / (order.price ?? 0);
                                            } else {
                                                return -(price - (order.price ?? 0)) / (order.price ?? 0);
                                            }
                                        }
                                    }
                                    console.log('sa')
                                    setAssets(assets + (order.amount ?? 1) / Number(order.lever?.split('.')[0]) + (getIncomePercent() * (order.amount ?? 1)))
                                    removeOrder(order.id?? '')
                                }}
                                className="h-8 rounded-full">
                                市价全平
                            </Button>
                        </div>
                        <div>
                            <span className="text-[13px]">{order.forcedliquidation === -1 ? '-' : (order.forcedliquidation)?.toFixed(2)}</span>
                        </div>

                        <TakeProfitandStopLoss takeprofit={order.takeprofit ?? -1} stoploss={order.stoploss ?? -1} />
                    </div>
                ))}
            </Card>
        </>
    );
}

export default OrderList;
