'use client'

import { addToast } from "@heroui/react"
import { usePriceStore } from "@/store/priceStore"

interface OrderValidationProps {
    side: "买" | "卖"
    percentage: string
    stoploss: string
    takeprofit: string
    isshow: boolean
    leverageValue: string
    assets: number
}

export const useOrderValidation = () => {
    const price = usePriceStore(state => state.price)

    const validateOrder = ({
        side,
        percentage,
        stoploss,
        takeprofit,
        isshow,
        leverageValue,
        assets
    }: OrderValidationProps): { isValid: boolean; amount: number } => {
        // 验证输入是否为空
        if (!percentage || percentage.trim() === '') {
            addToast({
                description: "请输入开仓数量",
                color: 'warning',
            })
            return { isValid: false, amount: 0 }
        }

        // 计算订单金额
        let amount = 0
        if (percentage.includes('%')) {
            const percentValue = Number(percentage.split('%')[0])
            if (isNaN(percentValue) || percentValue <= 0) {
                addToast({
                    description: "请输入有效的百分比",
                    color: 'warning',
                })
                return { isValid: false, amount: 0 }
            }
            amount = assets * Number(leverageValue.split('.')[0]) * percentValue / 100
        } else {
            amount = Number(percentage)
            if (isNaN(amount) || amount <= 0) {
                addToast({
                    description: "请输入有效的开仓金额",
                    color: 'warning',
                })
                return { isValid: false, amount: 0 }
            }
            if (amount > assets * Number(leverageValue.split('.')[0])) {
                addToast({
                    description: "金额超过最大可开金额",
                    color: 'warning',
                })
                return { isValid: false, amount: 0 }
            }
        }

        // 验证止盈止损设置
        if (isshow) {
            if (side === '买') {
                if (stoploss && Number(stoploss) > price) {
                    addToast({
                        description: "买单，止损价格不能高于开仓价格",
                        color: 'warning',
                    })
                    return { isValid: false, amount: 0 }
                }

                if (takeprofit && Number(takeprofit) < price) {
                    addToast({
                        description: "买单，止盈价格不能低于开仓价格",
                        color: 'warning',
                    })
                    return { isValid: false, amount: 0 }
                }
            } else {
                if (stoploss && Number(stoploss) < price) {
                    addToast({
                        description: "卖单，止损价格不能低于开仓价格",
                        color: 'warning',
                    })
                    return { isValid: false, amount: 0 }
                }

                if (takeprofit && Number(takeprofit) > price) {
                    addToast({
                        description: "卖单，止盈价格不能高于开仓价格",
                        color: 'warning',
                    })
                    return { isValid: false, amount: 0 }
                }
            }
        }

        return { isValid: true, amount }
    }

    return { validateOrder }
}