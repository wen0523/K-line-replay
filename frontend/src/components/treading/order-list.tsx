/**
 * 交易订单列表组件
 * 显示当前所有交易订单，支持止损、止盈等功能
 * 重构后的版本，增强了类型安全和代码可读性
 */

import React, { useCallback, useMemo } from 'react';
import {
    Card,
    Button,
    addToast,
} from "@heroui/react";
import { PlusCircleIcon } from '@heroicons/react/24/outline';

// 状态管理
import { useOrderStore } from "@/store/orderStore";
import { usePriceStore } from "@/store/priceStore";
import { useAssetsStore } from "@/store/assetsStore";

// 类型定义
import { Order } from '@/types';

// ==================== 子组件 ====================

/**
 * 价格显示组件
 */
interface PriceDisplayProps {
    price: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = React.memo(({ price }) => (
    <div>
        <span className="text-[13px]">{price.toFixed(2)}</span>
    </div>
));

PriceDisplay.displayName = 'PriceDisplay';

/**
 * 浮动收益显示组件
 */
interface FloatingIncomeProps {
    price: number;
    order: Order;
}

const FloatingIncome: React.FC<FloatingIncomeProps> = React.memo(({ price, order }) => {
    const removeOrder = useOrderStore(state => state.removeOrder);
    const assets = useAssetsStore(state => state.assets);
    const setAssets = useAssetsStore(state => state.setAssets);

    /**
     * 获取收益颜色
     */
    const getColor = useCallback(() => {
        if (order.type === 'long') {
            return price >= order.price ? 'text-green-500' : 'text-red-500';
        } else {
            return price <= order.price ? 'text-green-500' : 'text-red-500';
        }
    }, [order.type, order.price, price]);

    /**
     * 计算收益百分比
     */
    const getIncomePercent = useCallback(() => {
        if (order.type === 'long') {
            return (price - order.price) / order.price;
        } else {
            return -(price - order.price) / order.price;
        }
    }, [order.type, order.price, price]);

    /**
     * 显示提示消息
     */
    const showToast = useCallback((content: string) => {
        addToast({
            description: content,
            color: 'warning',
        });
    }, []);

    /**
     * 检查是否触发止盈止损或强平
     */
    const checkTriggerConditions = useCallback(() => {
        if (order.type === 'long') {
            // 做多订单检查
            if (order.takeProfit && price >= order.takeProfit) {
                showToast(`${order.symbol}止盈触发`);
                return 'takeProfit';
            }
            if (order.stopLoss && price <= order.stopLoss) {
                showToast(`${order.symbol}止损触发`);
                return 'stopLoss';
            }
            if (order.liquidationPrice && price <= order.liquidationPrice) {
                showToast(`${order.symbol}强平触发`);
                return 'liquidation';
            }
        } else {
            // 做空订单检查
            if (order.takeProfit && price <= order.takeProfit) {
                showToast(`${order.symbol}止盈触发`);
                return 'takeProfit';
            }
            if (order.stopLoss && price >= order.stopLoss) {
                showToast(`${order.symbol}止损触发`);
                return 'stopLoss';
            }
            if (order.liquidationPrice && price >= order.liquidationPrice) {
                showToast(`${order.symbol}强平触发`);
                return 'liquidation';
            }
        }
        return null;
    }, [order, price, showToast]);

    /**
     * 处理订单触发
     */
    React.useEffect(() => {
        const triggerType = checkTriggerConditions();
        if (triggerType) {
            const margin = order.amount / order.leverage;
            const income = getIncomePercent() * order.amount;

            if (triggerType === 'liquidation') {
                // 强平只返还剩余保证金（通常为0）
                removeOrder(order.id);
            } else {
                // 止盈止损返还保证金和收益
                setAssets(assets + margin + income);
                removeOrder(order.id);
            }
        }
    }, [price, order, checkTriggerConditions, getIncomePercent, removeOrder, setAssets, assets]);

    const incomePercent = getIncomePercent();
    const incomeAmount = incomePercent * order.amount;
    const leveragedPercent = incomePercent * order.leverage;

    return (
        <div className="flex flex-col">
            <span className={`text-[13px] ${getColor()}`}>
                {incomeAmount.toFixed(2)} USDT
            </span>
            <span className={`text-[13px] ${getColor()}`}>
                ({(leveragedPercent * 100).toFixed(2)}%)
            </span>
        </div>
    );
});

FloatingIncome.displayName = 'FloatingIncome';

/**
 * 止盈止损显示组件
 */
interface TakeProfitStopLossProps {
    takeProfit?: number;
    stopLoss?: number;
}

const TakeProfitStopLoss: React.FC<TakeProfitStopLossProps> = React.memo(({ 
    takeProfit, 
    stopLoss 
}) => {
    if (!takeProfit && !stopLoss) {
        return (
            <div className="flex flex-row items-center">
                <span className="text-[13px] mr-2">添加</span>
                <PlusCircleIcon className="size-5" />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <span className="text-[13px] text-green-500">
                {takeProfit ? takeProfit.toFixed(2) : '--'}
            </span>
            <span className="text-[13px] text-red-500">
                {stopLoss ? stopLoss.toFixed(2) : '--'}
            </span>
        </div>
    );
});

TakeProfitStopLoss.displayName = 'TakeProfitStopLoss';

// ==================== 主组件 ====================

/**
 * 订单列表主组件
 */
const OrderList: React.FC = () => {
    // ==================== 状态管理 ====================
    
    const orders = useOrderStore(state => state.orders);
    const removeOrder = useOrderStore(state => state.removeOrder);
    const price = usePriceStore(state => state.price);
    const assets = useAssetsStore(state => state.assets);
    const setAssets = useAssetsStore(state => state.setAssets);

    // ==================== 事件处理 ====================

    /**
     * 市价全平订单
     */
    const handleMarketClose = useCallback((order: Order) => {
        const incomePercent = order.type === 'long' 
            ? (price - order.price) / order.price
            : -(price - order.price) / order.price;
        
        const margin = order.amount / order.leverage;
        const income = incomePercent * order.amount;
        
        // 返还保证金和收益
        setAssets(assets + margin + income);
        removeOrder(order.id);

        addToast({
            description: `${order.symbol} 订单已市价全平`,
            color: 'success',
        });
    }, [price, assets, setAssets, removeOrder]);

    // ==================== 渲染 ====================

    return (
        <>
            {/* 表头 */}
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

            {/* 订单列表 */}
            <Card id="order-list" className='flex-1 w-full overflow-y-auto rounded-none'>
                {orders.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        暂无订单
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="px-4 h-14 flex-none border-b-1 grid grid-cols-9 gap-5 items-center">
                            {/* 交易品种 */}
                            <div className="flex flex-col">
                                <span className="text-sm mb-1">{order.symbol} 永续</span>
                                <Button 
                                    isDisabled 
                                    className="h-4 w-8 rounded-sm" 
                                    size="sm"
                                >
                                    {order.leverage}x
                                </Button>
                            </div>

                            {/* 持仓量 */}
                            <div>
                                <span className={`text-[13px] ${order.type === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                                    {order.amount.toFixed(2)} USDT
                                </span>
                            </div>

                            {/* 标记价格 */}
                            <PriceDisplay price={price} />

                            {/* 开仓均价 */}
                            <div>
                                <span className="text-[13px]">{order.price.toFixed(2)}</span>
                            </div>

                            {/* 浮动收益 */}
                            <FloatingIncome price={price} order={order} />

                            {/* 保证金 */}
                            <div className="flex flex-col">
                                <span className="text-[13px]">
                                    {(order.amount / order.leverage).toFixed(2)} USDT
                                </span>
                                <span className="text-[13px]">{order.positionType}</span>
                            </div>

                            {/* 市价全平 */}
                            <div>
                                <Button
                                    onPress={() => handleMarketClose(order)}
                                    className="h-8 rounded-full"
                                    size="sm"
                                >
                                    市价全平
                                </Button>
                            </div>

                            {/* 预估强平价 */}
                            <div>
                                <span className="text-[13px]">
                                    {order.liquidationPrice ? order.liquidationPrice.toFixed(2) : '--'}
                                </span>
                            </div>

                            {/* 止损止盈 */}
                            <TakeProfitStopLoss 
                                takeProfit={order.takeProfit} 
                                stopLoss={order.stopLoss} 
                            />
                        </div>
                    ))
                )}
            </Card>
        </>
    );
};

export default OrderList;
