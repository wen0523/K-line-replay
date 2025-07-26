/**
 * 应用主页面
 * 提供导航到K线图表页面的入口
 * 重构后的版本，增强了用户体验和代码可读性
 */

'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';

// ==================== 类型定义 ====================

/**
 * 主页面组件属性
 */
interface HomePageProps {
    className?: string;
}

// ==================== 主页面组件 ====================

/**
 * 应用主页面组件
 */
const HomePage: React.FC<HomePageProps> = ({ className = '' }) => {
    // ==================== 路由管理 ====================

    const router = useRouter();

    // ==================== 事件处理 ====================

    /**
     * 导航到图表页面
     */
    const handleNavigateToChart = useCallback(() => {
        router.push('/chart');
    }, [router]);

    // ==================== 渲染 ====================

    return (
        <main className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
            {/* 主内容容器 */}
            <div className="text-center space-y-8 p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
                {/* 标题区域 */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-800">
                        K线回放系统
                    </h1>
                    <p className="text-lg text-gray-600">
                        专业的加密货币K线数据回放与交易模拟平台
                    </p>
                </div>

                {/* 功能特点 */}
                <div className="space-y-3 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>实时K线数据回放</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>模拟交易功能</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span>多时间周期支持</span>
                    </div>
                </div>

                {/* 导航按钮 */}
                <div className="pt-4">
                    <Button
                        color="primary"
                        size="lg"
                        className="w-full font-semibold text-lg py-6"
                        onClick={handleNavigateToChart}
                        variant="solid"
                    >
                        进入图表页面
                    </Button>
                </div>

                {/* 版本信息 */}
                <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
                    <p>K-line Replay System v1.0</p>
                    <p>Powered by Next.js & HeroUI</p>
                </div>
            </div>
        </main>
    );
};

// ==================== 导出 ====================

export default HomePage;