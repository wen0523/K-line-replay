import { create } from 'zustand';

type PriceState = {
  price: number;
  setPrice: (val: number) => void;
};

type PriceUpStore = {
  priceUp: boolean;
  setPriceUp: (val: boolean) => void;
}

type PriceChangeStore = {
  priceChange: number;
  setPriceChange: (val: number) => void;
}

export const usePriceUpStore = create<PriceUpStore>((set) => ({
  priceUp: true,
  setPriceUp: (val) => set({ priceUp: val }),
}))

export const usePriceChangeStore = create<PriceChangeStore>((set) => ({
  priceChange: 0,
  setPriceChange: (val) => set({ priceChange: val }),
}))

export const usePriceStore = create<PriceState>((set) => ({
  price: -1,
  setPrice: (val) => set({ price: val }),
}));
