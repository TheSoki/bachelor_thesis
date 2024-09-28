import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { UserCreate } from "./UserCreate";
import { useCallback } from "react";
import { useUserCreateModalStore } from "../../hooks/useUserCreateModalStore";

export const UserCreateModal = () => {
    const isOpen = useUserCreateModalStore((state) => state.isOpen);
    const setIsOpen = useUserCreateModalStore((state) => state.setIsOpen);
    const onCreate = useCallback(() => setIsOpen(false), [setIsOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                <UserCreate onCreate={onCreate} />
            </DialogContent>
        </Dialog>
    );
};
