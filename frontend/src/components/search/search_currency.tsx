/**
 * 加密货币搜索模态框组件
 * 提供加密货币搜索和选择功能，支持按名称和交易对符号搜索
 * 重构后的版本，增强了类型安全和代码可读性
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';

// UI组件
import { Listbox, ListboxItem, Divider, Button } from "@heroui/react";

// 图标组件
import SearchIcon from '../svg/search';
import CloseIcon from '../svg/close';

// 状态管理
import { useSymbolStore } from '@/store/symbolStore';

// 类型定义
import { CryptoCurrency } from '@/types';
import { CRYPTO_CURRENCIES } from '@/constants';

// ==================== 类型定义 ====================

interface CryptoSearchModalProps {
    className?: string;
}

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// ==================== 子组件 ====================

/**
 * 搜索输入框组件
 */
const SearchInput: React.FC<SearchInputProps> = React.memo(({
    value,
    onChange,
    placeholder = "搜索加密货币..."
}) => (
    <div className="flex items-center my-1 mx-4">
        <SearchIcon />
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="ml-3 border-none outline-none w-3/4 bg-transparent dark:text-white dark:placeholder-gray-400 text-gray-900 placeholder-gray-500"
            autoFocus
        />
    </div>
));

SearchInput.displayName = 'SearchInput';

/**
 * 加密货币列表项组件
 */
interface CryptoListItemProps {
    crypto: CryptoCurrency;
    onSelect: (crypto: CryptoCurrency) => void;
    isSelected?: boolean;
}

const CryptoListItem: React.FC<CryptoListItemProps> = React.memo(({
    crypto,
    onSelect,
    isSelected = false
}) => (
    <ListboxItem
        key={crypto.id}
        className={`rounded-none py-3 dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
        textValue={`${crypto.symbol} ${crypto.name}`}
        onPress={() => onSelect(crypto)}
    >
        <div className="mx-4 flex flex-row items-center justify-between">
            <div className="flex flex-col">
                <div className="font-bold text-[16px] dark:text-white text-gray-900">
                    {crypto.symbol}
                </div>
                <div className="text-sm dark:text-gray-300 text-gray-600">
                    {crypto.name}
                </div>
            </div>
            {isSelected && (
                <div className="text-blue-500 text-sm font-medium">
                    当前选择
                </div>
            )}
        </div>
    </ListboxItem>
));

CryptoListItem.displayName = 'CryptoListItem';

/**
 * 模态框头部组件
 */
interface ModalHeaderProps {
    onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = React.memo(({ onClose }) => (
    <div className="mb-4 mt-3 ml-6 flex items-center justify-between">
        <span className="text-xl font-bold dark:text-white text-gray-900">
            商品代码查询
        </span>
        <Button
            className="bg-transparent flex items-center justify-center mr-4" 
            size="sm"
            onPress={onClose}
            aria-label="关闭搜索框"
        >
            <CloseIcon />
        </Button>
    </div>
));

ModalHeader.displayName = 'ModalHeader';

/**
 * 模态框底部提示组件
 */
const ModalFooter: React.FC = React.memo(() => (
    <div className="bg-gray-100 dark:bg-gray-800 flex grow items-center justify-center py-4">
        <span className="text-gray-700 dark:text-gray-300 text-sm text-center px-4">
            💡 提示：只需在图表上开始输入，即可快速拉出此搜索框
        </span>
    </div>
));

ModalFooter.displayName = 'ModalFooter';

// ==================== 主组件 ====================

/**
 * 加密货币搜索模态框主组件
 */
const CryptoSearchModal: React.FC<CryptoSearchModalProps> = ({ className = '' }) => {
    // ==================== 状态管理 ====================

    // 模态框状态
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // 选中的加密货币状态
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>({
        id: 'btc',
        name: 'Bitcoin',
        symbol: 'BTCUSDT'
    });

    // Zustand状态
    const setSymbol = useSymbolStore((state) => state.setSymbol);
    const currentSymbol = useSymbolStore((state) => state.symbol);

    // ==================== 计算属性 ====================

    /**
     * 过滤后的加密货币列表
     */
    const filteredCryptos = useMemo(() => {
        if (!searchTerm.trim()) {
            return CRYPTO_CURRENCIES;
        }

        const term = searchTerm.toLowerCase().trim();
        return CRYPTO_CURRENCIES.filter(crypto =>
            crypto.name.toLowerCase().includes(term) ||
            crypto.symbol.toLowerCase().includes(term) ||
            crypto.id.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    /**
     * 格式化显示的交易对符号
     */
    const displaySymbol = useMemo(() => {
        return selectedCrypto.symbol.replace('USDT', '/USDT');
    }, [selectedCrypto.symbol]);

    // ==================== 事件处理 ====================

    /**
     * 处理加密货币选择
     */
    const handleCryptoSelect = useCallback((crypto: CryptoCurrency) => {
        const formattedSymbol = crypto.symbol.replace('USDT', '/USDT');
        
        // 只有当选择的交易对与当前不同时才更新
        if (currentSymbol !== formattedSymbol) {
            setSelectedCrypto(crypto);
            setSymbol(formattedSymbol);
            
            // 更新页面标题
            document.title = `${crypto.symbol} - K线回放交易系统`;
            
            console.log('选择了新的交易对:', formattedSymbol);
        }

        // 关闭模态框并清空搜索
        setIsOpen(false);
        setSearchTerm('');
    }, [currentSymbol, setSymbol]);

    /**
     * 处理模态框打开
     */
    const handleOpenModal = useCallback(() => {
        setIsOpen(true);
        setSearchTerm(''); // 清空之前的搜索
    }, []);

    /**
     * 处理模态框关闭
     */
    const handleCloseModal = useCallback(() => {
        setIsOpen(false);
        setSearchTerm(''); // 清空搜索
    }, []);

    /**
     * 处理模态框背景点击
     */
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        // 只有点击背景遮罩时才关闭模态框
        if (e.target === e.currentTarget) {
            handleCloseModal();
        }
        e.stopPropagation();
    }, [handleCloseModal]);

    /**
     * 处理搜索输入变化
     */
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    // ==================== 生命周期 ====================

    /**
     * 组件初始化时设置默认标题
     */
    useEffect(() => {
        document.title = 'BTCUSDT - K线回放交易系统';
    }, []);

    /**
     * 键盘事件处理（ESC关闭模态框）
     */
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                handleCloseModal();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleCloseModal]);

    // ==================== 渲染 ====================

    return (
        <>
            {/* 触发按钮 */}
            <Button
                className={`text-md ${className}`}
                size="sm"
                onPress={handleOpenModal}
                aria-label="打开加密货币搜索"
            >
                <SearchIcon />
                <span className="ml-1">{displaySymbol}</span>
            </Button>

            {/* 搜索模态框 */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="crypto-search-title"
                >
                    {/* 模态框内容 */}
                    <div
                        className="bg-white dark:bg-gray-900 rounded-lg w-3/5 max-w-2xl h-3/4 max-h-[600px] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 头部 */}
                        <ModalHeader onClose={handleCloseModal} />

                        <Divider orientation="horizontal" className="my-1" />

                        {/* 搜索输入 */}
                        <SearchInput
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="搜索加密货币名称或交易对..."
                        />

                        <Divider orientation="horizontal" className="my-1" />

                        {/* 搜索结果列表 */}
                        <div className="overflow-y-auto flex-1 min-h-0">
                            {filteredCryptos.length > 0 ? (
                                <Listbox
                                    aria-label="选择加密货币"
                                    className="px-0 dark:text-white"
                                    virtualization={{
                                        maxListboxHeight: 40000,
                                        itemHeight: 60,
                                    }}
                                >
                                    {filteredCryptos.map((crypto) => (
                                        <CryptoListItem
                                            key={crypto.id}
                                            crypto={crypto}
                                            onSelect={handleCryptoSelect}
                                            isSelected={crypto.symbol === selectedCrypto.symbol}
                                        />
                                    ))}
                                </Listbox>
                            ) : (
                                <div className="flex items-center justify-center h-32">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        未找到匹配的加密货币
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 底部提示 */}
                        <ModalFooter />
                    </div>
                </div>
            )}
        </>
    );
};

export default CryptoSearchModal;