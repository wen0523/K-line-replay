import { Button } from '@heroui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useChartInstanceStore } from '@/store/chartInstanceStore';
import { useOverlayStore } from '@/store/overlayStore';


const DeleteOverlay = () => {
    const chartInstance = useChartInstanceStore((state) => state.chartInstance);
    const setOverlayId = useOverlayStore((state) => state.setOverlayId);

    const deleteOverlay = () => {
        if (!useOverlayStore.getState().overlayId) {
            return;
        }

        chartInstance?.removeOverlay({
            id: useOverlayStore.getState().overlayId
        });
        setOverlayId('');
    }
    return (
        <Button isIconOnly onPress={deleteOverlay}>
            <TrashIcon className='w-6 h-6'/>
        </Button>
    )
}

export default DeleteOverlay;

