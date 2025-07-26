/**
 * 创建交易订单组件
 * 支持限价委托和市价委托，包含杠杆选择、止盈止损等功能
 * 重构后的版本，增强了类型安全和代码可读性
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

// UI组件
import {
    ToastProvider,
    addToast,
    Divider,
    Tabs,
    Tab,
    Card,
    CardBody,
    CardHeader,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
    Slider,
    Input,
    Checkbox,
} from "@heroui/react";

// 状态管理
import { useSymbolStore } from "@/store/symbolStore";
import { usePriceStore, usePriceUpStore, usePriceChangeStore } from "@/store/priceStore";
import { useOrderStore } from "@/store/orderStore";
import { useAssetsStore } from '@/store/assetsStore';

// 类型定义
import { Order } from '@/types';

// ==================== 类型定义 ====================

type OrderSide = '买' | '卖';
type PositionType = '逐仓' | '全仓';

interface OrderFormData {
    percentage: string;
    stopLoss: string;
    takeProfit: string;
    showStopLoss: boolean;
}

interface LeverageOption {
    key: string;
    label: string;
    value: number;
}

// ==================== 常量定义 ====================

const LEVERAGE_OPTIONS_LIST: LeverageOption[] = [
    { key: '1.00x', label: '1.00x', value: 1 },
    { key: '5.00x', label: '5.00x', value: 5 },
    { key: '10.00x', label: '10.00x', value: 10 },
    { key: '20.00x', label: '20.00x', value: 20 },
    { key: '50.00x', label: '50.00x', value: 50 },
    { key: '100.00x', label: '100.00x', value: 100 },
];

const POSITION_TYPE_OPTIONS: { key: PositionType; label: string }[] = [
    { key: '逐仓', label: '逐仓' },
    { key: '全仓', label: '全仓' },
];

// ==================== 子组件 ====================

/**
 * 价格显示头部组件
 */
interface PriceHeaderProps {
    symbol: string;
    price: number;
    priceUp: boolean;
    priceChange: number;
}

const PriceHeader: React.FC<PriceHeaderProps> = React.memo(({
    symbol,
    price,
    priceUp,
    priceChange,
}) => (
    <Card className="h-24 p-4 rounded-none rounded-tl-[6px]">
        <div className="flex justify-between items-center">
            <div className="font-bold text-xl text-gray-800 dark:text-gray-200">
                {symbol}
            </div>
            <div className={`text-lg font-medium ${priceUp ? "text-green-500" : "text-red-500"}`}>
                ${price.toFixed(2)}
            </div>
        </div>
        <div className="flex justify-between items-center mt-1">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
                永续合约
            </div>
            <div className={`text-sm ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% 24h
            </div>
        </div>
    </Card>
));

PriceHeader.displayName = 'PriceHeader';

/**
 * 杠杆和仓位类型选择器
 */
interface LeveragePositionSelectorProps {
    leverageValue: string;
    positionType: PositionType;
    onLeverageChange: (value: string) => void;
    onPositionTypeChange: (value: PositionType) => void;
}

const LeveragePositionSelector: React.FC<LeveragePositionSelectorProps> = React.memo(({
    leverageValue,
    positionType,
    onLeverageChange,
    onPositionTypeChange,
}) => (
    <div className="h-fit flex justify-between items-center">
        {/* 仓位类型选择器 */}
        <Dropdown className="min-w-32 w-32 rounded-md">
            <DropdownTrigger>
                <Button className="w-1/2 h-9 px-3 text-sm flex border-r border-white dark:border-gray-400 items-center justify-between rounded-none">
                    {positionType}
                    <span className="ml-2 text-xs opacity-70">▼</span>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="仓位类型选项"
                onAction={(key) => onPositionTypeChange(key as PositionType)}
            >
                {POSITION_TYPE_OPTIONS.map((option) => (
                    <DropdownItem key={option.key} className="text-center">
                        {option.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>

        {/* 杠杆选择器 */}
        <Dropdown className="min-w-32 w-32 rounded-md">
            <DropdownTrigger>
                <Button className="border-l border-white dark:border-gray-400 w-1/2 h-9 px-3 text-sm flex items-center justify-between rounded-none">
                    <span className="font-medium">{leverageValue}</span>
                    <span className="ml-2 text-xs opacity-70">▼</span>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="杠杆选项"
                onAction={(key) => onLeverageChange(key.toString())}
            >
                {LEVERAGE_OPTIONS_LIST.map((option) => (
                    <DropdownItem key={option.key} className="text-center">
                        {option.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    </div>
));

LeveragePositionSelector.displayName = 'LeveragePositionSelector';

/**
 * 资产信息显示组件
 */
interface AssetInfoProps {
    assets: number;
    leverage: number;
}

const AssetInfo: React.FC<AssetInfoProps> = React.memo(({ assets, leverage }) => {
    const maxLongAmount = useMemo(() => assets * leverage, [assets, leverage]);
    const maxShortAmount = useMemo(() => assets * leverage, [assets, leverage]);

    return (
        <div className="space-y-2">
            {/* 可用金额信息 */}
            <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-500">
                    可用 {assets.toFixed(2)} USDT
                </span>
                <span className="text-blue-500">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                </span>
            </div>

            {/* 杠杆信息 */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>可开多 {maxLongAmount.toFixed(2)} USDT</span>
                <span>可开空 {maxShortAmount.toFixed(2)} USDT</span>
            </div>
        </div>
    );
});

AssetInfo.displayName = 'AssetInfo';

/**
 * 止盈止损组件
 */
interface StopLossTakeProfitProps {
    showStopLoss: boolean;
    stopLoss: string;
    takeProfit: string;
    onShowStopLossChange: (show: boolean) => void;
    onStopLossChange: (value: string) => void;
    onTakeProfitChange: (value: string) => void;
}

const StopLossTakeProfit: React.FC<StopLossTakeProfitProps> = React.memo(({
    showStopLoss,
    stopLoss,
    takeProfit,
    onShowStopLossChange,
    onStopLossChange,
    onTakeProfitChange,
}) => (
    <div className="mb-4">
        <div className="flex items-center mb-2">
            <Checkbox
                isSelected={showStopLoss}
                onValueChange={onShowStopLossChange}
                className="mr-2"
            >
                <span className="text-sm">止盈/止损</span>
            </Checkbox>
        </div>
        
        {showStopLoss && (
            <div className="space-y-3 pl-6">
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        止损价格 (USDT)
                    </label>
                    <Input
                        value={stopLoss}
                        onValueChange={onStopLossChange}
                        placeholder="0.00"
                        size="sm"
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        止盈价格 (USDT)
                    </label>
                    <Input
                        value={takeProfit}
                        onValueChange={onTakeProfitChange}
                        placeholder="0.00"
                        size="sm"
                        className="w-full"
                    />
                </div>
            </div>
        )}
    </div>
));

StopLossTakeProfit.displayName = 'StopLossTakeProfit';



// ==================== 主组件 ====================

/**
 * 创建订单主组件
 */
const CreateOrder: React.FC = () => {
    // ==================== 状态管理 ====================

    // Zustand状态
    const symbol = useSymbolStore(state => state.symbol);
    const price = usePriceStore(state => state.price);
    const priceUp = usePriceUpStore(state => state.priceUp);
    const priceChange = usePriceChangeStore(state => state.priceChange);
    const addOrder = useOrderStore(state => state.addOrder);
    const assets = useAssetsStore(state => state.assets);
    const setAssets = useAssetsStore(state => state.setAssets);

    // 本地状态
    const [leverageValue, setLeverageValue] = useState<string>("10.00x");
    const [positionType, setPositionType] = useState<PositionType>("逐仓");
    const [formData, setFormData] = useState<OrderFormData>({
        percentage: '',
        stopLoss: '',
        takeProfit: '',
        showStopLoss: false,
    });

    // ==================== 计算属性 ====================

    /**
     * 获取当前杠杆倍数
     */
    const currentLeverage = useMemo(() => {
        return Number(leverageValue.split('.')[0]);
    }, [leverageValue]);

    /**
     * 计算最大可开仓金额
     */
    const maxOrderAmount = useMemo(() => {
        return assets * currentLeverage;
    }, [assets, currentLeverage]);

    // ==================== 验证逻辑 ====================

    /**
     * 验证止盈止损价格
     */
    const validateStopLossTakeProfit = useCallback((
        side: OrderSide,
        stopLoss: string,
        takeProfit: string
    ): string | null => {
        if (!formData.showStopLoss) return null;

        const stopLossPrice = Number(stopLoss);
        const takeProfitPrice = Number(takeProfit);

        if (side === '买') {
            // 做多订单验证
            if (stopLoss && stopLossPrice >= price) {
                return "买单止损价格必须低于当前价格";
            }
            if (takeProfit && takeProfitPrice <= price) {
                return "买单止盈价格必须高于当前价格";
            }
        } else {
            // 做空订单验证
            if (stopLoss && stopLossPrice <= price) {
                return "卖单止损价格必须高于当前价格";
            }
            if (takeProfit && takeProfitPrice >= price) {
                return "卖单止盈价格必须低于当前价格";
            }
        }

        return null;
    }, [formData.showStopLoss, price]);

    /**
     * 计算订单金额
     */
    const calculateOrderAmount = useCallback((percentage: string): number => {
        if (percentage.includes('%')) {
            const percent = Number(percentage.split('%')[0]);
            return assets * currentLeverage * percent / 100;
        } else {
            return Number(percentage) || 0;
        }
    }, [assets, currentLeverage]);

    /**
     * 计算强制平仓价格
     */
    const calculateLiquidationPrice = useCallback((
        side: OrderSide,
        entryPrice: number,
        leverage: number,
        positionType: PositionType
    ): number => {
        if (positionType === '全仓') {
            return -1; // 全仓模式暂时无法精确计算
        }

        const liquidationRate = 1 / leverage;
        
        if (side === '买') {
            return entryPrice * (1 - liquidationRate);
        } else {
            return entryPrice * (1 + liquidationRate);
        }
    }, []);

    // ==================== 事件处理 ====================

    /**
     * 处理表单数据更新
     */
    const updateFormData = useCallback((updates: Partial<OrderFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    /**
     * 处理数值输入验证
     */
    const handleNumericInput = useCallback((value: string): boolean => {
        return !isNaN(Number(value)) || value === '';
    }, []);

    /**
     * 创建订单
     */
    const createOrder = useCallback((side: OrderSide) => {
        try {
            // 计算订单金额
            const orderAmount = calculateOrderAmount(formData.percentage);

            // 验证订单金额
            if (orderAmount <= 0) {
                addToast({
                    description: "请输入有效的订单金额",
                    color: 'warning',
                });
                return;
            }

            if (orderAmount > maxOrderAmount) {
                addToast({
                    description: "金额超过最大可开金额",
                    color: 'warning',
                });
                return;
            }

            // 验证止盈止损
            const validationError = validateStopLossTakeProfit(
                side,
                formData.stopLoss,
                formData.takeProfit
            );

            if (validationError) {
                addToast({
                    description: validationError,
                    color: 'warning',
                });
                return;
            }

            // 计算强制平仓价格
            const liquidationPrice = calculateLiquidationPrice(
                side,
                price,
                currentLeverage,
                positionType
            );

            // 计算保证金
            const margin = positionType === '逐仓' 
                ? orderAmount / currentLeverage 
                : orderAmount;

            // 创建订单对象
            const order: Order = {
                id: uuidv4(),
                symbol: symbol,
                price: price,
                amount: orderAmount,
                type: side === '买' ? 'long' : 'short',
                leverage: currentLeverage,
                positionType: positionType,
                stopLoss: formData.stopLoss ? Number(formData.stopLoss) : undefined,
                takeProfit: formData.takeProfit ? Number(formData.takeProfit) : undefined,
                liquidationPrice: liquidationPrice > 0 ? liquidationPrice : undefined,
                createdAt: new Date().toISOString(),
                status: 'active',
            };

            // 添加订单
            addOrder(order);

            // 更新可用资产
            setAssets(assets - margin);

            // 显示成功提示
            addToast({
                title: '订单创建成功',
                description: `${side === '买' ? '做多' : '做空'}订单已创建`,
                color: 'success',
            });

            // 重置表单
            setFormData({
                percentage: '',
                stopLoss: '',
                takeProfit: '',
                showStopLoss: false,
            });

            console.log('订单创建成功:', order);

        } catch (error) {
            console.error('创建订单失败:', error);
            addToast({
                description: "创建订单失败，请重试",
                color: 'danger',
            });
        }
    }, [
        formData,
        calculateOrderAmount,
        maxOrderAmount,
        validateStopLossTakeProfit,
        calculateLiquidationPrice,
        price,
        currentLeverage,
        positionType,
        symbol,
        addOrder,
        assets,
        setAssets
    ]);

    // ==================== 渲染 ====================

    return (
        <div className="flex flex-col w-80 h-full rounded-tl-[6px]">
            <ToastProvider placement='top-center' toastOffset={60} />
            
            {/* 价格显示头部 */}
            <PriceHeader
                symbol={symbol}
                price={price}
                priceUp={priceUp}
                priceChange={priceChange}
            />

            {/* 杠杆和仓位类型选择器 */}
            <LeveragePositionSelector
                leverageValue={leverageValue}
                positionType={positionType}
                onLeverageChange={setLeverageValue}
                onPositionTypeChange={setPositionType}
            />

            {/* 交易选项卡 */}
            <Tabs
                aria-label="交易选项"
                className="bg-white dark:bg-gray-800 h-fit w-full border-1 block grid grid-cols-2 gap-4"
                variant="underlined"
            >
                {/* 限价委托 */}
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
                                        defaultValue={price.toFixed(1)}
                                    />
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">
                                        对手价
                                    </div>
                                </div>
                            </div>

                            {/* 数量输入区域 */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>数量 (USDT)</span>
                                </div>
                                <div className="space-y-2">
                                    {/* 简化的滑块显示 */}
                                    <div className="w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full relative">
                                        <div className="absolute left-0 right-0 flex justify-between">
                                            {[0, 25, 50, 75, 100].map((percent, index) => (
                                                <div
                                                    key={percent}
                                                    className={`h-3 w-3 border-2 border-white dark:border-gray-900 rounded-full -mt-1 cursor-pointer hover:scale-110 transition-transform ${
                                                        index === 0 ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* 滑块标签 */}
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                                        <span>0</span>
                                        <span>100%</span>
                                    </div>

                                    <AssetInfo assets={assets} leverage={currentLeverage} />
                                </div>
                            </div>

                            {/* 止盈止损选项（限价委托暂时禁用） */}
                            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md opacity-50">
                                <div className="flex items-center mb-2">
                                    <input type="checkbox" className="mr-2 w-4 h-4 accent-blue-500" id="stopLossLimit" disabled />
                                    <label htmlFor="stopLossLimit" className="text-sm text-gray-500">止盈/止损（限价委托暂不支持）</label>
                                </div>
                            </div>

                            {/* 买入卖出按钮 */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className="py-3 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transition-colors shadow-lg shadow-green-900/30 dark:shadow-green-900/30"
                                    disabled
                                >
                                    开多（暂不支持）
                                </button>
                                <button
                                    className="py-3 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30 dark:shadow-red-900/30"
                                    disabled
                                >
                                    开空（暂不支持）
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                {/* 市价委托 */}
                <Tab key="market" title={<div className="py-2">市价委托</div>} className="h-full p-0">
                    <Card className="h-full rounded-none">
                        <CardBody className="p-4">
                            {/* 市价说明 */}
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
                                    {/* 仓位大小输入 */}
                                    <Input
                                        value={formData.percentage}
                                        aria-label="仓位大小"
                                        className="w-full"
                                        radius="sm"
                                        placeholder="请输入金额或百分比"
                                        onValueChange={(value: string) => {
                                            if (handleNumericInput(value) || value.includes('%')) {
                                                updateFormData({ percentage: value });
                                            }
                                        }}
                                    />

                                    {/* 百分比滑块 */}
                                    <Slider
                                        aria-label="仓位百分比"
                                        className="max-w-md"
                                        defaultValue={0}
                                        onChange={(value) => {
                                            if (Array.isArray(value)) {
                                                updateFormData({ percentage: '数据错误，请手动输入' });
                                            } else {
                                                updateFormData({ percentage: String(value) + '%' });
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

                                    <AssetInfo assets={assets} leverage={currentLeverage} />
                                </div>
                            </div>

                            <Divider />

                            {/* 止盈止损设置 */}
                            <StopLossTakeProfit
                                showStopLoss={formData.showStopLoss}
                                stopLoss={formData.stopLoss}
                                takeProfit={formData.takeProfit}
                                onShowStopLossChange={(show: boolean) => updateFormData({ showStopLoss: show })}
                                onStopLossChange={(value: string) => {
                                    if (handleNumericInput(value)) {
                                        updateFormData({ stopLoss: value });
                                    }
                                }}
                                onTakeProfitChange={(value: string) => {
                                    if (handleNumericInput(value)) {
                                        updateFormData({ takeProfit: value });
                                    }
                                }}
                            />

                            {/* 买入卖出按钮 */}
                            <div className="grid grid-cols-2 gap-8">
                                <Button
                                    onPress={() => createOrder('买')}
                                    color="success"
                                    className="py-3 rounded-full font-medium"
                                    isDisabled={!formData.percentage || calculateOrderAmount(formData.percentage) <= 0}
                                >
                                    开多
                                </Button>
                                <Button
                                    onPress={() => createOrder('卖')}
                                    color="danger"
                                    className="py-3 rounded-full font-medium"
                                    isDisabled={!formData.percentage || calculateOrderAmount(formData.percentage) <= 0}
                                >
                                    开空
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
};

export default CreateOrder;