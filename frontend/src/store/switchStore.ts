import { create } from 'zustand';

type ReplaySwitchState = {
  startReplaySwitch: boolean;
  exitReplaySwitch: boolean;

  setStartReplaySwitch: (val: boolean) => void;
  setExitReplaySwitch: (val: boolean) => void;
}

type HiddenOverlayState = {
    hiddenOverlay: boolean;
    setHiddenOverlay: (val: boolean) => void;
}

export const useReplaySwitchStore = create<ReplaySwitchState>((set) => ({
  startReplaySwitch: false,
  exitReplaySwitch: false,
  setStartReplaySwitch: (val) => set({ startReplaySwitch: val }),  
  setExitReplaySwitch: (val) => set({ exitReplaySwitch: val }),
}));

export const useHiddenOverlayStore = create<HiddenOverlayState>((set) => ({
    hiddenOverlay: false,
    setHiddenOverlay: (val) => set({ hiddenOverlay: val }),
}));

