'use client'

import { v4 as uuidv4 } from 'uuid'
import { useState } from "react"
import { ToastProvider, Tabs, Tab } from "@heroui/react"

import { useSymbolStore } from "@/store/symbolStore"
import { usePriceStore } from "@/store/priceStore"
import { useOrderStore } from "@/store/orderStore"
import { useAssetsStore } from '@/store/assetsStore'

import OrderHeader from './OrderHeader'
import LeverageSelector from './LeverageSelector'
import OrderForm from './OrderForm'
import { useOrderValidation } from './OrderValidation'

const CreateOrder = () => {
    const symbol = useSymbolStore(state => state.symbol)
    const price = usePriceStore(state => state.price)
    const addOrder = useOrderStore(state => state.addOrder)
    const assets = useAssetsStore(state => state.assets)
    const setAssets = useAssetsStore(state => state.setAssets)

    const [leverageValue, setLeverageValue] = useState("10.00x")
    const [filterValue, setFilterValue] = useState<'逐仓' | '全仓'>("逐仓")
    const [percentage, setPercentage] = useState<string>('')
    const [stoploss, setStoploss] = useState<string>('')
    const [takeprofit, setTakeprofit] = useState<string>('')
    const [isshow, setIsshow] = useState(false)

    const { validateOrder } = useOrderValidation()

    const createOrder = (side: "买" | "卖") => {
        const validation = validateOrder({
            side,
            percentage,
            stoploss,
            takeprofit,
            isshow,
            leverageValue,
            assets
        })

        if (!validation.isValid) return

        const { amount } = validation

        // 计算强平价格
        let forcedliquidation = 0
        if (filterValue === '逐仓') {
            if (side === '买') {
                forcedliquidation = price - (1 / Number(leverageValue.split('.')[0])) * price
            } else {
                forcedliquidation = price + (1 / Number(leverageValue.split('.')[0])) * price
            }
            setAssets(assets - amount / Number(leverageValue.split('.')[0]))
        } else {
            forcedliquidation = -1
            setAssets(assets - amount)
        }

        const data = new Date()
        const order = {
            'id': uuidv4(),
            'symbol': symbol,
            'price': price,
            'lever': leverageValue,
            'amount': amount,
            'side': side,
            'type': filterValue,
            'stoploss': stoploss ? Number(stoploss) : -1,
            'takeprofit': takeprofit ? Number(takeprofit) : -1,
            'forcedliquidation': forcedliquidation,
            'createdAt': data.toISOString(),
        }

        addOrder(order)
    }

    return (
        <div className="flex flex-col w-80 h-full rounded-tl-[6px]">
            <ToastProvider placement='top-center' toastOffset={60} />
            
            <OrderHeader />
            
            <LeverageSelector
                leverageValue={leverageValue}
                setLeverageValue={setLeverageValue}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
            />

            <Tabs
                aria-label="交易选项"
                className="bg-white dark:bg-gray-800 h-fit w-full border-1 block grid grid-cols-2 gap-4"
                variant="underlined"
            >
                <Tab key="limit" title={<div className="py-2">限价委托</div>} className="h-full p-0">
                    <OrderForm
                        percentage={percentage}
                        setPercentage={setPercentage}
                        stoploss={stoploss}
                        setStoploss={setStoploss}
                        takeprofit={takeprofit}
                        setTakeprofit={setTakeprofit}
                        isshow={isshow}
                        setIsshow={setIsshow}
                        onBuyOrder={() => createOrder("买")}
                        onSellOrder={() => createOrder("卖")}
                        leverageValue={leverageValue}
                        isMarketOrder={false}
                    />
                </Tab>

                <Tab key="market" title={<div className="py-2">市价委托</div>} className="h-full p-0">
                    <OrderForm
                        percentage={percentage}
                        setPercentage={setPercentage}
                        stoploss={stoploss}
                        setStoploss={setStoploss}
                        takeprofit={takeprofit}
                        setTakeprofit={setTakeprofit}
                        isshow={isshow}
                        setIsshow={setIsshow}
                        onBuyOrder={() => createOrder("买")}
                        onSellOrder={() => createOrder("卖")}
                        leverageValue={leverageValue}
                        isMarketOrder={true}
                    />
                </Tab>
            </Tabs>
        </div>
    )
}

export default CreateOrder
                        