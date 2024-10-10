import { useAuth } from "@/client/hooks/useAuth";
import { Button } from "@/client/shadcn/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/client/shadcn/ui/dialog";
import { trpc } from "@/utils/trpc";
import { useCallback, useMemo } from "react";
import { useUserDeleteModalStore } from "../../hooks/useUserDeleteModalStore";
import { createToast } from "@/client/utils/createToast";

export const UserDeleteModal = () => {
    const { session, handleSignOut } = useAuth();
    const utils = trpc.useUtils();
    const userId = useUserDeleteModalStore((state) => state.userId);
    const setUserId = useUserDeleteModalStore((state) => state.setUserId);

    const deleteUser = trpc.user.delete.useMutation({
        async onSuccess() {
            await utils.user.list.invalidate();
            createToast("User deleted successfully", "success");
            setUserId(null);
        },
        onError(error) {
            createToast(`Failed to delete user: ${error.message}`, "error");
        },
    });

    const onDeleteClick = useCallback(async () => {
        if (!userId) return;
        try {
            const isUpdatedCurrentUser = userId === session.data?.user.id;
            await deleteUser.mutateAsync({
                id: userId,
            });

            if (isUpdatedCurrentUser) {
                await handleSignOut();
            }
        } catch (error) {
            console.error({ error }, "Failed to delete user");
        }
    }, [deleteUser, handleSignOut, userId, session.data?.user.id]);

    const open = useMemo(() => !!userId, [userId]);

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
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you absolutely sure? This action cannot be undone. This will permanently delete this account
                        from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="submit" onClick={onDeleteClick} variant="destructive">
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
