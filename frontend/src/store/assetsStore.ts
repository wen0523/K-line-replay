import { create } from 'zustand';

type AssetsState = {
    assets: number;
    setAssets: (val: number) => void;
};

export const useAssetsStore = create<AssetsState>((set) => ({
    assets: 100,
    setAssets: (val) => set({ assets: val }),
}));