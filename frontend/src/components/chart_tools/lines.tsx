import React, { useState } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { ChevronRightIcon } from '@heroicons/react/24/outline';

import { ToolMap, LineTypes } from '@/lib/toolMap';
import { useChartInstanceStore } from '@/store/chartInstanceStore';
import { useOverlayStore } from '@/store/overlayStore';
import { useHiddenOverlayStore } from '@/store/switchStore';


const Lines = () => {
    const [content, setContent] = useState<string>(LineTypes[0]);
    const chartInstance = useChartInstanceStore((state) => state.chartInstance);
    const setOverlayId = useOverlayStore((state) => state.setOverlayId);
    const setHiddenOverlay = useHiddenOverlayStore((state) => state.setHiddenOverlay);

    const Rendering = () => {
        const Component = ToolMap[content];
        return <Component />;
    }

    const drawLine = (key?: string) => {

        // 当overlay为隐藏状态时，切换为显示状态
        const hiddenOverlay = useHiddenOverlayStore.getState().hiddenOverlay;
        if (hiddenOverlay) {
            chartInstance?.overrideOverlay({
                groupId: 'overlay',
                visible: hiddenOverlay
            })
            setHiddenOverlay(!hiddenOverlay)
        }

        const name = key ? key : content;
        chartInstance?.createOverlay({
            id: name + Math.random(),
            name: name,
            groupId: 'overlay',

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
                placement='right'
                className="bg-surface-secondary rounded-md"
            // classNames={{
            //     base: '!w-4',
            //     content: '!w-4 !min-w-4'
            // }}
            >
                <DropdownTrigger>
                    <div className='flex flex-row items-center'>
                        <ChevronRightIcon className='w-2 bg-surface-secondary' />
                    </div>
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
                                className="hover:bg-surface-secondary"
                                key={item}
                                onClick={() => drawLine(item)}
                            >
                                <div className='flex flex-row items-center'>
                                    <Component />
                                    <span className='ml-2'>{item}</span>
                                </div>
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default Lines
