/**
 * K线图表页面
 * 主要的交易图表界面，包含K线图、交易控制、订单管理等功能
 * 重构后的版本，增强了代码可读性和组件组织
 */

'use client';

import React, { useMemo } from 'react';

// UI组件
import { Divider } from "@heroui/react";

// 功能组件
import PartialFullscreenComponent from '@/components/screen/full_screen';
import CryptoSearchModal from '@/components/search/search_currency';
import TimeSelect from '@/components/heroui/select_time';
import KLineChart from "@/components/k_line/kLine";
import CreateOrder from '@/components/treading/create-order';
import OrderList from '@/components/treading/order-list';
import ThemeSwitch from '@/components/heroui/theme-switch';

// 状态管理
import { useReplayStore } from '@/store/priceStore';

// ==================== 子组件 ====================

/**
 * 页面头部组件
 */
const ChartHeader: React.FC = React.memo(() => {
    return (
        <header className="bg-white w-full h-10 pl-6 flex flex-row items-center justify-between shadow-sm">
            {/* 左侧控制区域 */}
            <div className="flex flex-row items-center">
                {/* 加密货币搜索 */}
                <CryptoSearchModal />
                
                <Divider 
                    orientation="vertical" 
                    className="mr-2 ml-2 h-8" 
                />
                
                {/* 时间周期选择 */}
                <TimeSelect />
                
                <Divider 
                    orientation="vertical" 
                    className="mr-2 ml-2 h-8" 
                />
            </div>

            {/* 右侧工具区域 */}
            <div className="mr-4 flex flex-row items-center gap-2">
                {/* 全屏控制 */}
                <PartialFullscreenComponent />
                
                {/* 主题切换 */}
                <ThemeSwitch />
            </div>
        </header>
    );
});

ChartHeader.displayName = 'ChartHeader';

/**
 * 左侧工具栏组件
 */
const LeftSidebar: React.FC = React.memo(() => {
    return (
        <aside className="w-12 rounded-tr-[6px] bg-white flex flex-col shadow-sm">
            {/* 预留工具栏空间 */}
            <div className="flex-1 flex flex-col items-center pt-4">
                {/* 可以在这里添加绘图工具、指标工具等 */}
            </div>
        </aside>
    );
});

LeftSidebar.displayName = 'LeftSidebar';

/**
 * 主图表区域组件
 */
const ChartMainArea: React.FC = React.memo(() => {
    return (
        <main className="flex-1 mx-2 rounded-t-[6px] bg-gray-300 flex flex-col">
            {/* K线图表容器 */}
            <div 
                className="rounded-b-[6px] h-[600px] bg-white shadow-sm" 
                id="container"
            >
                <KLineChart />
            </div>
            
            {/* 订单列表 */}
            <div className="mt-2">
                <OrderList />
            </div>
        </main>
    );
});

ChartMainArea.displayName = 'ChartMainArea';

/**
 * 右侧交易面板组件
 */
interface RightTradingPanelProps {
    isVisible: boolean;
}

const RightTradingPanel: React.FC<RightTradingPanelProps> = React.memo(({ isVisible }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <aside className="h-full w-80 rounded-tl-[6px] bg-white flex flex-col shadow-sm">
            {/* 交易订单创建 */}
            <CreateOrder />
        </aside>
    );
});

RightTradingPanel.displayName = 'RightTradingPanel';

// ==================== 主页面组件 ====================

/**
 * K线图表页面主组件
 */
const ChartPage: React.FC = () => {
    // ==================== 状态管理 ====================

    const replay = useReplayStore(state => state.replay);

    // ==================== 计算属性 ====================

    /**
     * 页面布局样式类
     */
    const pageClasses = useMemo(() => {
        return [
            'h-screen',
            'w-screen',
            'bg-gray-300',
            'flex',
            'flex-col',
            'overflow-hidden'
        ].join(' ');
    }, []);

    /**
     * 主内容区域样式类
     */
    const mainContentClasses = useMemo(() => {
        return [
            'mt-2',
            'flex-1',
            'flex',
            'flex-row',
            'overflow-hidden',
            'px-2'
        ].join(' ');
    }, []);

    // ==================== 渲染 ====================

    return (
        <div className={pageClasses}>
            {/* 页面头部 */}
            <ChartHeader />

            {/* 主内容区域 */}
            <div className={mainContentClasses}>
                {/* 左侧工具栏 */}
                <LeftSidebar />

                {/* 主图表区域 */}
                <ChartMainArea />

                {/* 右侧交易面板（条件显示） */}
                <RightTradingPanel isVisible={replay} />
            </div>
        </div>
    );
};

// ==================== 导出 ====================

export default ChartPage;