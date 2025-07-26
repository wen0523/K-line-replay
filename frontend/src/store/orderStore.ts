/**
 * 订单状态管理
 * 管理交易订单的创建、更新、删除等操作
 */

import { create } from 'zustand';

// ==================== 类型定义 ====================

/**
 * 订单类型定义
 */
export interface Order {
    /** 订单ID */
    id: string;
    /** 交易对符号 */
    symbol: string;
    /** 持仓类型（做多/做空） */
    type: 'long' | 'short';
    /** 订单金额 */
    amount: number;
    /** 开仓价格 */
    price: number;
    /** 杠杆倍数 */
    leverage: number;
    /** 仓位模式 */
    positionType: '逐仓' | '全仓';
    /** 止损价格（可选） */
    stopLoss?: number;
    /** 止盈价格（可选） */
    takeProfit?: number;
    /** 强制平仓价格（可选） */
    liquidationPrice?: number;
    /** 订单状态 */
    status: 'pending' | 'active' | 'filled' | 'cancelled' | 'liquidated';
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt?: string;
    /** 平仓时间（可选） */
    closedAt?: string;
    /** 实现盈亏（可选） */
    pnl?: number;
}

/**
 * 订单状态管理接口
 */
interface OrderState {
    /** 订单列表 */
    orders: Order[];
    
    // 订单操作
    /** 添加订单 */
    addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
    /** 删除订单 */
    removeOrder: (id: string) => void;
    /** 更新订单 */
    updateOrder: (id: string, updatedData: Partial<Order>) => void;
    /** 清空所有订单 */
    clearOrders: () => void;
    /** 根据符号获取订单 */
    getOrdersBySymbol: (symbol: string) => Order[];
    /** 根据状态获取订单 */
    getOrdersByStatus: (status: Order['status']) => Order[];
    /** 计算总持仓价值 */
    getTotalValue: () => number;
}

// ==================== 工具函数 ====================

/**
 * 生成唯一订单ID
 */
const generateOrderId = (): string => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 格式化创建时间
 */
const formatCreatedAt = (): string => {
    return new Date().toISOString();
};

// ==================== 订单状态Store ====================

/**
 * 订单状态管理Store
 */
export const useOrderStore = create<OrderState>((set, get) => ({
    // 初始状态
    orders: [],

    // 添加订单
    addOrder: (orderData) => {
        const newOrder: Order = {
            ...orderData,
            id: generateOrderId(),
            createdAt: formatCreatedAt(),
            status: 'active',
        };

        set((state) => ({
            orders: [...state.orders, newOrder]
        }));

        console.log('订单已添加:', newOrder);
    },

    // 删除订单
    removeOrder: (id) => {
        set((state) => ({
            orders: state.orders.filter(order => order.id !== id)
        }));

        console.log('订单已删除:', id);
    },

    // 更新订单
    updateOrder: (id, updatedData) => {
        set((state) => ({
            orders: state.orders.map(order =>
                order.id === id ? { ...order, ...updatedData } : order
            )
        }));

        console.log('订单已更新:', id, updatedData);
    },

    // 清空所有订单
    clearOrders: () => {
        set({ orders: [] });
        console.log('所有订单已清空');
    },

    // 根据符号获取订单
    getOrdersBySymbol: (symbol) => {
        return get().orders.filter(order => order.symbol === symbol);
    },

    // 根据状态获取订单
    getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
    },

    // 计算总持仓价值
    getTotalValue: () => {
        const orders = get().orders;
        return orders.reduce((total, order) => {
            if (order.status === 'filled' || order.status === 'active') {
                return total + order.amount;
            }
            return total;
        }, 0);
    },
}));