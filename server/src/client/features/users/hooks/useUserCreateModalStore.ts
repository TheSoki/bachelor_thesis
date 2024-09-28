import { create } from "zustand";

export const useUserCreateModalStore = create<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
}));
