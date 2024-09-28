import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/shadcn/ui/dialog";
import { UserUpdate } from "./UserUpdate";
import { useCallback, useMemo } from "react";
import { useUserUpdateModalStore } from "../../hooks/useUserUpdateModalStore";

export const UserUpdateModal = () => {
    const userId = useUserUpdateModalStore((state) => state.userId);
    const setUserId = useUserUpdateModalStore((state) => state.setUserId);

    const open = useMemo(() => !!userId, [userId]);
    const onUpdate = useCallback(() => setUserId(null), [setUserId]);

    const onOpenChange = useCallback(
        (isOpen: boolean) => {
            setUserId(isOpen ? userId : null);
        },
        [userId, setUserId],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update User</DialogTitle>
                </DialogHeader>
                {userId && <UserUpdate id={userId} onUpdate={onUpdate} />}
            </DialogContent>
        </Dialog>
    );
};
