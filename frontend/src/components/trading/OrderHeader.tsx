'use client'

import { Card } from "@heroui/react"
import { useSymbolStore } from "@/store/symbolStore"
import { usePriceStore, usePriceUpStore, usePriceChangeStore } from "@/store/priceStore"

const OrderHeader = () => {
    const symbol = useSymbolStore(state => state.symbol)
    const price = usePriceStore(state => state.price)
    const priceUp = usePriceUpStore(state => state.priceUp)
    const priceChange = usePriceChangeStore(state => state.priceChange)

    return (
        <Card className="h-24 p-4 rounded-none rounded-tl-[6px] bg-surface border-theme">
            <div className="flex justify-between items-center">
                <div className="font-bold text-xl text-primary">{symbol}</div>
                <div className={`text-lg font-medium ${priceUp ? "text-success" : "text-danger"}`}>
                    ${price}
                </div>
            </div>
            <div className="flex justify-between items-center mt-1">
                <div className="text-secondary text-sm">Perpetual</div>
                <div className={`text-sm ${priceChange >= 0 ? "text-success" : "text-danger"}`}>
                    {priceChange}%  24h
                </div>
            </div>
        </Card>
    )
}

export default OrderHeader