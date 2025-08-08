import React, { useState } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { ChevronRightIcon } from '@heroicons/react/24/outline';

import { ToolMap, LineTypes } from '@/lib/toolMap';
import { useChartInstanceStore } from '@/store/chartInstanceStore';
import { useOverlayStore } from '@/store/overlayStore';

const Lines = () => {
    const [content, setContent] = useState<string>(LineTypes[0]);
    const chartInstance = useChartInstanceStore((state) => state.chartInstance);
    const setOverlayId = useOverlayStore((state) => state.setOverlayId);

    const Rendering = () => {
        const Component = ToolMap[content];
        return <Component />;
    }

    const drawLine = (key?: string) => {
        const name = key ? key : content;
        chartInstance?.createOverlay({
            id: name + Math.random(),
            name: name,
            onSelected: (e) => {
                setOverlayId(e.overlay.id)
            },
            onDeselected: (e) => {
                setOverlayId('')
            }
        })
    }

    return (
        <div className='flex flex-row'>
            <Button isIconOnly onPress={() => drawLine()}>
                {Rendering()}
            </Button>
            <Dropdown
                className="bg-surface-secondary rounded-md"
                // classNames={{
                //     base: '!w-4',
                //     content: '!w-4 !min-w-4'
                // }}
            >
                <DropdownTrigger>
                    <ChevronRightIcon  className='w-2 bg-surface-secondary'/>
                </DropdownTrigger>

                <DropdownMenu
                    className="bg-surface-secondary"
                    aria-label="Select Lines"
                    onAction={(key) => {
                        setContent(key.toString());
                    }}>
                    {LineTypes.map((item) => {
                        const Component = ToolMap[item];
                        return (
                            <DropdownItem
                                textValue={item}
                                className="text-center hover:bg-surface-secondary"
                                key={item}
                                onClick={() => drawLine(item)}
                            >
                                <Component />
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default Lines
