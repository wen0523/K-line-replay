import { useEffect, useRef, useState } from 'react';

const PartialFullscreenComponent = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
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

    const handleExitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
    };

    return (
        <div>
            <button onClick={handleEnterFullscreen}>进入全屏</button>
            <button onClick={handleExitFullscreen}>退出全屏</button>
        </div>
    );
};

export default PartialFullscreenComponent;
