import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, PressEvent } from "@heroui/react";
import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom"

const SelectTime = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [content, setContent] = useState('1d')

    return (
        <Dropdown>
            <DropdownTrigger className="bg-gray-100 hover:bg-gray-300 border-none h-8 rounded-[6px] text-md">
                <Button variant="bordered">{content}</Button>
            </DropdownTrigger>
            <DropdownMenu 
            onAction={(key) => {
                setContent(key.toString())
                setSearchParams({ currency: searchParams.get("currency") || "BTC/USDT", timeRange: key.toString() });
            }}>
                <DropdownItem key="1d">1D</DropdownItem>
                <DropdownItem key="4h">4H</DropdownItem>
                <DropdownItem key="1h">1H</DropdownItem>
                <DropdownItem key="15m">15m</DropdownItem>
                <DropdownItem key="5m">5m</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default SelectTime;