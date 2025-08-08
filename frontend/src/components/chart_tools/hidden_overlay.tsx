import { useState } from 'react';

import { Button } from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useChartInstanceStore } from '@/store/chartInstanceStore';
import { useHiddenOverlayStore } from '@/store/switchStore';

const HiddenOverlay = () => {
    const chartInstance = useChartInstanceStore((state) => state.chartInstance);
    const isHidden = useHiddenOverlayStore((state) => state.hiddenOverlay);
    const setHiddenOverlay = useHiddenOverlayStore((state) => state.setHiddenOverlay);

    const hiddenOverlay = () => {
        chartInstance?.overrideOverlay({
            groupId:'overlay',
            visible:isHidden
        })
        setHiddenOverlay(!isHidden)
    }
    return (
        <Button isIconOnly onPress={hiddenOverlay}>
            {isHidden?<EyeSlashIcon className='w-6 h-6'/>:<EyeIcon className='w-6 h-6'/>}
        </Button>
    )
}

export default HiddenOverlay;
