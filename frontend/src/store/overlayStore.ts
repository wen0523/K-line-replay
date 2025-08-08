import { create } from 'zustand';

type OverlayState = {
    overlayId: string;
    setOverlayId: (val: string) => void;
};

export const useOverlayStore = create<OverlayState>((set) => ({
    overlayId: '',
    setOverlayId: (val) => set({ overlayId: val }),
}));