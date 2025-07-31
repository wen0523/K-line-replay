import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { useState } from "react";
import { useTimeStore } from "@/store/timeStore";

const SelectTime = () => {
    const [content, setContent] = useState('1D')
    const setTime = useTimeStore((sate) => sate.setTime)
    const time = useTimeStore((state) => state.time)

    return (
        <Dropdown
            className="bg-surface-secondary rounded-md"
            classNames={{
                base: '!w-[100px]',
                content: '!w-[100px] !min-w-[100px]'
            }}
        >
            <DropdownTrigger>
                <Button
                    className="bg-surface-secondary text-md"
                    size="sm"
                >
                    {content}
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                className="bg-surface-secondary"
                aria-label="Select Time"
                onAction={(key) => {
                    if (key.toString() === time) return;
                    setTime(key.toString())
                    if (key.toString().includes('m')) {
                        setContent(key.toString());
                    } else {
                        setContent(key.toString().toUpperCase());
                    }
                }}>
                <DropdownItem
                    className="text-center hover:bg-surface-secondary"
                    key="1d"
                >
                    1D
                </DropdownItem>
                <DropdownItem
                    className="text-center hover:bg-surface-secondary"
                    key="4h"
                >
                    4H
                </DropdownItem>
                <DropdownItem
                    className="text-center hover:bg-surface-secondary"
                    key="1h"
                >
                    1H
                </DropdownItem>
                <DropdownItem
                    className="text-center hover:bg-surface-secondary"
                    key="15m"
                >
                    15m
                </DropdownItem>
                <DropdownItem
                    className="text-center hover:bg-surface-secondary"
                    key="5m"
                >
                    5m
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default SelectTime;