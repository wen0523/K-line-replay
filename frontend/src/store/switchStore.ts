import { create } from 'zustand';

type ReplaySwitchState = {
  startReplaySwitch: boolean;
  exitReplaySwitch: boolean;

  setStartReplaySwitch: (val: boolean) => void;
  setExitReplaySwitch: (val: boolean) => void;
}

export const useReplaySwitchStore = create<ReplaySwitchState>((set) => ({
  startReplaySwitch: false,
  exitReplaySwitch: false,
  setStartReplaySwitch: (val) => set({ startReplaySwitch: val }),  
  setExitReplaySwitch: (val) => set({ exitReplaySwitch: val }),
}));
