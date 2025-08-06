import { create } from 'zustand';

type ReplaySwitchState = {
  replaySwitch: boolean;
  setReplaySwitch: (val: boolean) => void;
}

type MenuSwitchState = {
  menuSwitch: boolean;
  setMenuSwitch: (val: boolean) => void;
}

export const useReplaySwitchStore = create<ReplaySwitchState>((set) => ({

  replaySwitch: false,
  setReplaySwitch: (val) => set({ replaySwitch: val }),
}));

export const useMenuSwitchStore = create<MenuSwitchState>((set) => ({

  menuSwitch: true,
  setMenuSwitch: (val) => set({ menuSwitch: val }),
}));