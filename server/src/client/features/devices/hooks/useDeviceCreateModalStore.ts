import { create } from "zustand";

export const useDeviceCreateModalStore = create<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
}));
