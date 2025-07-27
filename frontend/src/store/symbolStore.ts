import { create } from 'zustand';

type SymbolState = {
  symbol: string;
  setSymbol: (val: string) => void;
};

export const useSymbolStore = create<SymbolState>((set) => ({
  symbol: 'BTC/USDT',
  setSymbol: (val) => set({ symbol: val }),
}));
