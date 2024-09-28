import { create } from "zustand";

export const useUserDeleteModalStore = create<{
    userId: string | null;
    setUserId: (userId: string | null) => void;
}>((set) => ({
    userId: null,
    setUserId: (userId) => set({ userId }),
}));
