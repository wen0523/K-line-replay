import React, { useState } from 'react';

//UI
import { Listbox, ListboxItem, Divider } from "@heroui/react";

//svg
import SearchIcon from '../svg/search';
import CloseIcon from '../svg/close';

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

    const handleCryptoSelect = (crypto: Crypto) => {
        setSelectedCrypto(crypto);
        setIsOpen(false);
    };

    return (
        <div className='w-32 h-8 bg-blue-200 rounded-[6px] flex flex-row items-center hover:bg-gray-200'
            onClick={() => { setIsOpen(true) }}>
            <SearchIcon />
            <button className='truncate pl-1'>{selectedCrypto.symbol}</button>
            {isOpen && (
                // 遮罩层
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation(); // 阻止点击事件冒泡到父组件
                        setIsOpen(false);
                    }}
                >
                    {/* 弹出框 */}
                    <div
                        className="bg-white rounded-lg w-3/5 h-3/4 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className='my-4 mx-6 flex items-center justify-between'>
                            <span className="text-xl font-bold">商品代码查询</span>
                            <button
                                className="size-8 rounded-md hover:bg-gray-300 flex items-center justify-center"
                                onClick={() => setIsOpen(false)}
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <Divider orientation="horizontal" className='my-1' />

                        <div className="flex items-center my-1 mx-4">
                            <SearchIcon />
                            <input
                                type='text'
                                placeholder="搜索"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='ml-3 bordrer-none outline-none w-3/4'
                            />
                        </div>

                        <Divider orientation="horizontal" className='my-1' />

                        <div className="overflow-y-auto h-3/4">
                            <Listbox
                                className='px-0'
                            // virtualization={{
                            //     maxListboxHeight: 40000,
                            //     itemHeight: 60,
                            // }}
                            >
                                {filteredCryptos.map((crypto) => (
                                    <ListboxItem key={crypto.id}
                                        className='rounded-none py-3'
                                    >
                                        <div className='mx-4 flex flex-row items-center'
                                            onClick={() => handleCryptoSelect(crypto)}>
                                            <div className="font-bold text-[16px] mr-16">{crypto.symbol}</div>
                                            <div >{crypto.name}</div>
                                        </div>
                                    </ListboxItem>
                                ))}
                            </Listbox>
                        </div>

                        <div className='bg-gray-100 flex flex-1 items-center justify-center'>
                            <span className='text-gray-700 text-sm'>只需在图表上开始输入，即可拉出此搜索框</span>
                        </div>
                    </div>

                </div>)}
        </div>)

};

export default CryptoSearchModal;