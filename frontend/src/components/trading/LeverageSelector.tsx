'use client'

import { Divider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"

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
        <div className="p-4 h-fit flex justify-between items-center bg-surface rounded-lg overflow-hidden">
            <Dropdown className="min-w-32 w-32 rounded-md bg-surface-secondary">
                <DropdownTrigger>
                    <Button
                        className="w-1/2 h-9 px-3 text-sm flex items-center justify-center rounded-none bg-surface-secondary text-primary hover:bg-surface-tertiary transition-colors"
                    >
                        {filterValue} <span className="ml-2 text-xs text-secondary">▼</span>
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="过滤选项"
                    onAction={(key) => setFilterValue(key as "逐仓" | "全仓")}
                    className="bg-surface-secondary"
                    disabledKeys={['全仓']}
                >
                    <DropdownItem showDivider={true} key="逐仓" className="text-center text-primary hover:bg-surface-secondary">逐仓</DropdownItem>
                    <DropdownItem description="全仓暂不支持" key="全仓" className="text-center text-primary hover:bg-surface-secondary">
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <Divider orientation="vertical" className="w-px h-6 bg-theme" />

            <Dropdown className="min-w-32 w-32 bg-surface-secondary rounded-md">
                <DropdownTrigger>
                    <Button
                        className="w-1/2 h-9 px-3 text-sm flex items-center justify-center rounded-none bg-surface-secondary text-primary hover:bg-surface-tertiary transition-colors"
                    >
                        <span className="font-medium">{leverageValue}</span> <span className="ml-2 text-xs text-secondary">▼</span>
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="杠杆选项"
                    onAction={(key) => setLeverageValue(key.toString())}
                    className="bg-surface-secondary"
                >
                    <DropdownItem key="1.00x" className="text-center text-primary hover:bg-surface-secondary">1.00x</DropdownItem>
                    <DropdownItem key="5.00x" className="text-center text-primary hover:bg-surface-secondary">5.00x</DropdownItem>
                    <DropdownItem key="10.00x" className="text-center text-primary hover:bg-surface-secondary">10.00x</DropdownItem>
                    <DropdownItem key="20.00x" className="text-center text-primary hover:bg-surface-secondary">20.00x</DropdownItem>
                    <DropdownItem key="50.00x" className="text-center text-primary hover:bg-surface-secondary">50.00x</DropdownItem>
                    <DropdownItem key="100.00x" className="text-center text-primary hover:bg-surface-secondary">100.00x</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default LeverageSelector