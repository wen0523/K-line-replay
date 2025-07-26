import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { useState } from "react";
import { useTimeStore } from "@/store/timeStore";

const SelectTime = () => {
  const [content, setContent] = useState('1D')
  const setTime = useTimeStore((sate) => sate.setTime)
  const time = useTimeStore((state) => state.time)

  return (
    <Dropdown>
        <DropdownTrigger>
            <Button
                className="text-md"
                size="sm"
            >
                {content}
            </Button>
        </DropdownTrigger>

        <DropdownMenu
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
                key="1d" 
            >
                1D
            </DropdownItem>
            <DropdownItem 
                key="4h" 
            >
                4H
            </DropdownItem>
            <DropdownItem 
                key="1h" 
            >
                1H
            </DropdownItem>
            <DropdownItem 
                key="15m" 
            >
                15m
            </DropdownItem>
            <DropdownItem 
                key="5m" 
            >
                5m
            </DropdownItem>
        </DropdownMenu>
    </Dropdown>
  )
}

export default SelectTime;