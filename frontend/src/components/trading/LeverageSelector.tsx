'use client'

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"

interface LeverageSelectorProps {
    leverageValue: string
    setLeverageValue: (value: string) => void
    filterValue: '逐仓' | '全仓'
    setFilterValue: (value: '逐仓' | '全仓') => void
}

const LeverageSelector = ({ 
    leverageValue, 
    setLeverageValue, 
    filterValue, 
    setFilterValue 
}: LeverageSelectorProps) => {
    return (
        <div className="h-fit flex justify-between items-center">
            <Dropdown className="min-w-32 w-32 rounded-md">
                <DropdownTrigger>
                    <Button
                        className="w-1/2 h-9 px-3 text-sm flex border-r border-white dark:border-gray-400 items-center justify-between rounded-none"
                    >
                        {filterValue} <span className="ml-2 text-xs opacity-70">▼</span>
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="过滤选项"
                    onAction={(key) => setFilterValue(key as "逐仓" | "全仓")}
                >
                    <DropdownItem key="逐仓" className="text-center">逐仓</DropdownItem>
                    <DropdownItem key="全仓" className="text-center">全仓</DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <Dropdown className="min-w-32 w-32 rounded-md">
                <DropdownTrigger>
                    <Button
                        className="border-l border-white dark:border-gray-400 w-1/2 h-9 px-3 text-sm flex items-center justify-between rounded-none"
                    >
                        <span className="font-medium">{leverageValue}</span> <span className="ml-2 text-xs opacity-70">▼</span>
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="杠杆选项"
                    onAction={(key) => setLeverageValue(key.toString())}
                >
                    <DropdownItem key="1.00x" className="text-center">1.00x</DropdownItem>
                    <DropdownItem key="5.00x" className="text-center">5.00x</DropdownItem>
                    <DropdownItem key="10.00x" className="text-center">10.00x</DropdownItem>
                    <DropdownItem key="20.00x" className="text-center">20.00x</DropdownItem>
                    <DropdownItem key="50.00x" className="text-center">50.00x</DropdownItem>
                    <DropdownItem key="100.00x" className="text-center">100.00x</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default LeverageSelector