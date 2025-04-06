import { useEffect, useState } from 'react';

//svg
import FullScreenIcon from '../svg/fullscreen';

const PartialFullscreenComponent = () => {
    const [container, setContainer] = useState<HTMLElement | null>();

    useEffect(() => {
        setContainer(document.getElementById('container'));
    }, []);

    const handleEnterFullscreen = () => {
        if (container) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.requestFullscreen) { // Firefox
                container.requestFullscreen();
            } else if ((container as any).webkitRequestFullscreen) { // Chrome, Safari and Opera
                (container as any).webkitRequestFullscreen();
            } else if ((container as any).msRequestFullscreen) { // IE/Edge
                (container as any).msRequestFullscreen();
            }
        } else {
            alert('找不到元素');
        }
    };

    return (
        <div className='size-8 hover:bg-gray-200 rounded-[6px] flex items-center justify-center'>
            <button onClick={handleEnterFullscreen}><FullScreenIcon /></button>
        </div>
    );
};

export default PartialFullscreenComponent;
