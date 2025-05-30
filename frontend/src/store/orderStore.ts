import { create } from 'zustand';

// 定义订单类型
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

type OrderStore = {
    orders: Order[];
    addOrder: (order: Order) => void;
    removeOrder: (id: string) => void;
    updateOrder: (id: string, updatedData: Partial<Order>) => void;
    clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
    orders: [],
    addOrder: (order) => set((state) => ({
        orders: [...state.orders, order]
    })),
    removeOrder: (id) => set((state) => ({
        orders: state.orders.filter(order => order.id !== id)
    })),
    updateOrder: (id, updatedData) => set((state) => ({
        orders: state.orders.map(order =>
            order.id === id ? { ...order, ...updatedData } : order
        )
    })),
    clearOrders: () => set({ orders: [] }),
}))