import { create } from 'zustand';
import { Chart } from 'klinecharts';


type ChartInstanceState = {
    chartInstance: Chart | null;
    setChartInstance: (val: Chart | null) => void;
};

export const useChartInstanceStore = create<ChartInstanceState>((set) => ({
    chartInstance: null,
    setChartInstance: (val) => set({ chartInstance: val }),
}));
