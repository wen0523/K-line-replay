import React, { useEffect, useState } from 'react';

//UI
import { Listbox, ListboxItem, Divider, Button } from "@heroui/react";

//svg
import SearchIcon from '../svg/search';
import CloseIcon from '../svg/close';

import { useSymbolStore } from '@/store/symbolStore';
import { useChartInstanceStore } from '@/store/chartInstanceStore';
// 虚拟加密货币数据
const cryptoData = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTCUSDT' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETHUSDT' },
    { id: 'bnb', name: 'Binance Coin', symbol: 'BNBUSDT' },
    { id: 'xrp', name: 'Ripple', symbol: 'XRPUSDT' },
    { id: 'ada', name: 'Cardano', symbol: 'ADAUSDT' },
    { id: 'sol', name: 'Solana', symbol: 'SOLUSDT' },
    { id: 'dot', name: 'Polkadot', symbol: 'DOTUSDT' },
    { id: 'doge', name: 'Dogecoin', symbol: 'DOGEUSDT' },
    { id: 'do', name: 'Dogecoin', symbol: 'DOGEUSDT' },
    { id: 'doe', name: 'Dogecoin', symbol: 'DOGEUSDT' },
    { id: 'doaae', name: 'Dogecoin', symbol: 'DOGEUSDT' }
];

interface Crypto {
    id: string;
    name: string;
    symbol: string;
}

const CryptoSearchModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCrypto, setSelectedCrypto] = useState({ id: 'btc', name: 'Bitcoin', symbol: 'BTCUSDT' });

    const filteredCryptos = cryptoData.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const setSymbol = useSymbolStore((state) => state.setSymbol);
    const symbol = useSymbolStore((state) => state.symbol);

    const handleCryptoSelect = (crypto: Crypto) => {
        if (symbol != crypto.symbol.replace('USDT', '/USDT')){
            setSelectedCrypto(crypto);
            document.title = crypto.symbol
            setSymbol(crypto.symbol.replace('USDT', '/USDT'));
            useChartInstanceStore.getState().chartInstance?.setSymbol({ ticker: crypto.symbol, pricePrecision: 1, volumePrecision: 0 })
        }

        setIsOpen(false);
    };

    useEffect(() => {
        document.title = 'BTCUSDT'
    }, [])

    return (
        <> 
            <Button
                className='bg-surface-secondary text-md btn-hover'
                size="sm"
                onPress={() => { setIsOpen(true) }}
            >
                <SearchIcon />
                <span>{selectedCrypto.symbol}</span>
            </Button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300"
                    onClick={(e) => {
                        // 允许点击遮罩层关闭模态框，但阻止事件冒泡到可能存在的父级可点击元素
                        if (e.target === e.currentTarget) {
                           setIsOpen(false);
                        }
                        e.stopPropagation();
                    }}
                >
                    {/* 弹出框 */}
                    <div
                        className="bg-surface rounded-xl w-3/5 h-3/4 flex flex-col card-shadow-lg border border-theme"
                        onClick={(e) => e.stopPropagation()} // 阻止点击模态框内容区关闭模态框
                    >

                        <div className='mb-4 mt-6 mx-6 flex items-center justify-between'>
                            <span className="text-xl font-bold text-primary">商品代码查询</span>
                            <Button
                                className="bg-transparent hover:bg-surface-secondary flex items-center justify-center btn-hover" 
                                size='sm'
                                onPress={() => setIsOpen(false)}
                            >
                                <CloseIcon />
                            </Button>
                        </div>

                        <Divider orientation="horizontal" className='my-2' />

                        <div className="flex items-center my-3 mx-6">
                            <SearchIcon />
                            <input
                                type='text'
                                placeholder="搜索"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='ml-3 border-none outline-none w-3/4 bg-transparent text-primary placeholder:text-secondary focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1'
                            />
                        </div>

                        <Divider orientation="horizontal" className='my-2' />

                        <div className="overflow-y-auto h-3/4">
                            <Listbox
                                aria-label="选择加密货币"
                                className='px-0 text-primary'
                                virtualization={{
                                    maxListboxHeight: 40000,
                                    itemHeight: 60,
                                }}
                            >
                                {filteredCryptos.map((crypto) => (
                                    <ListboxItem key={crypto.id}
                                        className='rounded-none py-3 hover:bg-surface-secondary transition-colors duration-200'
                                        textValue={`${crypto.symbol} ${crypto.name}`}
                                        onPress={() => handleCryptoSelect(crypto)}
                                    >
                                        <div className='mx-4 flex flex-row items-center'>
                                            <div className="font-bold text-[16px] mr-16 text-primary">{crypto.symbol}</div>
                                            <div className="text-secondary">{crypto.name}</div>
                                        </div>
                                    </ListboxItem>
                                ))}
                            </Listbox>
                        </div>

                        <div className='bg-surface-secondary flex grow items-center justify-center border-t border-theme'>
                            <span className='text-secondary text-sm'>只需在图表上开始输入，即可拉出此搜索框</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
};

export default CryptoSearchModal;