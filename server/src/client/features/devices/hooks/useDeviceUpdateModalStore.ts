import { create } from "zustand";

export const useDeviceUpdateModalStore = create<{
    deviceId: string | null;
    setDeviceId: (deviceId: string | null) => void;
}>((set) => ({
    deviceId: null,
    setDeviceId: (deviceId) => set({ deviceId }),
}));
